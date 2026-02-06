import type { ToolDefinition } from '../schema';

/**
 * logcli tool definition with per-command risk classifications.
 * Source: Grafana Loki docs -- 6 commands.
 */
export const logcliTool = {
  name: 'logcli',
  description: 'Grafana Loki command-line tool for log queries via LogQL',
  defaultRisk: 'LOW',
  binaryPatterns: ['*/logcli'],
  commands: [
    // LOW -- all read-only query operations
    {
      command: 'query',
      risk: 'LOW',
      description: 'Run LogQL query for logs over a time range',
      readOnly: true,
    },
    {
      command: 'instant-query',
      risk: 'LOW',
      description: 'Run instant LogQL query for a single point in time',
      readOnly: true,
    },
    {
      command: 'labels',
      risk: 'LOW',
      description: 'Find values for a given label',
      readOnly: true,
    },
    {
      command: 'series',
      risk: 'LOW',
      description: 'Query log streams matching label selectors',
      readOnly: true,
    },
    {
      command: 'stats',
      risk: 'LOW',
      description:
        'Query index statistics for matching streams (TSDB only)',
      readOnly: true,
    },
    {
      command: 'volume',
      risk: 'LOW',
      description:
        'Query aggregate volumes for matching series (TSDB only)',
      readOnly: true,
    },
  ],
} satisfies ToolDefinition;
