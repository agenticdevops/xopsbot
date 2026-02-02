import * as p from '@clack/prompts';

export const AVAILABLE_PROFILES = [
  { value: 'dev', label: 'Development', hint: 'Full access, no approval needed' },
  { value: 'stage', label: 'Staging', hint: 'Mutations require approval' },
  { value: 'prod', label: 'Production', hint: 'Restricted access, full audit trail' },
];

export async function selectProfile(): Promise<string | symbol> {
  return p.select({
    message: 'Select safety profile',
    options: AVAILABLE_PROFILES,
    initialValue: 'dev',
  });
}
