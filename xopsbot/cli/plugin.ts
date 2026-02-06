/**
 * CLI command to manage xopsbot plugins.
 *
 * Subcommands:
 * - install <name>  Install a plugin (copies skills, updates registry)
 * - remove <name>   Remove a plugin (deletes skills, updates registry)
 * - list            List all plugins with installed/enabled status
 * - enable <name>   Enable an installed plugin
 * - disable <name>  Disable an installed plugin without removing it
 *
 * After any state change, exec-approvals.json is regenerated
 * to reflect the current set of enabled plugin tools.
 *
 * @module cli/plugin
 */

import * as fs from 'fs';
import * as path from 'path';
import pc from 'picocolors';
import { PLUGIN_MAP, ALL_PLUGINS } from '../plugins';
import type { PluginManifest } from '../plugins';
import {
  loadRegistry,
  installPlugin,
  removePlugin,
  enablePlugin,
  disablePlugin,
  isInstalled,
} from '../plugins/registry';
import { resolveDependencies } from '../plugins/resolve-dependencies';
import { generateExecApprovals } from '../safety';
import type { SafetyMode } from '../schemas/profile.schema';

const XOPSBOT_HOME = path.join(process.env.HOME || '~', '.xopsbot');
const OPENCLAW_HOME = path.join(process.env.HOME || '~', '.openclaw');
const PLUGINS_DIR = path.join(XOPSBOT_HOME, 'plugins');
const TEMPLATE_DIR = path.join(__dirname, '../');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Recursively copies a directory tree from src to dest.
 * Creates dest if it does not exist.
 */
function copyDirSync(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Recursively removes a directory and all its contents.
 * No-op if the directory does not exist.
 */
function removeDirSync(dir: string): void {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Reads the active safety mode from the profile.
 * Defaults to 'standard' if no profile exists.
 */
function readSafetyMode(): SafetyMode {
  try {
    const activeProfilePath = path.join(XOPSBOT_HOME, 'active-profile');
    let profileName = 'dev';
    if (fs.existsSync(activeProfilePath)) {
      profileName = fs.readFileSync(activeProfilePath, 'utf-8').trim();
    }

    const profilePath = path.join(
      XOPSBOT_HOME,
      'profiles',
      profileName,
      'profile.json'
    );
    if (fs.existsSync(profilePath)) {
      const profile = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
      if (profile?.safety?.mode) {
        return profile.safety.mode as SafetyMode;
      }
    }
  } catch {
    // Fall through to default
  }
  return 'standard';
}

/**
 * Regenerates exec-approvals.json based on currently enabled plugins.
 *
 * Collects all tool binary patterns from enabled plugins, reads the
 * active safety mode, and writes the updated approvals file.
 */
function regenerateExecApprovals(): void {
  const mode = readSafetyMode();

  // Collect agent IDs from enabled plugins' workspaces
  const registry = loadRegistry(PLUGINS_DIR);
  const enabledWorkspaces = new Set<string>();
  for (const [name, entry] of Object.entries(registry.plugins)) {
    if (entry.enabled && PLUGIN_MAP[name]) {
      for (const ws of PLUGIN_MAP[name].workspaces) {
        enabledWorkspaces.add(ws);
      }
    }
  }
  const agentIds = Array.from(enabledWorkspaces).map(
    (ws) => `xops-${ws.replace('-agent', '')}`
  );

  const execApprovals = generateExecApprovals(mode, agentIds);
  const execApprovalsPath = path.join(OPENCLAW_HOME, 'exec-approvals.json');

  fs.mkdirSync(OPENCLAW_HOME, { recursive: true });
  fs.writeFileSync(
    execApprovalsPath,
    JSON.stringify(execApprovals, null, 2) + '\n',
    { mode: 0o600 }
  );
}

// ---------------------------------------------------------------------------
// Subcommands
// ---------------------------------------------------------------------------

/**
 * Installs a plugin by name.
 *
 * Resolves dependencies (topological order), copies skills to shared
 * and workspace-specific directories, updates the registry, and
 * regenerates exec-approvals.json.
 *
 * @param name - Plugin name (must exist in PLUGIN_MAP)
 */
export function pluginInstall(name: string): void {
  const manifest = PLUGIN_MAP[name];
  if (!manifest) {
    console.error(pc.red(`Unknown plugin: ${name}`));
    console.error(pc.dim('Available plugins:'));
    for (const p of ALL_PLUGINS) {
      console.error(pc.dim(`  - ${p.name}: ${p.description}`));
    }
    process.exit(1);
  }

  // Resolve install order (dependencies first)
  const installedSet = new Set<string>();
  const registry = loadRegistry(PLUGINS_DIR);
  for (const pluginName of Object.keys(registry.plugins)) {
    installedSet.add(pluginName);
  }

  const allPluginsMap = new Map<string, PluginManifest>(
    ALL_PLUGINS.map((p) => [p.name, p])
  );
  const installOrder = resolveDependencies(name, allPluginsMap, installedSet);

  if (installOrder.length === 0) {
    console.log(pc.yellow(`Plugin ${pc.bold(name)} is already installed.`));
    return;
  }

  let totalSkills = 0;
  let totalTools = 0;

  for (const pluginName of installOrder) {
    const pluginManifest = PLUGIN_MAP[pluginName];
    if (!pluginManifest) continue;

    // Check if already installed (dependency may already exist)
    if (isInstalled(PLUGINS_DIR, pluginName)) {
      console.log(pc.dim(`  ${pluginName} already installed, skipping`));
      continue;
    }

    // Copy skills to shared directory
    for (const skill of pluginManifest.skills) {
      const src = path.join(TEMPLATE_DIR, 'skills', skill);
      const dest = path.join(XOPSBOT_HOME, 'skills', skill);
      if (fs.existsSync(src)) {
        copyDirSync(src, dest);
      }
    }

    // Copy skills to workspace-specific directories
    for (const workspace of pluginManifest.workspaces) {
      for (const skill of pluginManifest.skills) {
        const src = path.join(TEMPLATE_DIR, 'skills', skill);
        const dest = path.join(
          XOPSBOT_HOME,
          'workspaces',
          workspace,
          'skills',
          skill
        );
        if (fs.existsSync(src)) {
          copyDirSync(src, dest);
        }
      }
    }

    // Update registry
    installPlugin(PLUGINS_DIR, pluginManifest);
    totalSkills += pluginManifest.skills.length;
    totalTools += pluginManifest.tools.length;

    if (pluginName !== name) {
      console.log(
        pc.dim(
          `  Installed dependency: ${pluginName} (${pluginManifest.skills.length} skills)`
        )
      );
    }
  }

  // Regenerate exec-approvals
  regenerateExecApprovals();

  console.log();
  console.log(
    pc.green(
      `Installed ${pc.bold(name)} plugin (${totalSkills} skills, ${totalTools} tools)`
    )
  );
}

/**
 * Removes a plugin by name.
 *
 * Checks for dependent plugins, removes skills from shared and
 * workspace directories, updates the registry, and regenerates
 * exec-approvals.json.
 *
 * @param name - Plugin name to remove
 */
export function pluginRemove(name: string): void {
  const manifest = PLUGIN_MAP[name];
  if (!manifest) {
    console.error(pc.red(`Unknown plugin: ${name}`));
    process.exit(1);
  }

  if (!isInstalled(PLUGINS_DIR, name)) {
    console.log(pc.yellow(`Plugin ${pc.bold(name)} is not installed.`));
    return;
  }

  // Check if any other installed plugin depends on this one
  const registry = loadRegistry(PLUGINS_DIR);
  const dependents: string[] = [];
  for (const installedName of Object.keys(registry.plugins)) {
    if (installedName === name) continue;
    const installedManifest = PLUGIN_MAP[installedName];
    if (installedManifest?.dependencies.includes(name)) {
      dependents.push(installedName);
    }
  }

  if (dependents.length > 0) {
    console.error(
      pc.red(
        `Cannot remove ${pc.bold(name)}: required by ${dependents.join(', ')}`
      )
    );
    console.error(pc.dim(`Remove dependent plugins first.`));
    process.exit(1);
  }

  // Remove skills from shared directory
  for (const skill of manifest.skills) {
    removeDirSync(path.join(XOPSBOT_HOME, 'skills', skill));
  }

  // Remove skills from workspace directories
  for (const workspace of manifest.workspaces) {
    for (const skill of manifest.skills) {
      removeDirSync(
        path.join(XOPSBOT_HOME, 'workspaces', workspace, 'skills', skill)
      );
    }
  }

  // Update registry
  removePlugin(PLUGINS_DIR, name);

  // Regenerate exec-approvals
  regenerateExecApprovals();

  console.log();
  console.log(pc.green(`Removed ${pc.bold(name)} plugin`));
}

/**
 * Lists all available plugins with their installed/enabled status.
 */
export function pluginList(): void {
  const registry = loadRegistry(PLUGINS_DIR);

  console.log();
  console.log(pc.bold('Plugins'));
  console.log();

  for (const plugin of ALL_PLUGINS) {
    const entry = registry.plugins[plugin.name];

    let status: string;
    let indicator: string;

    if (entry) {
      if (entry.enabled) {
        indicator = pc.green('*');
        status = pc.green('installed, enabled');
      } else {
        indicator = pc.yellow('o');
        status = pc.yellow('installed, disabled');
      }
    } else {
      indicator = pc.dim('-');
      status = pc.dim('not installed');
    }

    console.log(
      `  ${indicator} ${pc.bold(plugin.name.padEnd(16))} ${status}`
    );
    console.log(`    ${pc.dim(plugin.description)}`);
    console.log(
      `    ${pc.dim(`Skills: ${plugin.skills.join(', ')}  |  Tools: ${plugin.tools.join(', ')}`)}`
    );
    console.log();
  }
}

/**
 * Enables an installed plugin.
 *
 * @param name - Plugin name to enable
 */
export function pluginEnable(name: string): void {
  if (!PLUGIN_MAP[name]) {
    console.error(pc.red(`Unknown plugin: ${name}`));
    process.exit(1);
  }

  try {
    enablePlugin(PLUGINS_DIR, name);
  } catch (error) {
    console.error(pc.red((error as Error).message));
    process.exit(1);
  }

  regenerateExecApprovals();

  console.log(pc.green(`Enabled ${pc.bold(name)} plugin`));
}

/**
 * Disables an installed plugin without removing it.
 *
 * @param name - Plugin name to disable
 */
export function pluginDisable(name: string): void {
  if (!PLUGIN_MAP[name]) {
    console.error(pc.red(`Unknown plugin: ${name}`));
    process.exit(1);
  }

  try {
    disablePlugin(PLUGINS_DIR, name);
  } catch (error) {
    console.error(pc.red((error as Error).message));
    process.exit(1);
  }

  regenerateExecApprovals();

  console.log(pc.green(`Disabled ${pc.bold(name)} plugin`));
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

function printUsage(): void {
  console.log();
  console.log(pc.bold('Usage:') + ' bun run xopsbot/cli/plugin.ts <command> [name]');
  console.log();
  console.log(pc.bold('Commands:'));
  console.log('  install <name>   Install a plugin');
  console.log('  remove <name>    Remove a plugin');
  console.log('  list             List all plugins');
  console.log('  enable <name>    Enable an installed plugin');
  console.log('  disable <name>   Disable an installed plugin');
  console.log();
  console.log(pc.bold('Available plugins:'));
  for (const p of ALL_PLUGINS) {
    console.log(`  ${p.name.padEnd(16)} ${pc.dim(p.description)}`);
  }
  console.log();
}

if (import.meta.main) {
  const subcommand = process.argv[2];
  const pluginName = process.argv[3];

  if (!subcommand) {
    printUsage();
    process.exit(0);
  }

  switch (subcommand) {
    case 'install':
      if (!pluginName) {
        console.error(pc.red('Plugin name required.'));
        console.error(pc.dim('Usage: bun run xopsbot/cli/plugin.ts install <name>'));
        process.exit(1);
      }
      pluginInstall(pluginName);
      break;

    case 'remove':
      if (!pluginName) {
        console.error(pc.red('Plugin name required.'));
        console.error(pc.dim('Usage: bun run xopsbot/cli/plugin.ts remove <name>'));
        process.exit(1);
      }
      pluginRemove(pluginName);
      break;

    case 'list':
      pluginList();
      break;

    case 'enable':
      if (!pluginName) {
        console.error(pc.red('Plugin name required.'));
        console.error(pc.dim('Usage: bun run xopsbot/cli/plugin.ts enable <name>'));
        process.exit(1);
      }
      pluginEnable(pluginName);
      break;

    case 'disable':
      if (!pluginName) {
        console.error(pc.red('Plugin name required.'));
        console.error(pc.dim('Usage: bun run xopsbot/cli/plugin.ts disable <name>'));
        process.exit(1);
      }
      pluginDisable(pluginName);
      break;

    default:
      console.error(pc.red(`Unknown command: ${subcommand}`));
      printUsage();
      process.exit(1);
  }
}
