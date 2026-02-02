import * as p from '@clack/prompts';
import pc from 'picocolors';

export async function runWelcome() {
  p.note(
    `${pc.bold('xops.bot')} - DevOps agent powered by OpenClaw

This wizard will help you:
1. Select which agent workspaces to enable
2. Choose a safety profile (dev/stage/prod)
3. Generate your OpenClaw configuration

Your configuration will be saved to:
  ~/.openclaw/openclaw.json
  ~/.xopsbot/workspaces/
  ~/.xopsbot/profiles/`,
    'Welcome'
  );
}
