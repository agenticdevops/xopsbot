import * as p from '@clack/prompts';
import pc from 'picocolors';
import type { ProviderChoice } from '../types';

/**
 * LLM provider options for the wizard.
 */
export const PROVIDER_OPTIONS = [
  { value: 'anthropic', label: 'Anthropic (Claude)', hint: 'claude-sonnet-4-5' },
  { value: 'openai', label: 'OpenAI (ChatGPT)', hint: 'gpt-4o' },
  { value: 'google', label: 'Google (Gemini)', hint: 'gemini-2.5-pro' },
];

/**
 * Default model strings in OpenClaw format (provider/model-name).
 */
const DEFAULT_MODELS: Record<string, string> = {
  anthropic: 'anthropic/claude-sonnet-4-5',
  openai: 'openai/gpt-4o',
  google: 'google/gemini-2.5-pro',
};

/**
 * Environment variable names for each provider's API key.
 */
const ENV_KEY_MAP: Record<string, string> = {
  anthropic: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
  google: 'GOOGLE_API_KEY',
};

/**
 * Prompt user to select an LLM provider and detect API key in environment.
 *
 * This step does NOT collect credentials directly. It detects existing
 * API keys in environment variables and guides users to set them via
 * `export` or `openclaw login` if missing.
 *
 * @returns The provider choice with detection status, or a cancel symbol.
 */
export async function connectProvider(): Promise<ProviderChoice | symbol> {
  const provider = await p.select({
    message: 'Select your LLM provider',
    options: PROVIDER_OPTIONS,
    initialValue: 'anthropic',
  });

  if (p.isCancel(provider)) return provider;

  const providerStr = provider as string;
  const model = DEFAULT_MODELS[providerStr] || 'anthropic/claude-sonnet-4-5';
  const envKey = ENV_KEY_MAP[providerStr];
  const hasKey = envKey ? !!process.env[envKey] : false;

  if (hasKey) {
    p.log.success(pc.green(`${envKey} detected in environment`));
  } else {
    p.note(
      `Authenticate with your ${PROVIDER_OPTIONS.find((o) => o.value === providerStr)?.label ?? providerStr} subscription:\n  openclaw login\n\nOr set an API key directly:\n  export ${envKey}="your-key-here"`,
      'Authentication',
    );
  }

  return { provider: providerStr, model, apiKeySet: hasKey };
}
