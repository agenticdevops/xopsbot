import * as p from '@clack/prompts';
import pc from 'picocolors';
import { printBanner } from './banner';
import { runWelcome } from './steps/welcome';
import { selectWorkspaces } from './steps/workspaces';
import { selectProfile } from './steps/profile';
import { generateConfig } from './steps/generate';

export async function runWizard() {
  printBanner();
  p.intro(pc.cyan('xops.bot setup wizard'));

  // Step 1: Welcome
  await runWelcome();

  // Step 2: Select workspaces
  const workspaces = await selectWorkspaces();
  if (p.isCancel(workspaces)) {
    p.cancel('Setup cancelled');
    process.exit(0);
  }

  // Step 3: Select profile
  const profile = await selectProfile();
  if (p.isCancel(profile)) {
    p.cancel('Setup cancelled');
    process.exit(0);
  }

  // Step 4: Generate config
  await generateConfig(workspaces, profile);

  p.outro(pc.green('xops.bot is ready! Run `openclaw` to start.'));
}

// Run if executed directly
runWizard().catch(console.error);
