import * as p from '@clack/prompts';

export const AVAILABLE_WORKSPACES = [
  { value: 'k8s-agent', label: 'K8s Agent', hint: 'Kubernetes operations specialist' },
  { value: 'rca-agent', label: 'RCA Agent', hint: 'Root cause analysis specialist' },
  { value: 'incident-agent', label: 'Incident Agent', hint: 'Incident response specialist' },
  { value: 'finops-agent', label: 'FinOps Agent', hint: 'Cost optimization specialist' },
  { value: 'platform-agent', label: 'Platform Agent', hint: 'Platform engineering (IaC)' },
];

export async function selectWorkspaces(defaults?: string[]): Promise<string[] | symbol> {
  return p.multiselect({
    message: 'Select agent workspaces to enable',
    options: AVAILABLE_WORKSPACES,
    initialValues: defaults ?? ['k8s-agent', 'rca-agent'],
    required: true,
  });
}
