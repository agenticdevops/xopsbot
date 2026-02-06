import type { ToolDefinition } from '../schema';

/**
 * terraform tool definition with per-command risk classifications.
 * Source: risk-classifications.json -- 26 commands.
 */
export const terraformTool = {
  name: 'terraform',
  description: 'HashiCorp Terraform infrastructure as code',
  defaultRisk: 'MEDIUM',
  binaryPatterns: ['*/terraform'],
  commands: [
    // LOW -- read-only operations
    {
      command: 'version',
      risk: 'LOW',
      description: 'Print Terraform version',
      readOnly: true,
    },
    {
      command: 'validate',
      risk: 'LOW',
      description: 'Validate the configuration files',
      readOnly: true,
    },
    {
      command: 'fmt',
      risk: 'LOW',
      description: 'Rewrite configuration files to canonical format',
      readOnly: true,
    },
    {
      command: 'show',
      risk: 'LOW',
      description: 'Show the current state or a saved plan',
      readOnly: true,
    },
    {
      command: 'state list',
      risk: 'LOW',
      description: 'List resources in the state',
      readOnly: true,
    },
    {
      command: 'state show',
      risk: 'LOW',
      description: 'Show a resource in the state',
      readOnly: true,
    },
    {
      command: 'output',
      risk: 'LOW',
      description: 'Read an output variable from the state',
      readOnly: true,
    },
    {
      command: 'providers',
      risk: 'LOW',
      description: 'Show the providers required for this configuration',
      readOnly: true,
    },
    {
      command: 'graph',
      risk: 'LOW',
      description: 'Generate a visual representation of the dependency graph',
      readOnly: true,
    },
    {
      command: 'console',
      risk: 'LOW',
      description: 'Open an interactive console for Terraform interpolations',
      readOnly: true,
    },
    {
      command: 'state pull',
      risk: 'LOW',
      description: 'Pull current state and output to stdout',
      readOnly: true,
    },
    {
      command: 'workspace select',
      risk: 'LOW',
      description: 'Select a workspace',
      readOnly: true,
    },

    // MEDIUM -- local or non-destructive remote operations
    {
      command: 'init',
      risk: 'MEDIUM',
      description: 'Initialize a Terraform working directory',
      readOnly: false,
    },
    {
      command: 'plan',
      risk: 'MEDIUM',
      description: 'Generate and show an execution plan',
      readOnly: false,
      riskModifiers: [
        {
          flag: '-out',
          effect: 'lower',
          description: 'Saved plan enables review before apply',
        },
      ],
    },
    {
      command: 'refresh',
      risk: 'MEDIUM',
      description: 'Update the state to match real-world resources',
      readOnly: false,
    },
    {
      command: 'workspace new',
      risk: 'MEDIUM',
      description: 'Create a new workspace',
      readOnly: false,
    },

    // HIGH -- remote mutations that modify state
    {
      command: 'import',
      risk: 'HIGH',
      description: 'Import existing infrastructure into Terraform state',
      readOnly: false,
    },
    {
      command: 'state mv',
      risk: 'HIGH',
      description: 'Move an item in the state',
      readOnly: false,
    },
    {
      command: 'state rm',
      risk: 'HIGH',
      description: 'Remove items from the state',
      readOnly: false,
    },
    {
      command: 'state push',
      risk: 'HIGH',
      description: 'Update remote state from a local state file',
      readOnly: false,
    },
    {
      command: 'taint',
      risk: 'HIGH',
      description: 'Mark a resource for recreation',
      readOnly: false,
    },
    {
      command: 'untaint',
      risk: 'HIGH',
      description: 'Remove the taint marker from a resource',
      readOnly: false,
    },
    {
      command: 'apply',
      risk: 'HIGH',
      description: 'Apply the changes required to reach the desired state',
      readOnly: false,
    },
    {
      command: 'force-unlock',
      risk: 'HIGH',
      description: 'Manually unlock the state for the current configuration',
      readOnly: false,
    },

    // CRITICAL -- destructive operations
    {
      command: 'destroy',
      risk: 'CRITICAL',
      description: 'Destroy all managed infrastructure',
      readOnly: false,
    },
    {
      command: 'workspace delete',
      risk: 'CRITICAL',
      description: 'Delete an existing workspace',
      readOnly: false,
    },
  ],
} satisfies ToolDefinition;
