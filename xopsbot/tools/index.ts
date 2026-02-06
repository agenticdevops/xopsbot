// Schema types and validators
export {
  RiskLevelSchema,
  RiskModifierSchema,
  CommandDefinitionSchema,
  ToolDefinitionSchema,
} from './schema';

export type {
  RiskLevel,
  RiskModifier,
  CommandDefinition,
  ToolDefinition,
} from './schema';

// Tool definitions
export { kubectlTool } from './definitions/kubectl';
export { dockerTool } from './definitions/docker';
export { awsTool } from './definitions/aws';
export { terraformTool } from './definitions/terraform';
export { ansibleTool } from './definitions/ansible';

import { kubectlTool } from './definitions/kubectl';
import { dockerTool } from './definitions/docker';
import { awsTool } from './definitions/aws';
import { terraformTool } from './definitions/terraform';
import { ansibleTool } from './definitions/ansible';

import type { ToolDefinition } from './schema';

/**
 * All tool definitions in a single array.
 * Order: kubectl, docker, aws, terraform, ansible.
 */
export const ALL_TOOLS: ToolDefinition[] = [
  kubectlTool,
  dockerTool,
  awsTool,
  terraformTool,
  ansibleTool,
];

/**
 * Maps workspace agent names to their allowed tool names.
 * Used by the wizard and config generator to determine which tools
 * each workspace/agent needs access to.
 */
export const WORKSPACE_TOOLS: Record<string, string[]> = {
  'k8s-agent': ['kubectl', 'docker'],
  'rca-agent': ['kubectl'],
  'incident-agent': ['kubectl'],
  'finops-agent': ['aws'],
  'platform-agent': ['terraform', 'ansible', 'aws'],
};

// TOOLS.md generator functions
export {
  generateToolSafetySection,
  generateWorkspaceToolsMd,
  stripGeneratedSections,
} from './generate-tools-md';
