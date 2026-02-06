import * as p from '@clack/prompts';

/**
 * Safety mode options for infrastructure operations.
 * Values align with SafetyModeSchema ('safe', 'standard', 'full') in profile.schema.ts.
 */
export const SAFETY_OPTIONS = [
  {
    value: 'safe' as const,
    label: 'Safe',
    hint: 'Read-only operations only. All mutations blocked.',
  },
  {
    value: 'standard' as const,
    label: 'Standard (Recommended)',
    hint: 'Mutations require explicit approval.',
  },
  {
    value: 'full' as const,
    label: 'Full',
    hint: 'All operations allowed. Development only.',
  },
];

/**
 * Prompt user to select a safety mode for infrastructure operations.
 * Defaults to 'standard' (recommended for most users).
 *
 * @returns The selected safety mode string, or a cancel symbol if user cancels.
 */
export async function selectSafetyMode(defaultMode?: string): Promise<string | symbol> {
  return p.select({
    message: 'Select safety mode for infrastructure operations',
    options: SAFETY_OPTIONS,
    initialValue: defaultMode ?? 'standard',
  });
}
