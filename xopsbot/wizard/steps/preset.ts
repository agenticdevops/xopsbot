import * as p from '@clack/prompts';
import { ALL_PRESETS } from '../../presets';

/**
 * Preset options for the wizard selection step.
 * Maps each preset definition to a @clack/prompts select option,
 * then appends a "Custom" option for manual configuration.
 */
export const PRESET_OPTIONS = [
  ...ALL_PRESETS.map((preset) => ({
    value: preset.name,
    label: preset.label,
    hint: `${preset.tools.join(', ')} | ${preset.safetyMode.charAt(0).toUpperCase() + preset.safetyMode.slice(1)} safety`,
  })),
  {
    value: 'custom',
    label: 'Custom',
    hint: 'Choose everything manually',
  },
];

/**
 * Prompt user to select a role preset or choose custom configuration.
 *
 * @returns The selected preset name string, 'custom' string, or a cancel symbol.
 */
export async function selectPreset(): Promise<string | symbol> {
  return p.select({
    message: 'Choose a role preset',
    options: PRESET_OPTIONS,
    initialValue: 'devops',
  });
}
