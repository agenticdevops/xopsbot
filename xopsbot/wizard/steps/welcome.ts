import * as p from '@clack/prompts';

export async function runWelcome() {
  p.note(
    `This wizard will walk you through 6 quick selections:

  1. Choose a role preset (or customize from scratch)
  2. Select agent workspaces to enable
  3. Choose communication channels
  4. Pick your DevOps tools
  5. Set a safety mode
  6. Connect your LLM provider

Then it will generate your configuration at:
  ~/.openclaw/openclaw.json
  ~/.xopsbot/workspaces/`,
    'Welcome'
  );
}
