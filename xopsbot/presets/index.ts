/**
 * Preset system barrel export.
 *
 * Provides schemas, definitions, and collections for the xopsbot preset system.
 * Presets bundle plugins, workspaces, tools, and safety mode for role-based
 * quick setup (DevOps, SRE, Platform Engineer).
 *
 * @module presets
 */

// --- Schema types and validators ---
export { PresetDefinitionSchema } from './schema';

export type { PresetDefinition } from './schema';

// --- Preset definitions ---
export { devopsPreset } from './definitions/devops';
export { srePreset } from './definitions/sre';
export { platformEngineerPreset } from './definitions/platform-engineer';

// --- Collections ---
import { devopsPreset } from './definitions/devops';
import { srePreset } from './definitions/sre';
import { platformEngineerPreset } from './definitions/platform-engineer';

import type { PresetDefinition } from './schema';

/**
 * All preset definitions in a single array.
 * Order: devops, sre, platform-engineer.
 */
export const ALL_PRESETS: PresetDefinition[] = [
  devopsPreset,
  srePreset,
  platformEngineerPreset,
];

/**
 * Lookup map from preset name to preset definition.
 * Enables O(1) access by name (e.g., PRESET_MAP['devops']).
 */
export const PRESET_MAP: Record<string, PresetDefinition> = Object.fromEntries(
  ALL_PRESETS.map((p) => [p.name, p]),
);
