import * as p from '@clack/prompts';
import pc from 'picocolors';
import { printBanner } from './banner';
import { runWelcome } from './steps/welcome';
import { selectWorkspaces } from './steps/workspaces';
import { selectChannels } from './steps/channels';
import { selectTools } from './steps/tools';
import { selectSafetyMode } from './steps/safety';
import { connectProvider } from './steps/provider';
import { generateConfig } from './steps/generate';
import { isFirstRun } from './utils/first-run';
import type { WizardResults, ProviderChoice } from './types';
import type { SafetyMode } from '../schemas/profile.schema';

export { isFirstRun };

export async function runWizard() {
  printBanner();
  p.intro(pc.cyan('xops.bot setup wizard'));

  // Intro
  await runWelcome();

  // Selection 1: Workspaces
  const workspaces = await selectWorkspaces();
  if (p.isCancel(workspaces)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  // Selection 2: Channels
  const channels = await selectChannels();
  if (p.isCancel(channels)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  // Selection 3: Tools
  const tools = await selectTools();
  if (p.isCancel(tools)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  // Selection 4: Safety mode
  const safetyMode = await selectSafetyMode();
  if (p.isCancel(safetyMode)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  // Selection 5: LLM Provider
  const provider = await connectProvider();
  if (p.isCancel(provider)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }
  const providerResult = provider as ProviderChoice;

  // Build results
  const results: WizardResults = {
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
