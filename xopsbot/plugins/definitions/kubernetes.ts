import type { PluginManifest } from '../schema';

/**
 * PLUG-01: Kubernetes plugin manifest.
 * Bundles Kubernetes deployment and debugging skills with kubectl tool.
 */
export const kubernetesPlugin = {
  name: 'kubernetes',
  version: '1.0.0',
  description: 'Kubernetes operations: deployments, debugging, and container management',
  skills: ['k8s-deploy', 'k8s-debug'],
  tools: ['kubectl'],
  workspaces: ['k8s-agent'],
  dependencies: [],
  requiredBins: ['kubectl'],
  optionalBins: [],
} as const satisfies PluginManifest;
