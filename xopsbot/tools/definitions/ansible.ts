import type { ToolDefinition } from '../schema';

/**
 * ansible tool definition with per-command risk classifications.
 * Source: risk-classifications.json -- 18 commands.
 */
export const ansibleTool = {
  name: 'ansible',
  description: 'Ansible automation platform',
  defaultRisk: 'HIGH',
  binaryPatterns: [
    '*/ansible',
    '*/ansible-playbook',
    '*/ansible-galaxy',
    '*/ansible-vault',
    '*/ansible-inventory',
    '*/ansible-doc',
    '*/ansible-config',
    '*/ansible-pull',
  ],
  commands: [
    // LOW -- read-only operations
    {
      command: 'ansible --version',
      risk: 'LOW',
      description: 'Print Ansible version information',
      readOnly: true,
    },
    {
      command: 'ansible --list-hosts',
      risk: 'LOW',
      description: 'List hosts that match a pattern',
      readOnly: true,
    },
    {
      command: 'ansible-inventory --list',
      risk: 'LOW',
      description: 'List inventory hosts in JSON format',
      readOnly: true,
    },
    {
      command: 'ansible-inventory --graph',
      risk: 'LOW',
      description: 'Show inventory group hierarchy as a graph',
      readOnly: true,
    },
    {
      command: 'ansible-doc',
      risk: 'LOW',
      description: 'Show documentation for Ansible modules and plugins',
      readOnly: true,
    },
    {
      command: 'ansible-config',
      risk: 'LOW',
      description: 'View and manage Ansible configuration',
      readOnly: true,
    },
    {
      command: 'ansible-vault view',
      risk: 'LOW',
      description: 'View encrypted vault file contents',
      readOnly: true,
    },
    {
      command: 'ansible-galaxy list',
      risk: 'LOW',
      description: 'List installed roles and collections',
      readOnly: true,
    },
    {
      command: 'ansible-galaxy search',
      risk: 'LOW',
      description: 'Search Galaxy for roles',
      readOnly: true,
    },

    // MEDIUM -- local modifications or non-destructive operations
    {
      command: 'ansible-vault edit',
      risk: 'MEDIUM',
      description: 'Edit an encrypted vault file in place',
      readOnly: false,
    },
    {
      command: 'ansible-vault encrypt',
      risk: 'MEDIUM',
      description: 'Encrypt a file with Ansible Vault',
      readOnly: false,
    },
    {
      command: 'ansible-vault decrypt',
      risk: 'MEDIUM',
      description: 'Decrypt a file encrypted with Ansible Vault',
      readOnly: false,
    },
    {
      command: 'ansible-galaxy install',
      risk: 'MEDIUM',
      description: 'Install roles or collections from Galaxy',
      readOnly: false,
    },
    {
      command: 'ansible-galaxy remove',
      risk: 'MEDIUM',
      description: 'Remove installed roles or collections',
      readOnly: false,
    },
    {
      command: 'ansible-playbook --check',
      risk: 'MEDIUM',
      description: 'Run playbook in check mode (dry run, no changes)',
      readOnly: false,
    },

    // HIGH -- remote mutations
    {
      command: 'ansible',
      risk: 'HIGH',
      description: 'Run ad-hoc commands on managed hosts',
      readOnly: false,
    },
    {
      command: 'ansible-playbook',
      risk: 'HIGH',
      description: 'Run Ansible playbooks against managed hosts',
      readOnly: false,
      riskModifiers: [
        {
          flag: '--check',
          effect: 'lower',
          description: 'Check mode simulates without changes',
        },
      ],
    },
    {
      command: 'ansible-pull',
      risk: 'HIGH',
      description: 'Pull playbooks from VCS and run them locally',
      readOnly: false,
    },
  ],
} satisfies ToolDefinition;
