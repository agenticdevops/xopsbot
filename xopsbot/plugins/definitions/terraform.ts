import type { PluginManifest } from '../schema';

/**
 * PLUG-04: Terraform plugin manifest.
 * Bundles Terraform workflows and Ansible configuration management
 * skills with terraform and ansible tools. Ansible is optional since
 * users may use Terraform without Ansible.
 */
export const terraformPlugin = {
  name: 'terraform',
  version: '1.0.0',
  description: 'Infrastructure as Code: Terraform workflows and Ansible configuration management',
  skills: ['terraform-workflow', 'ansible-ops'],
  tools: ['terraform', 'ansible'],
  workspaces: ['platform-agent'],
  dependencies: [],
  requiredBins: ['terraform'],
  optionalBins: ['ansible', 'ansible-playbook'],
} as const satisfies PluginManifest;
