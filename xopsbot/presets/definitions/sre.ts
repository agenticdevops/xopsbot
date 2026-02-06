import type { PresetDefinition } from '../schema';

/**
 * PRES-02: SRE preset.
 * Observability and incident response role with Kubernetes and observability plugins.
 */
export const srePreset = {
  name: 'sre',
  label: 'SRE',
  description: 'Observability and incident response: metrics, logs, traces with Standard safety mode',
  plugins: ['kubernetes', 'observability'],
  workspaces: ['k8s-agent', 'rca-agent', 'incident-agent'],
  safetyMode: 'standard',
  tools: ['kubectl', 'promtool', 'logcli', 'jaeger'],
  channels: [],
  provider: null,
} as const satisfies PresetDefinition;
