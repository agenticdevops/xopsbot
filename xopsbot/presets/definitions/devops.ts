import type { PresetDefinition } from '../schema';

/**
 * PRES-01: DevOps Starter preset.
 * General DevOps role with Kubernetes, Docker, and AWS plugins.
 */
export const devopsPreset = {
  name: 'devops',
  label: 'DevOps Starter',
  description: 'General DevOps: Kubernetes, Docker, and AWS with Standard safety mode',
  plugins: ['kubernetes', 'docker', 'aws'],
  workspaces: ['k8s-agent', 'rca-agent', 'finops-agent'],
  safetyMode: 'standard',
  tools: ['kubectl', 'docker', 'aws'],
  channels: [],
  provider: null,
} as const satisfies PresetDefinition;
