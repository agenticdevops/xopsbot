import * as p from '@clack/prompts';

/**
 * Available DevOps tools that xops.bot can manage.
 * At least one tool must be selected for the bot to be useful.
 */
export const AVAILABLE_TOOLS = [
  { value: 'kubectl', label: 'kubectl', hint: 'Kubernetes CLI' },
  { value: 'docker', label: 'Docker', hint: 'Container management' },
  { value: 'aws', label: 'AWS CLI', hint: 'Amazon Web Services' },
  { value: 'terraform', label: 'Terraform', hint: 'Infrastructure as Code' },
  { value: 'ansible', label: 'Ansible', hint: 'Configuration management' },
];

/**
 * Prompt the user to select DevOps tools they will use.
 * Returns selected tool values or a cancel symbol.
 * At least one tool is required.
 */
export async function selectTools(): Promise<string[] | symbol> {
  return p.multiselect({
    message: 'Which DevOps tools will you use?',
    options: AVAILABLE_TOOLS,
    initialValues: ['kubectl'],
    required: true,
  });
}
