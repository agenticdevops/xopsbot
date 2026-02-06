import type { PresetDefinition } from '../schema';

/**
 * PRES-03: Platform Engineer preset.
 * Infrastructure as Code role with Terraform, AWS, and Kubernetes plugins.
 */
export const platformEngineerPreset = {
  name: 'platform-engineer',
  label: 'Platform Engineer',
  description: 'Infrastructure as Code: Terraform, Ansible, and AWS with Standard safety mode',
  plugins: ['terraform', 'aws', 'kubernetes'],
  workspaces: ['platform-agent', 'k8s-agent', 'finops-agent'],
  safetyMode: 'standard',
  tools: ['terraform', 'ansible', 'aws', 'kubectl'],
  channels: [],
  provider: null,
} as const satisfies PresetDefinition;
