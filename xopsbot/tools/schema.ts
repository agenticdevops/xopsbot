import { z } from 'zod';

/**
 * Risk level for a command or tool default.
 * - LOW: Read-only operations with no side effects
 * - MEDIUM: Local modifications or non-destructive remote operations
 * - HIGH: Remote mutations that modify state
 * - CRITICAL: Destructive operations that cannot be easily undone
 */
export const RiskLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

/**
 * A flag pattern that modifies the risk level of a command.
 * For example, --dry-run on kubectl apply lowers risk.
 */
export const RiskModifierSchema = z.object({
  /** Flag or flag pattern (e.g., "--dry-run", "--check", "-out") */
  flag: z.string(),
  /** Whether this flag lowers or raises the base risk */
  effect: z.enum(['lower', 'raise']),
  /** Human-readable explanation of the modifier */
  description: z.string(),
});

/**
 * Definition of a single command or subcommand within a tool.
 * Maps a command string to its risk classification and metadata.
 */
export const CommandDefinitionSchema = z.object({
  /** The command or subcommand (e.g., "get", "delete", "ec2 terminate-instances") */
  command: z.string(),
  /** Risk level for this command */
  risk: RiskLevelSchema,
  /** Human-readable description of what this command does */
  description: z.string(),
  /** Whether command has no side effects (safe to auto-execute) */
  readOnly: z.boolean(),
  /** Flag patterns that modify the base risk level */
  riskModifiers: z
    .array(RiskModifierSchema)
    .optional(),
});

/**
 * Complete definition of a DevOps tool with safety annotations.
 * Serves as the single source of truth for risk classification data.
 */
export const ToolDefinitionSchema = z.object({
  /** Tool binary name (e.g., "kubectl", "docker") */
  name: z.string(),
  /** Human-readable description of the tool */
  description: z.string(),
  /** Risk level for commands not explicitly classified */
  defaultRisk: RiskLevelSchema,
  /** Glob patterns for exec-approvals matching tool binaries */
  binaryPatterns: z.array(z.string()),
  /** Individual command definitions with risk annotations */
  commands: z.array(CommandDefinitionSchema),
});

// Inferred type exports
export type RiskLevel = z.infer<typeof RiskLevelSchema>;
export type RiskModifier = z.infer<typeof RiskModifierSchema>;
export type CommandDefinition = z.infer<typeof CommandDefinitionSchema>;
export type ToolDefinition = z.infer<typeof ToolDefinitionSchema>;
