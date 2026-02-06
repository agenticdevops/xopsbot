import type { PluginManifest } from '../schema';

/**
 * PLUG-02: Docker plugin manifest.
 * Bundles Docker container operations skill with docker tool.
 */
export const dockerPlugin = {
  name: 'docker',
  version: '1.0.0',
  description: 'Docker container operations: builds, images, and container lifecycle',
  skills: ['docker-ops'],
  tools: ['docker'],
  workspaces: ['k8s-agent'],
  dependencies: [],
  requiredBins: ['docker'],
  optionalBins: [],
} as const satisfies PluginManifest;
