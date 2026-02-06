import type { ToolDefinition } from '../schema';

/**
 * kubectl tool definition with per-command risk classifications.
 * Source: risk-classifications.json -- 35 commands.
 */
export const kubectlTool = {
  name: 'kubectl',
  description: 'Kubernetes command-line tool',
  defaultRisk: 'MEDIUM',
  binaryPatterns: ['*/kubectl'],
  commands: [
    // LOW -- read-only operations
    {
      command: 'get',
      risk: 'LOW',
      description: 'List resources in tabular or JSON/YAML format',
      readOnly: true,
    },
    {
      command: 'describe',
      risk: 'LOW',
      description: 'Show detailed information about a resource',
      readOnly: true,
    },
    {
      command: 'logs',
      risk: 'LOW',
      description: 'Print container logs',
      readOnly: true,
    },
    {
      command: 'top',
      risk: 'LOW',
      description: 'Display resource usage (CPU/memory)',
      readOnly: true,
    },
    {
      command: 'api-resources',
      risk: 'LOW',
      description: 'List available API resources on the server',
      readOnly: true,
    },
    {
      command: 'api-versions',
      risk: 'LOW',
      description: 'List available API versions on the server',
      readOnly: true,
    },
    {
      command: 'cluster-info',
      risk: 'LOW',
      description: 'Display cluster endpoint and service information',
      readOnly: true,
    },
    {
      command: 'config',
      risk: 'LOW',
      description: 'View or modify kubeconfig settings',
      readOnly: true,
    },
    {
      command: 'version',
      risk: 'LOW',
      description: 'Print client and server version information',
      readOnly: true,
    },
    {
      command: 'explain',
      risk: 'LOW',
      description: 'Show documentation for a resource field',
      readOnly: true,
    },
    {
      command: 'auth',
      risk: 'LOW',
      description: 'Inspect authorization settings',
      readOnly: true,
    },
    {
      command: 'port-forward',
      risk: 'LOW',
      description: 'Forward local ports to a pod',
      readOnly: true,
    },
    {
      command: 'proxy',
      risk: 'LOW',
      description: 'Run a proxy to the Kubernetes API server',
      readOnly: true,
    },

    // MEDIUM -- local or non-destructive remote operations
    {
      command: 'exec',
      risk: 'MEDIUM',
      description: 'Execute a command inside a container',
      readOnly: false,
    },
    {
      command: 'cp',
      risk: 'MEDIUM',
      description: 'Copy files between containers and the local filesystem',
      readOnly: false,
    },
    {
      command: 'attach',
      risk: 'MEDIUM',
      description: 'Attach to a running container',
      readOnly: false,
    },
    {
      command: 'debug',
      risk: 'MEDIUM',
      description: 'Create debugging sessions for troubleshooting workloads',
      readOnly: false,
    },

    // HIGH -- remote mutations that modify state
    {
      command: 'apply',
      risk: 'HIGH',
      description: 'Apply a configuration to a resource by file or stdin',
      readOnly: false,
      riskModifiers: [
        {
          flag: '--dry-run',
          effect: 'lower',
          description: 'Dry run does not mutate',
        },
      ],
    },
    {
      command: 'create',
      risk: 'HIGH',
      description: 'Create a resource from a file or stdin',
      readOnly: false,
    },
    {
      command: 'patch',
      risk: 'HIGH',
      description: 'Update fields of a resource using a strategic merge patch',
      readOnly: false,
    },
    {
      command: 'replace',
      risk: 'HIGH',
      description: 'Replace a resource by file or stdin',
      readOnly: false,
    },
    {
      command: 'set',
      risk: 'HIGH',
      description: 'Set specific features on objects (image, resources, etc.)',
      readOnly: false,
    },
    {
      command: 'label',
      risk: 'HIGH',
      description: 'Add or update labels on a resource',
      readOnly: false,
    },
    {
      command: 'annotate',
      risk: 'HIGH',
      description: 'Add or update annotations on a resource',
      readOnly: false,
    },
    {
      command: 'scale',
      risk: 'HIGH',
      description: 'Set a new size for a deployment, replica set, or stateful set',
      readOnly: false,
    },
    {
      command: 'autoscale',
      risk: 'HIGH',
      description: 'Auto-scale a deployment, replica set, or stateful set',
      readOnly: false,
    },
    {
      command: 'rollout',
      risk: 'HIGH',
      description: 'Manage the rollout of a resource (status, history, undo, restart)',
      readOnly: false,
    },
    {
      command: 'expose',
      risk: 'HIGH',
      description: 'Expose a resource as a new Kubernetes service',
      readOnly: false,
    },
    {
      command: 'run',
      risk: 'HIGH',
      description: 'Run a particular image on the cluster',
      readOnly: false,
    },
    {
      command: 'edit',
      risk: 'HIGH',
      description: 'Edit a resource on the server in an editor',
      readOnly: false,
    },
    {
      command: 'cordon',
      risk: 'HIGH',
      description: 'Mark a node as unschedulable',
      readOnly: false,
    },
    {
      command: 'uncordon',
      risk: 'HIGH',
      description: 'Mark a node as schedulable',
      readOnly: false,
    },
    {
      command: 'taint',
      risk: 'HIGH',
      description: 'Update taints on one or more nodes',
      readOnly: false,
    },

    // CRITICAL -- destructive operations
    {
      command: 'delete',
      risk: 'CRITICAL',
      description: 'Delete resources by file, stdin, resource, or name',
      readOnly: false,
    },
    {
      command: 'drain',
      risk: 'CRITICAL',
      description: 'Drain a node in preparation for maintenance',
      readOnly: false,
    },
  ],
} satisfies ToolDefinition;
