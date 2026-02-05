import * as p from '@clack/prompts';

export async function runWelcome() {
  p.note(
    `This wizard will walk you through 5 quick selections:

  1. Select agent workspaces to enable
  2. Choose communication channels
  3. Pick your DevOps tools
  4. Set a safety mode
  5. Connect your LLM provider

Then it will generate your configuration at:
  ~/.openclaw/openclaw.json
  ~/.xopsbot/workspaces/`,
    'Welcome'
  );
}
