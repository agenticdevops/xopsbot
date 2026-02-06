/**
 * CLI command to switch safety modes at runtime.
 *
 * Updates the active profile's safety mode and regenerates:
 * - profile.json (safety.mode field)
 * - openclaw.json (exec config and agent deny lists)
 * - exec-approvals.json (binary allowlists)
 *
 * @module cli/safety-switch
 */

import * as fs from 'fs';
import * as path from 'path';
import pc from 'picocolors';
import JSON5 from 'json5';
import { SafetyModeSchema, type SafetyMode } from '../schemas/profile.schema';
import {
  safetyModeToExecConfig,
  generateExecApprovals,
  getAuditConfig,
  SAFE_MODE_TOOL_DENY,
} from '../safety';

const XOPSBOT_HOME = path.join(process.env.HOME || '~', '.xopsbot');
const OPENCLAW_HOME = path.join(process.env.HOME || '~', '.openclaw');

/**
 * Mode descriptions for user feedback.
 */
const MODE_DESCRIPTIONS: Record<SafetyMode, string> = {
  safe: 'Read-only mode. All mutations are blocked.',
  standard: 'Approval mode. Mutations require explicit approval.',
  full: 'Full access mode. No approval required. Development only.',
};

/**
 * Profile structure (minimal subset for type safety).
 */
interface ProfileData {
  name: string;
  safety: {
    mode: SafetyMode;
    audit_logging: boolean;
  };
  [key: string]: unknown;
}

/**
 * OpenClaw config structure (minimal subset for type safety).
 */
interface OpenClawConfig {
  agents?: {
    defaults?: {
      tools?: {
        exec?: Record<string, unknown>;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };
    list?: Array<{
      id: string;
      tools?: {
        deny?: string[];
        [key: string]: unknown;
      };
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };
  logging?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Resolves the active profile and returns its data and path.
 *
 * @returns Profile data, profile path, and profile name
 * @throws Error if no active profile exists
 */
function resolveActiveProfile(): {
  profile: ProfileData;
  profilePath: string;
  profileName: string;
} {
  const activeProfilePath = path.join(XOPSBOT_HOME, 'active-profile');

  // Default to 'dev' if no active-profile file exists
  let profileName = 'dev';
  if (fs.existsSync(activeProfilePath)) {
    profileName = fs.readFileSync(activeProfilePath, 'utf-8').trim();
  }

  const profilePath = path.join(XOPSBOT_HOME, 'profiles', profileName, 'profile.json');

  if (!fs.existsSync(profilePath)) {
    throw new Error(
      `No profile found at ${profilePath}. Run the setup wizard first: bun run xopsbot/wizard/index.ts`
    );
  }

  const profile = JSON5.parse(fs.readFileSync(profilePath, 'utf-8')) as ProfileData;

  return { profile, profilePath, profileName };
}

/**
 * Loads the OpenClaw configuration file.
 *
 * @returns Parsed OpenClaw config
 * @throws Error if config file doesn't exist
 */
function loadOpenClawConfig(): OpenClawConfig {
  const configPath = path.join(OPENCLAW_HOME, 'openclaw.json');

  if (!fs.existsSync(configPath)) {
    throw new Error(
      `No OpenClaw config found at ${configPath}. Run the setup wizard first.`
    );
  }

  return JSON5.parse(fs.readFileSync(configPath, 'utf-8')) as OpenClawConfig;
}

/**
 * Switches the active safety mode at runtime.
 *
 * This command:
 * 1. Validates the mode argument
 * 2. Updates the active profile's safety.mode
 * 3. Regenerates openclaw.json with updated exec config
 * 4. Regenerates exec-approvals.json with updated allowlists
 *
 * @param newMode - The safety mode to switch to (safe, standard, full)
 */
export function switchSafetyMode(newMode: string): void {
  // Validate mode input
  const parseResult = SafetyModeSchema.safeParse(newMode);
  if (!parseResult.success) {
    console.error(pc.red(`Invalid safety mode: ${newMode}`));
    console.error(pc.dim('Valid options: safe, standard, full'));
    process.exit(1);
  }

  const mode = parseResult.data;

  // Resolve active profile
  let profile: ProfileData;
  let profilePath: string;
  let profileName: string;

  try {
    ({ profile, profilePath, profileName } = resolveActiveProfile());
  } catch (error) {
    console.error(pc.red((error as Error).message));
    process.exit(1);
  }

  const previousMode = profile.safety.mode;

  // Update profile safety mode
  profile.safety.mode = mode;

  // Write updated profile
  fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2) + '\n');

  // Load and update OpenClaw config
  let openclawConfig: OpenClawConfig;
  try {
    openclawConfig = loadOpenClawConfig();
  } catch (error) {
    console.error(pc.red((error as Error).message));
    process.exit(1);
  }

  // Ensure agents structure exists
  if (!openclawConfig.agents) {
    openclawConfig.agents = {};
  }
  if (!openclawConfig.agents.defaults) {
    openclawConfig.agents.defaults = {};
  }
  if (!openclawConfig.agents.defaults.tools) {
    openclawConfig.agents.defaults.tools = {};
  }

  // Update exec config
  const execConfig = safetyModeToExecConfig(mode);
  openclawConfig.agents.defaults.tools.exec = execConfig;

  // Update agent deny lists
  const denyList = mode === 'safe' ? [...SAFE_MODE_TOOL_DENY] : [];
  if (openclawConfig.agents.list) {
    for (const agent of openclawConfig.agents.list) {
      if (!agent.tools) {
        agent.tools = {};
      }
      agent.tools.deny = denyList;
    }
  }

  // Update logging config based on audit setting
  // In full mode, audit logging is typically off; otherwise respect profile setting
  const auditEnabled = mode !== 'full' && profile.safety.audit_logging;
  openclawConfig.logging = getAuditConfig(auditEnabled);

  // Write updated OpenClaw config
  const openclawConfigPath = path.join(OPENCLAW_HOME, 'openclaw.json');
  fs.writeFileSync(openclawConfigPath, JSON5.stringify(openclawConfig, null, 2) + '\n');

  // Generate and write exec-approvals.json
  const agentIds = (openclawConfig.agents.list || []).map((agent) => agent.id);
  const execApprovals = generateExecApprovals(mode, agentIds);
  const execApprovalsPath = path.join(OPENCLAW_HOME, 'exec-approvals.json');
  fs.writeFileSync(execApprovalsPath, JSON.stringify(execApprovals, null, 2) + '\n', {
    mode: 0o600,
  });

  // Print success message
  console.log();
  console.log(
    pc.green(`Safety mode switched: ${pc.bold(previousMode)} -> ${pc.bold(mode)}`)
  );
  console.log(pc.dim(`  ${MODE_DESCRIPTIONS[mode]}`));
  console.log();
  console.log(pc.dim('Updated files:'));
  console.log(pc.dim(`  - ${profilePath}`));
  console.log(pc.dim(`  - ${openclawConfigPath}`));
  console.log(pc.dim(`  - ${execApprovalsPath}`));
  console.log();
  console.log(
    pc.yellow('Note: Restart OpenClaw gateway for changes to take effect.')
  );
}

// Run if executed directly: bun run xopsbot/cli/safety-switch.ts <mode>
if (import.meta.main) {
  const mode = process.argv[2];
  if (!mode) {
    console.error('Usage: bun run xopsbot/cli/safety-switch.ts <safe|standard|full>');
    process.exit(1);
  }
  switchSafetyMode(mode);
}
