import type { PluginManifest } from '../schema';

/**
 * PLUG-05: Observability plugin manifest.
 * Bundles observability RCA and incident response skills with
 * Prometheus, Loki, and Jaeger tools. Covers both post-incident
 * investigation (rca-agent) and active incident handling (incident-agent).
 */
export const observabilityPlugin = {
  name: 'observability',
  version: '1.0.0',
  description: 'Observability and incident response: metrics, logs, traces, and RCA workflows',
  skills: ['observability-rca', 'incident-analysis', 'incident-response', 'incident-rca'],
  tools: ['promtool', 'logcli', 'jaeger'],
  workspaces: ['rca-agent', 'incident-agent'],
  dependencies: [],
  requiredBins: ['promtool', 'logcli'],
  optionalBins: ['curl'],
} as const satisfies PluginManifest;
