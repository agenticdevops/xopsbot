/**
 * CLI command to manage xopsbot presets.
 *
 * Subcommands:
 * - list             List available presets with active indicator
 * - show <name>      Show preset details (plugins, workspaces, tools, safety)
 * - apply <name>     Apply a preset (install plugins, write active-preset marker)
 *
 * Presets bundle plugins, workspaces, tools, and safety mode for
 * role-based quick setup (DevOps, SRE, Platform Engineer).
 *
 * @module cli/preset
 */

import * as fs from 'fs';
import * as path from 'path';
import pc from 'picocolors';
import { PRESET_MAP, ALL_PRESETS } from '../presets';
import { pluginInstall } from './plugin';

const XOPSBOT_HOME = path.join(process.env.HOME || '~', '.xopsbot');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Reads the currently active preset name from the marker file.
 * Returns null if no preset has been applied.
 */
function readActivePreset(): string | null {
  try {
    return fs
      .readFileSync(path.join(XOPSBOT_HOME, 'active-preset'), 'utf-8')
      .trim();
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Subcommands
// ---------------------------------------------------------------------------

/**
 * Lists all available presets with an active indicator.
 */
export function presetList(): void {
  const active = readActivePreset();

  console.log();
  console.log(pc.bold('Presets'));
  console.log();

  for (const preset of ALL_PRESETS) {
    const isActive = preset.name === active;
    const indicator = isActive ? pc.green('>') : ' ';
    const activeTag = isActive ? pc.green(' (active)') : '';

    console.log(
      `  ${indicator} ${pc.bold(preset.name.padEnd(20))} ${preset.label}${activeTag}`
    );
    console.log(`    ${pc.dim(preset.description)}`);
    console.log(
      `    ${pc.dim(`Plugins: ${preset.plugins.join(', ')}  |  Tools: ${preset.tools.join(', ')}`)}`
    );
    console.log();
  }
}

/**
 * Shows detailed information about a specific preset.
 *
 * @param name - Preset name to display (must exist in PRESET_MAP)
 */
export function presetShow(name: string): void {
  const preset = PRESET_MAP[name];
  if (!preset) {
    console.error(pc.red(`Unknown preset: ${name}`));
    process.exit(1);
  }

  console.log();
  console.log(pc.bold(preset.label));
  console.log(pc.dim(preset.description));
  console.log();
  console.log(`  Plugins:    ${preset.plugins.join(', ')}`);
  console.log(`  Workspaces: ${preset.workspaces.join(', ')}`);
  console.log(`  Tools:      ${preset.tools.join(', ')}`);
  console.log(`  Safety:     ${preset.safetyMode}`);
  console.log();
}

/**
 * Applies a preset by installing its plugins and writing the active-preset marker.
 *
 * For each plugin in the preset, calls pluginInstall (which is idempotent --
 * already-installed plugins print a message and return). After all plugins
 * are installed, writes the active-preset marker file.
 *
 * @param name - Preset name to apply (must exist in PRESET_MAP)
 */
export function presetApply(name: string): void {
  const preset = PRESET_MAP[name];
  if (!preset) {
    console.error(pc.red(`Unknown preset: ${name}`));
    console.error(pc.dim('Available presets:'));
    for (const p of ALL_PRESETS) {
      console.error(pc.dim(`  - ${p.name}: ${p.description}`));
    }
    process.exit(1);
  }

  console.log();
  console.log(pc.bold(`Applying preset: ${preset.label}`));
  console.log();

  // Install all preset plugins (idempotent)
  for (const pluginName of preset.plugins) {
    pluginInstall(pluginName);
  }

  // Write active-preset marker
  fs.mkdirSync(XOPSBOT_HOME, { recursive: true });
  fs.writeFileSync(
    path.join(XOPSBOT_HOME, 'active-preset'),
    preset.name,
    'utf-8'
  );

  console.log();
  console.log(pc.green(`Preset applied: ${pc.bold(preset.name)}`));
  console.log(pc.dim(`  Workspaces: ${preset.workspaces.join(', ')}`));
  console.log(pc.dim(`  Tools:      ${preset.tools.join(', ')}`));
  console.log(pc.dim(`  Safety:     ${preset.safetyMode}`));
  console.log();
  console.log(
    pc.yellow('Note: Restart OpenClaw gateway for changes to take effect.')
  );
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

function printUsage(): void {
  console.log();
  console.log(
    pc.bold('Usage:') + ' bun run xopsbot/cli/preset.ts <command> [name]'
  );
  console.log();
  console.log(pc.bold('Commands:'));
  console.log('  list             List available presets');
  console.log('  show <name>      Show preset details');
  console.log(
    '  apply <name>     Apply a preset (install plugins, update config)'
  );
  console.log();
  console.log(pc.bold('Available presets:'));
  for (const p of ALL_PRESETS) {
    console.log(`  ${p.name.padEnd(20)} ${pc.dim(p.description)}`);
  }
  console.log();
}

if (import.meta.main) {
  const subcommand = process.argv[2];
  const presetName = process.argv[3];

  if (!subcommand) {
    printUsage();
    process.exit(0);
  }

  switch (subcommand) {
    case 'list':
      presetList();
      break;

    case 'show':
      if (!presetName) {
        console.error(pc.red('Preset name required.'));
        console.error(
          pc.dim('Usage: bun run xopsbot/cli/preset.ts show <name>')
        );
        process.exit(1);
      }
      presetShow(presetName);
      break;

    case 'apply':
      if (!presetName) {
        console.error(pc.red('Preset name required.'));
        console.error(
          pc.dim('Usage: bun run xopsbot/cli/preset.ts apply <name>')
        );
        process.exit(1);
      }
      presetApply(presetName);
      break;

    default:
      console.error(pc.red(`Unknown command: ${subcommand}`));
      printUsage();
      process.exit(1);
  }
}
