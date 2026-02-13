import JSON5 from 'json5';
import type { WizardResults } from '../types';
import {
  safetyModeToExecConfig,
  SAFE_MODE_TOOL_DENY,
  getAuditConfig,
} from '../../safety';
import type { SafetyMode } from '../../schemas/profile.schema';

/**
 * Channel-specific token environment variable names.
 */
const CHANNEL_ENV_VARS: Record<string, string> = {
  telegram: 'TELEGRAM_BOT_TOKEN',
  discord: 'DISCORD_BOT_TOKEN',
  slack: 'SLACK_BOT_TOKEN',
  msteams: 'MSTEAMS_BOT_TOKEN',
};

/**
 * Tool-specific environment variable names for common configuration.
 */
const TOOL_ENV_VARS: Record<string, Record<string, string>> = {
  kubectl: { KUBECONFIG: '~/.kube/config' },
  docker: { DOCKER_HOST: 'unix:///var/run/docker.sock' },
  aws: { AWS_PROFILE: 'default', AWS_REGION: 'us-east-1' },
  terraform: { TF_WORKSPACE: 'default' },
  ansible: { ANSIBLE_CONFIG: '~/.ansible.cfg' },
};

/** Prefix used for all xopsbot agent IDs */
const XOPS_AGENT_PREFIX = 'xops-';

/**
 * Generate an OpenClaw configuration from wizard results.
 *
 * When an existing config is provided, merges xopsbot agents into it
 * instead of replacing the entire file. Existing non-xopsbot agents,
 * channels, bindings, env vars, and unknown top-level keys are preserved.
 *
 * @param results - Wizard selections
 * @param existingConfig - Parsed existing openclaw.json (if any)
 * @returns JSON5 config string
 */
export function generateOpenClawConfig(
  results: WizardResults,
  existingConfig?: Record<string, unknown>
): string {
  const { workspaces, channels, tools, safetyMode, provider } = results;

  // Cast safetyMode to SafetyMode type for safety module functions
  const mode = safetyMode as SafetyMode;

  // Build xopsbot agent entries from workspaces
  const xopsAgents = workspaces.map((ws) => ({
    id: `${XOPS_AGENT_PREFIX}${ws.replace('-agent', '')}`,
    name: ws
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' '),
    default: false, // Will be set below based on merge logic
    workspace: `~/.xopsbot/workspaces/${ws}`,
    tools: {
      profile: 'coding',
      deny: mode === 'safe' ? SAFE_MODE_TOOL_DENY : [],
    },
  }));

  // Merge agent lists: preserve existing non-xopsbot agents
  let mergedAgentList: Array<Record<string, unknown>>;
  const existingAgents = (existingConfig?.agents as Record<string, unknown>)?.list;
  if (Array.isArray(existingAgents)) {
    const nonXopsAgents = existingAgents.filter(
      (a: Record<string, unknown>) =>
        typeof a.id === 'string' && !a.id.startsWith(XOPS_AGENT_PREFIX)
    );
    const hasExistingDefault = nonXopsAgents.some(
      (a: Record<string, unknown>) => a.default === true
    );
    if (!hasExistingDefault && xopsAgents.length > 0) {
      xopsAgents[0].default = true;
    }
    mergedAgentList = [...nonXopsAgents, ...xopsAgents];
  } else {
    // No existing agents -- first xopsbot agent is default
    if (xopsAgents.length > 0) {
      xopsAgents[0].default = true;
    }
    mergedAgentList = xopsAgents;
  }

  // Build channels config with placeholder tokens
  const channelsConfig: Record<string, { enabled: boolean; token: string }> = {};
  for (const ch of channels) {
    const envVar = CHANNEL_ENV_VARS[ch] || `${ch.toUpperCase()}_TOKEN`;
    channelsConfig[ch] = {
      enabled: true,
      token: `<${envVar}>`,
    };
  }

  // Build env vars from tools
  const newEnv: Record<string, string> = {};
  for (const tool of tools) {
    const toolEnv = TOOL_ENV_VARS[tool];
    if (toolEnv) {
      Object.assign(newEnv, toolEnv);
    }
  }

  // Merge with existing config if present
  const existingChannels =
    existingConfig?.channels && typeof existingConfig.channels === 'object'
      ? (existingConfig.channels as Record<string, unknown>)
      : {};
  const existingBindings = Array.isArray(existingConfig?.bindings)
    ? existingConfig.bindings
    : [];
  const existingEnv =
    existingConfig?.env && typeof existingConfig.env === 'object'
      ? (existingConfig.env as Record<string, string>)
      : {};

  // Merge skills.load.extraDirs without duplicates
  const existingSkills = existingConfig?.skills as Record<string, unknown> | undefined;
  const existingLoad = existingSkills?.load as Record<string, unknown> | undefined;
  const existingExtraDirs = Array.isArray(existingLoad?.extraDirs)
    ? (existingLoad.extraDirs as string[])
    : [];
  const xopsSkillsDir = '~/.xopsbot/skills';
  const mergedExtraDirs = existingExtraDirs.includes(xopsSkillsDir)
    ? existingExtraDirs
    : [...existingExtraDirs, xopsSkillsDir];

  // Start from existing config to preserve unknown top-level keys
  const config: Record<string, unknown> = {
    ...(existingConfig || {}),
    agents: {
      defaults: {
        model: { primary: provider.model },
        sandbox: { mode: 'off' },
        tools: {
          exec: safetyModeToExecConfig(mode),
        },
      },
      list: mergedAgentList,
    },
    channels: { ...existingChannels, ...channelsConfig },
    bindings: existingBindings,
    skills: {
      load: {
        extraDirs: mergedExtraDirs,
        watch: true,
      },
    },
    logging: getAuditConfig(mode !== 'full'),
    env: { ...existingEnv, ...newEnv },
  };

  return JSON5.stringify(config, null, 2);
}

/**
 * Count non-xopsbot agents preserved from an existing config.
 */
export function countPreservedAgents(
  existingConfig: Record<string, unknown>
): { count: number; names: string[] } {
  const existingAgents = (existingConfig?.agents as Record<string, unknown>)?.list;
  if (!Array.isArray(existingAgents)) return { count: 0, names: [] };

  const preserved = existingAgents.filter(
    (a: Record<string, unknown>) =>
      typeof a.id === 'string' && !a.id.startsWith(XOPS_AGENT_PREFIX)
  );
  return {
    count: preserved.length,
    names: preserved.map((a: Record<string, unknown>) => String(a.id || a.name || 'unknown')),
  };
}
