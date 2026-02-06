import type { ToolDefinition } from '../schema';

/**
 * promtool tool definition with per-command risk classifications.
 * Source: Prometheus official docs -- 22 commands.
 */
export const promtoolTool = {
  name: 'promtool',
  description: 'Prometheus tooling CLI for metrics queries and config validation',
  defaultRisk: 'LOW',
  binaryPatterns: ['*/promtool'],
  commands: [
    // LOW -- read-only query operations
    {
      command: 'query instant',
      risk: 'LOW',
      description: 'Execute instant PromQL query at a single point in time',
      readOnly: true,
    },
    {
      command: 'query range',
      risk: 'LOW',
      description: 'Execute range PromQL query across a time period',
      readOnly: true,
    },
    {
      command: 'query series',
      risk: 'LOW',
      description: 'Query available time series matching label selectors',
      readOnly: true,
    },
    {
      command: 'query labels',
      risk: 'LOW',
      description: 'Retrieve label values for a given label name',
      readOnly: true,
    },
    {
      command: 'query analyze',
      risk: 'LOW',
      description:
        'Analyze metric usage patterns (histogram buckets, cardinality)',
      readOnly: true,
    },

    // LOW -- validation (local, no side effects)
    {
      command: 'check config',
      risk: 'LOW',
      description: 'Validate Prometheus configuration files',
      readOnly: true,
    },
    {
      command: 'check rules',
      risk: 'LOW',
      description: 'Validate alerting and recording rule files',
      readOnly: true,
    },
    {
      command: 'check metrics',
      risk: 'LOW',
      description: 'Lint metrics from stdin for consistency and naming',
      readOnly: true,
    },
    {
      command: 'check web-config',
      risk: 'LOW',
      description: 'Validate web configuration files',
      readOnly: true,
    },
    {
      command: 'check healthy',
      risk: 'LOW',
      description: 'Check if Prometheus server is healthy',
      readOnly: true,
    },
    {
      command: 'check ready',
      risk: 'LOW',
      description: 'Check if Prometheus server is ready to serve traffic',
      readOnly: true,
    },
    {
      command: 'check service-discovery',
      risk: 'LOW',
      description: 'Run service discovery and show relabeling results',
      readOnly: true,
    },

    // LOW -- test (local, no side effects)
    {
      command: 'test rules',
      risk: 'LOW',
      description: 'Unit test alerting and recording rules',
      readOnly: true,
    },

    // LOW -- debug information retrieval
    {
      command: 'debug pprof',
      risk: 'LOW',
      description: 'Retrieve profiling debug information from server',
      readOnly: true,
    },
    {
      command: 'debug metrics',
      risk: 'LOW',
      description: 'Retrieve metrics debug information from server',
      readOnly: true,
    },
    {
      command: 'debug all',
      risk: 'LOW',
      description: 'Retrieve all debug information from server',
      readOnly: true,
    },

    // LOW -- TSDB read operations
    {
      command: 'tsdb analyze',
      risk: 'LOW',
      description: 'Analyze TSDB block churn, cardinality, and compaction',
      readOnly: true,
    },
    {
      command: 'tsdb list',
      risk: 'LOW',
      description: 'List TSDB blocks',
      readOnly: true,
    },
    {
      command: 'tsdb dump',
      risk: 'LOW',
      description: 'Dump data samples from TSDB in text format',
      readOnly: true,
    },
    {
      command: 'tsdb dump-openmetrics',
      risk: 'LOW',
      description: 'Dump data samples in OpenMetrics format',
      readOnly: true,
    },

    // MEDIUM -- push metrics to remote
    {
      command: 'push metrics',
      risk: 'MEDIUM',
      description: 'Push metrics to Prometheus remote write endpoint',
      readOnly: false,
    },

    // HIGH -- TSDB write operations
    {
      command: 'tsdb bench write',
      risk: 'HIGH',
      description: 'Run write benchmarks against TSDB (writes data)',
      readOnly: false,
    },
    {
      command: 'tsdb create-blocks-from',
      risk: 'HIGH',
      description: 'Create TSDB blocks from external data sources',
      readOnly: false,
    },
  ],
} satisfies ToolDefinition;
