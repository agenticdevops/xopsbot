import { z } from 'zod';

/**
 * Safety mode determines how mutations are handled.
 * - safe: Read-only operations only. All mutations blocked with explanation.
 * - standard: Mutations require explicit approval. Default for production.
 * - full: All operations allowed without prompts. Development only.
 */
export const SafetyModeSchema = z.enum(['safe', 'standard', 'full']);

/**
 * Binding connects a channel/peer to a specific agent.
 */
export const BindingSchema = z.object({
  /** Channel type (e.g., slack, telegram, discord) */
  channel: z.string(),
  /** Optional peer identifier within the channel (e.g., channel name, user ID) */
  peer: z.string().optional(),
  /** Agent ID to route messages to */
  agentId: z.string(),
});

/**
 * Safety configuration for a profile.
 */
export const SafetyConfigSchema = z.object({
  /** Safety mode for this environment */
  mode: SafetyModeSchema,
  /** Whether to log all command executions for audit */
  audit_logging: z.boolean().default(true),
});

/**
 * Profile represents an environment configuration (WHERE + HOW SAFELY).
 * Profiles define environment-specific settings that apply to workspaces.
 */
export const ProfileSchema = z.object({
  /** Profile name (e.g., dev, stage, prod) */
  name: z.string().min(1).max(50),
  /** Human-readable description of this profile */
  description: z.string().optional(),

  /** Environment variables to set when using this profile */
  environment: z.record(z.string()).default({}),

  /** Safety configuration */
  safety: SafetyConfigSchema,

  /** List of workspace names that are active in this profile */
  active_workspaces: z.array(z.string()).min(1),

  /** Channel-to-agent bindings for this profile */
  bindings: z.array(BindingSchema).default([]),
});

// Type exports
export type SafetyMode = z.infer<typeof SafetyModeSchema>;
export type Binding = z.infer<typeof BindingSchema>;
export type SafetyConfig = z.infer<typeof SafetyConfigSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
