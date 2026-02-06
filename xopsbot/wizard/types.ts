import type { SafetyMode } from '../schemas/profile.schema';

/**
 * Provider choice from the wizard's LLM provider step.
 */
export interface ProviderChoice {
  /** Provider identifier (e.g., 'anthropic', 'openai', 'google') */
  provider: string;
  /** Model string in OpenClaw format (e.g., 'anthropic/claude-sonnet-4-5') */
  model: string;
  /** Whether the API key was detected in environment */
  apiKeySet: boolean;
}

/**
 * Bundled output from all wizard steps.
 * This is the single typed object passed to config generation.
 */
export interface WizardResults {
  /** Selected preset name, or undefined if custom */
  preset?: string;
  /** Selected agent workspaces (e.g., ['k8s-agent', 'rca-agent']) */
  workspaces: string[];
  /** Selected communication channels (e.g., ['telegram', 'slack']) */
  channels: string[];
  /** Selected DevOps tools (e.g., ['kubectl', 'docker']) */
  tools: string[];
  /** Selected safety mode */
  safetyMode: SafetyMode;
  /** Selected LLM provider and model */
  provider: ProviderChoice;
}
