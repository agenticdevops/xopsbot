import * as p from '@clack/prompts';
import pc from 'picocolors';
import * as fs from 'fs';
import * as path from 'path';
import JSON5 from 'json5';
import { generateOpenClawConfig, countPreservedAgents } from '../templates/openclaw.json5';
import { generateExecApprovals } from '../../safety';
import type { WizardResults } from '../types';
import type { SafetyMode } from '../../schemas/profile.schema';

const XOPSBOT_HOME = path.join(process.env.HOME || '~', '.xopsbot');
const OPENCLAW_HOME = path.join(process.env.HOME || '~', '.openclaw');
const TEMPLATE_DIR = path.join(__dirname, '../../');

/**
 * Human-readable explanations of each safety mode.
 */
const safetyExplanation: Record<string, string> = {
  safe: 'Read-only. All mutations blocked.',
  standard: 'Mutations require your approval.',
  full: 'All operations run without prompts.',
};

export async function generateConfig(results: WizardResults) {
  const spinner = p.spinner();
  spinner.start('Generating configuration...');

  try {
    // 1. Create directories
    fs.mkdirSync(path.join(XOPSBOT_HOME, 'workspaces'), { recursive: true });
    fs.mkdirSync(path.join(XOPSBOT_HOME, 'skills'), { recursive: true });
    fs.mkdirSync(OPENCLAW_HOME, { recursive: true });

    // 2. Copy workspace templates
    for (const ws of results.workspaces) {
      const src = path.join(TEMPLATE_DIR, 'workspaces', ws);
      const dest = path.join(XOPSBOT_HOME, 'workspaces', ws);
      copyDirSync(src, dest);
    }

    // 3. Check for existing OpenClaw config and merge if present
    const openclawConfigPath = path.join(OPENCLAW_HOME, 'openclaw.json');
    let existingConfig: Record<string, unknown> | undefined;
    let preservedAgents: { count: number; names: string[] } = { count: 0, names: [] };

    if (fs.existsSync(openclawConfigPath)) {
      try {
        existingConfig = JSON5.parse(
          fs.readFileSync(openclawConfigPath, 'utf-8')
        ) as Record<string, unknown>;
        preservedAgents = countPreservedAgents(existingConfig);
      } catch {
        // If the existing config is malformed, start fresh
        existingConfig = undefined;
      }
    }

    const openclawConfig = generateOpenClawConfig(results, existingConfig);

    // 4. Write openclaw.json
    fs.writeFileSync(openclawConfigPath, openclawConfig, 'utf-8');

    // 4b. Generate and write exec-approvals.json
    const agentIds = results.workspaces.map(
      (ws) => `xops-${ws.replace('-agent', '')}`
    );
    const execApprovals = generateExecApprovals(
      results.safetyMode as SafetyMode,
      agentIds
    );
    fs.writeFileSync(
      path.join(OPENCLAW_HOME, 'exec-approvals.json'),
      JSON.stringify(execApprovals, null, 2),
      { mode: 0o600 } // Restrictive permissions -- security-sensitive file
    );

    spinner.stop(
      existingConfig
        ? 'Configuration merged with existing openclaw.json!'
        : 'Configuration generated!'
    );

    // 5. Build summary
    const channelList =
      results.channels.length > 0
        ? results.channels.join(', ')
        : 'none (TUI only)';

    // Save active-preset marker if a preset was selected
    if (results.preset) {
      fs.writeFileSync(
        path.join(XOPSBOT_HOME, 'active-preset'),
        results.preset,
        'utf-8'
      );
    }

    const summaryLines = [
      // If a preset was selected, show it first
      ...(results.preset
        ? [`Preset:     ${pc.cyan(results.preset)}`]
        : []),
      `Workspaces: ${pc.cyan(results.workspaces.join(', '))}`,
      `Channels:   ${pc.cyan(channelList)}`,
      `Tools:      ${pc.cyan(results.tools.join(', '))}`,
      `Safety:     ${pc.cyan(results.safetyMode)} - ${safetyExplanation[results.safetyMode]}`,
      `Provider:   ${pc.cyan(results.provider.model)}`,
      // Show preserved agents if merging with existing config
      ...(preservedAgents.count > 0
        ? [
            '',
            `${pc.green(`Preserved ${preservedAgents.count} existing agent(s):`)} ${pc.cyan(preservedAgents.names.join(', '))}`,
          ]
        : []),
      '',
      existingConfig ? 'Files updated:' : 'Files created:',
      `  ${pc.dim('~/.openclaw/openclaw.json')}`,
      `  ${pc.dim('~/.openclaw/exec-approvals.json')}`,
      `  ${pc.dim('~/.xopsbot/workspaces/*')}`,
      ...(results.preset
        ? [`  ${pc.dim('~/.xopsbot/active-preset')}`]
        : []),
    ];

    // Channel token setup instructions
    if (results.channels.length > 0) {
      summaryLines.push('');
      summaryLines.push(pc.yellow('Next steps for channel setup:'));
      for (const ch of results.channels) {
        const envVar = `${ch.toUpperCase()}_BOT_TOKEN`;
        summaryLines.push(`  export ${envVar}="your-${ch}-token"`);
      }
    }

    // Provider API key reminder
    if (!results.provider.apiKeySet) {
      summaryLines.push('');
      summaryLines.push(pc.yellow('Set your API key:'));
      summaryLines.push(
        `  export ${results.provider.provider.toUpperCase()}_API_KEY="your-key"`
      );
    }

    p.note(summaryLines.join('\n'), 'Summary');
  } catch (err) {
    spinner.stop('Failed to generate configuration');
    throw err;
  }
}

function copyDirSync(src: string, dest: string) {
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
