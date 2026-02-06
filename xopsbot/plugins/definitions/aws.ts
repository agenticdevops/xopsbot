import type { PluginManifest } from '../schema';

/**
 * PLUG-03: AWS plugin manifest.
 * Bundles AWS cloud operations skill with aws CLI tool.
 */
export const awsPlugin = {
  name: 'aws',
  version: '1.0.0',
  description: 'AWS cloud operations: EC2, S3, IAM, Lambda, and cost management',
  skills: ['aws-ops'],
  tools: ['aws'],
  workspaces: ['finops-agent', 'platform-agent'],
  dependencies: [],
  requiredBins: ['aws'],
  optionalBins: [],
} as const satisfies PluginManifest;
