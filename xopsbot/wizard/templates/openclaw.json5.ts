import JSON5 from 'json5';
import type { WizardResults } from '../types';

/**
 * Channel-specific token environment variable names.
 */
const CHANNEL_ENV_VARS: Record<string, string> = {
  telegram: 'TELEGRAM_BOT_TOKEN',
  discord: 'DISCORD_BOT_TOKEN',
  slack: 'SLACK_BOT_TOKEN',
  msteams: 'MSTEAMS_BOT_TOKEN',
};

/**
 * Tool-specific environment variable names for common configuration.
 */
const TOOL_ENV_VARS: Record<string, Record<string, string>> = {
  kubectl: { KUBECONFIG: '~/.kube/config' },
  docker: { DOCKER_HOST: 'unix:///var/run/docker.sock' },
  aws: { AWS_PROFILE: 'default', AWS_REGION: 'us-east-1' },
  terraform: { TF_WORKSPACE: 'default' },
  ansible: { ANSIBLE_CONFIG: '~/.ansible.cfg' },
};

/**
 * Generate an OpenClaw configuration from wizard results.
 *
 * Produces a JSON5 config string with:
 * - Agent list built from selected workspaces
 * - Channels section with placeholder tokens
 * - Tool-specific environment variables
 * - Selected provider model as default primary model
 * - Safety mode applied to tool deny lists
 */
export function generateOpenClawConfig(results: WizardResults): string {
  const { workspaces, channels, tools, safetyMode, provider } = results;

  // Build agent list from workspaces
  const agentList = workspaces.map((ws, index) => ({
    id: `xops-${ws.replace('-agent', '')}`,
    name: ws
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' '),
    default: index === 0,
    workspace: `~/.xopsbot/workspaces/${ws}`,
    tools: {
      profile: 'coding',
      deny: safetyMode === 'safe' ? ['exec', 'write', 'edit'] : [],
    },
  }));

  // Build channels config with placeholder tokens
  const channelsConfig: Record<string, { enabled: boolean; token: string }> = {};
  for (const ch of channels) {
    const envVar = CHANNEL_ENV_VARS[ch] || `${ch.toUpperCase()}_TOKEN`;
    channelsConfig[ch] = {
      enabled: true,
      token: `<${envVar}>`,
    };
  }

  // Build env vars from tools
  const env: Record<string, string> = {};
  for (const tool of tools) {
    const toolEnv = TOOL_ENV_VARS[tool];
    if (toolEnv) {
      Object.assign(env, toolEnv);
    }
  }

  const config: Record<string, unknown> = {
    agents: {
      defaults: {
        model: { primary: provider.model },
        sandbox: { mode: 'off' },
      },
      list: agentList,
    },
    channels: channelsConfig,
    bindings: [],
    skills: {
      load: {
        extraDirs: ['~/.xopsbot/skills'],
        watch: true,
      },
    },
    env,
  };

  return JSON5.stringify(config, null, 2);
}
