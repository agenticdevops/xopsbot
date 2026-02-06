import { z } from 'zod';
import { SafetyModeSchema } from '../schemas/profile.schema';

/**
 * Schema for a preset definition declaration.
 * Defines which plugins, workspaces, tools, and safety mode a role-based
 * preset configures. Presets are static data objects -- no dynamic loading
 * or code execution.
 */
export const PresetDefinitionSchema = z.object({
  /** Preset identifier (e.g., "devops", "sre", "platform-engineer") */
  name: z.string(),
  /** Human-readable label for display (e.g., "DevOps Starter") */
  label: z.string(),
  /** Description of what this preset configures and who it is for */
  description: z.string(),
  /** Plugin names to install (must exist in PLUGIN_MAP) */
  plugins: z.array(z.string()),
  /** Workspace names to activate */
  workspaces: z.array(z.string()),
  /** Default safety mode for this preset */
  safetyMode: SafetyModeSchema,
  /** Tool binary names enabled by this preset */
  tools: z.array(z.string()),
  /** Default channels (empty = user picks) */
  channels: z.array(z.string()),
  /** Provider selection -- always null, user always picks */
  provider: z.null(),
});

/** Inferred type for a preset definition declaration */
export type PresetDefinition = z.infer<typeof PresetDefinitionSchema>;
