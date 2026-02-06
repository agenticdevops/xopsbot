import type { ToolDefinition } from '../schema';

/**
 * docker tool definition with per-command risk classifications.
 * Source: risk-classifications.json -- 38 commands.
 */
export const dockerTool = {
  name: 'docker',
  description: 'Docker container runtime',
  defaultRisk: 'MEDIUM',
  binaryPatterns: ['*/docker'],
  commands: [
    // LOW -- read-only operations
    {
      command: 'ps',
      risk: 'LOW',
      description: 'List containers',
      readOnly: true,
    },
    {
      command: 'images',
      risk: 'LOW',
      description: 'List images',
      readOnly: true,
    },
    {
      command: 'inspect',
      risk: 'LOW',
      description: 'Return low-level information on Docker objects',
      readOnly: true,
    },
    {
      command: 'logs',
      risk: 'LOW',
      description: 'Fetch the logs of a container',
      readOnly: true,
    },
    {
      command: 'stats',
      risk: 'LOW',
      description: 'Display a live stream of container resource usage',
      readOnly: true,
    },
    {
      command: 'top',
      risk: 'LOW',
      description: 'Display the running processes of a container',
      readOnly: true,
    },
    {
      command: 'version',
      risk: 'LOW',
      description: 'Show Docker version information',
      readOnly: true,
    },
    {
      command: 'info',
      risk: 'LOW',
      description: 'Display system-wide information',
      readOnly: true,
    },
    {
      command: 'history',
      risk: 'LOW',
      description: 'Show the history of an image',
      readOnly: true,
    },
    {
      command: 'search',
      risk: 'LOW',
      description: 'Search Docker Hub for images',
      readOnly: true,
    },
    {
      command: 'events',
      risk: 'LOW',
      description: 'Get real-time events from the server',
      readOnly: true,
    },
    {
      command: 'diff',
      risk: 'LOW',
      description: 'Inspect changes to files on a container filesystem',
      readOnly: true,
    },
    {
      command: 'port',
      risk: 'LOW',
      description: 'List port mappings for a container',
      readOnly: true,
    },

    // MEDIUM -- local modifications or non-destructive operations
    {
      command: 'build',
      risk: 'MEDIUM',
      description: 'Build an image from a Dockerfile',
      readOnly: false,
    },
    {
      command: 'pull',
      risk: 'MEDIUM',
      description: 'Download an image from a registry',
      readOnly: false,
    },
    {
      command: 'tag',
      risk: 'MEDIUM',
      description: 'Create a tag that refers to a source image',
      readOnly: false,
    },
    {
      command: 'save',
      risk: 'MEDIUM',
      description: 'Save one or more images to a tar archive',
      readOnly: false,
    },
    {
      command: 'load',
      risk: 'MEDIUM',
      description: 'Load an image from a tar archive',
      readOnly: false,
    },
    {
      command: 'export',
      risk: 'MEDIUM',
      description: 'Export a container filesystem as a tar archive',
      readOnly: false,
    },
    {
      command: 'import',
      risk: 'MEDIUM',
      description: 'Import contents from a tarball to create a filesystem image',
      readOnly: false,
    },
    {
      command: 'commit',
      risk: 'MEDIUM',
      description: 'Create a new image from a container changes',
      readOnly: false,
    },
    {
      command: 'exec',
      risk: 'MEDIUM',
      description: 'Execute a command in a running container',
      readOnly: false,
    },
    {
      command: 'attach',
      risk: 'MEDIUM',
      description: 'Attach local standard I/O streams to a running container',
      readOnly: false,
    },
    {
      command: 'cp',
      risk: 'MEDIUM',
      description: 'Copy files between a container and the local filesystem',
      readOnly: false,
    },

    // HIGH -- remote mutations that modify state
    {
      command: 'run',
      risk: 'HIGH',
      description: 'Create and start a new container',
      readOnly: false,
    },
    {
      command: 'start',
      risk: 'HIGH',
      description: 'Start one or more stopped containers',
      readOnly: false,
    },
    {
      command: 'stop',
      risk: 'HIGH',
      description: 'Stop one or more running containers',
      readOnly: false,
    },
    {
      command: 'restart',
      risk: 'HIGH',
      description: 'Restart one or more containers',
      readOnly: false,
    },
    {
      command: 'pause',
      risk: 'HIGH',
      description: 'Pause all processes within one or more containers',
      readOnly: false,
    },
    {
      command: 'unpause',
      risk: 'HIGH',
      description: 'Unpause all processes within one or more containers',
      readOnly: false,
    },
    {
      command: 'kill',
      risk: 'HIGH',
      description: 'Kill one or more running containers',
      readOnly: false,
    },
    {
      command: 'push',
      risk: 'HIGH',
      description: 'Upload an image to a registry',
      readOnly: false,
    },

    // CRITICAL -- destructive operations
    {
      command: 'rm',
      risk: 'CRITICAL',
      description: 'Remove one or more containers',
      readOnly: false,
    },
    {
      command: 'rmi',
      risk: 'CRITICAL',
      description: 'Remove one or more images',
      readOnly: false,
    },
    {
      command: 'prune',
      risk: 'CRITICAL',
      description: 'Remove unused data',
      readOnly: false,
    },
    {
      command: 'system prune',
      risk: 'CRITICAL',
      description: 'Remove all unused containers, networks, images, and optionally volumes',
      readOnly: false,
    },
    {
      command: 'volume rm',
      risk: 'CRITICAL',
      description: 'Remove one or more volumes',
      readOnly: false,
    },
    {
      command: 'network rm',
      risk: 'CRITICAL',
      description: 'Remove one or more networks',
      readOnly: false,
    },
  ],
} satisfies ToolDefinition;
