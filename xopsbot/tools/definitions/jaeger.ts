// Note: Jaeger has no dedicated query CLI. Queries are via curl against HTTP API v3.
import type { ToolDefinition } from '../schema';

/**
 * jaeger tool definition with per-command risk classifications.
 * Source: Jaeger API v3 swagger spec -- 5 commands.
 */
export const jaegerTool = {
  name: 'jaeger',
  description: 'Jaeger distributed tracing query via HTTP API (curl-based)',
  defaultRisk: 'LOW',
  binaryPatterns: ['*/curl'],
  commands: [
    // LOW -- all read-only query operations
    {
      command: 'get-services',
      risk: 'LOW',
      description: 'List all services that have reported traces',
      readOnly: true,
    },
    {
      command: 'get-operations',
      risk: 'LOW',
      description: 'List operations for a given service',
      readOnly: true,
    },
    {
      command: 'find-traces',
      risk: 'LOW',
      description:
        'Search traces by service, operation, time range, and duration',
      readOnly: true,
    },
    {
      command: 'get-trace',
      risk: 'LOW',
      description: 'Retrieve a single trace by trace ID',
      readOnly: true,
    },
    {
      command: 'get-dependencies',
      risk: 'LOW',
      description: 'Retrieve service dependency graph for a time range',
      readOnly: true,
    },
  ],
} satisfies ToolDefinition;
