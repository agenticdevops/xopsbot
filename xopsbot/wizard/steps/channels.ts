import * as p from '@clack/prompts';

/**
 * Available communication channels that xops.bot can connect to.
 * Channels are optional -- the TUI works without any channels enabled.
 */
export const AVAILABLE_CHANNELS = [
  { value: 'telegram', label: 'Telegram', hint: 'Popular for personal bots' },
  { value: 'discord', label: 'Discord', hint: 'Great for team servers' },
  { value: 'slack', label: 'Slack', hint: 'Enterprise team communication' },
  { value: 'msteams', label: 'Microsoft Teams', hint: 'Microsoft 365 integration' },
];

/**
 * Prompt the user to select communication channels.
 * Returns selected channel values or a cancel symbol.
 * Channels are not required -- users can skip this step.
 */
export async function selectChannels(): Promise<string[] | symbol> {
  return p.multiselect({
    message: 'Which communication channels should xops.bot connect to?',
    options: AVAILABLE_CHANNELS,
    required: false,
  });
}
