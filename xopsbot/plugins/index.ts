// Schema types and validators
export {
  PluginManifestSchema,
  PluginRegistryEntrySchema,
  PluginRegistryFileSchema,
} from './schema';

export type {
  PluginManifest,
  PluginRegistryEntry,
  PluginRegistryFile,
} from './schema';

// Plugin definitions
export { kubernetesPlugin } from './definitions/kubernetes';
export { dockerPlugin } from './definitions/docker';
export { awsPlugin } from './definitions/aws';
export { terraformPlugin } from './definitions/terraform';
export { observabilityPlugin } from './definitions/observability';

import { kubernetesPlugin } from './definitions/kubernetes';
import { dockerPlugin } from './definitions/docker';
import { awsPlugin } from './definitions/aws';
import { terraformPlugin } from './definitions/terraform';
import { observabilityPlugin } from './definitions/observability';

import type { PluginManifest } from './schema';

/**
 * All plugin manifests in a single array.
 * Order: kubernetes, docker, aws, terraform, observability.
 */
export const ALL_PLUGINS: PluginManifest[] = [
  kubernetesPlugin,
  dockerPlugin,
  awsPlugin,
  terraformPlugin,
  observabilityPlugin,
];

/**
 * Lookup map from plugin name to plugin manifest.
 * Enables O(1) access by name (e.g., PLUGIN_MAP['kubernetes']).
 */
export const PLUGIN_MAP: Record<string, PluginManifest> = Object.fromEntries(
  ALL_PLUGINS.map((p) => [p.name, p]),
);
