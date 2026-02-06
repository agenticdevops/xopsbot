import * as p from '@clack/prompts';
import pc from 'picocolors';
import { printBanner } from './banner';
import { runWelcome } from './steps/welcome';
import { selectPreset } from './steps/preset';
import { selectWorkspaces } from './steps/workspaces';
import { selectChannels } from './steps/channels';
import { selectTools } from './steps/tools';
import { selectSafetyMode } from './steps/safety';
import { connectProvider } from './steps/provider';
import { generateConfig } from './steps/generate';
import { isFirstRun } from './utils/first-run';
import { PRESET_MAP } from '../presets';
import type { PresetDefinition } from '../presets';
import { pluginInstall } from '../cli/plugin';
import type { WizardResults, ProviderChoice } from './types';
import type { SafetyMode } from '../schemas/profile.schema';

export { isFirstRun };

export async function runWizard() {
  printBanner();
  p.intro(pc.cyan('xops.bot setup wizard'));

  // Intro
  await runWelcome();

  // Selection 1: Role preset
  const presetChoice = await selectPreset();
  if (p.isCancel(presetChoice)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }
  const preset: PresetDefinition | null =
    presetChoice !== 'custom' ? PRESET_MAP[presetChoice as string] ?? null : null;

  // Selection 2: Workspaces (pre-populated from preset)
  const workspaces = await selectWorkspaces(
    preset?.workspaces ? [...preset.workspaces] : undefined
  );
  if (p.isCancel(workspaces)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  // Selection 3: Channels
  const channels = await selectChannels();
  if (p.isCancel(channels)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  // Selection 4: Tools (pre-populated from preset)
  const tools = await selectTools(
    preset?.tools ? [...preset.tools] : undefined
  );
  if (p.isCancel(tools)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  // Selection 5: Safety mode (pre-populated from preset)
  const safetyMode = await selectSafetyMode(preset?.safetyMode);
  if (p.isCancel(safetyMode)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  // Selection 6: LLM Provider
  const provider = await connectProvider();
  if (p.isCancel(provider)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }
  const providerResult = provider as ProviderChoice;

  // Install preset plugins before config generation
  if (preset) {
    const pluginSpinner = p.spinner();
    pluginSpinner.start('Installing preset plugins...');
    for (const pluginName of preset.plugins) {
      pluginInstall(pluginName);
    }
    pluginSpinner.stop('Preset plugins installed');
  }

  // Build results
  const results: WizardResults = {
    preset: preset?.name,
    workspaces: workspaces as string[],
    channels: channels as string[],
    tools: tools as string[],
    safetyMode: safetyMode as SafetyMode,
    provider: providerResult,
  };

  // Generate config
  await generateConfig(results);

  p.outro(pc.green("xops.bot is ready! Run `openclaw` to start."));
}

// Run if executed directly
runWizard().catch(console.error);
