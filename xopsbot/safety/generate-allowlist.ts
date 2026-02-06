import type { SafetyMode } from '../schemas/profile.schema';

/**
 * Entry in the exec-approvals allowlist.
 */
export interface ExecAllowlistEntry {
  pattern: string;
}

/**
 * Structure of the exec-approvals.json file.
 * Defines what binaries agents are allowed to execute.
 */
export interface ExecApprovalsFile {
  version: 1;
  defaults?: {
    security?: string;
    ask?: string;
  };
  agents?: Record<
    string,
    {
      allowlist?: ExecAllowlistEntry[];
    }
  >;
}

/**
 * Binary path glob patterns for DevOps tools.
 * Maps tool names to arrays of glob patterns matching their binary locations.
 * Only includes tools from risk-classifications.json.
 */
export const TOOL_BINARIES: Record<string, readonly string[]> = {
  kubectl: ['*/kubectl'],
  docker: ['*/docker'],
  aws: ['*/aws'],
  terraform: ['*/terraform'],
  ansible: [
    '*/ansible',
    '*/ansible-playbook',
    '*/ansible-galaxy',
    '*/ansible-vault',
    '*/ansible-inventory',
    '*/ansible-doc',
    '*/ansible-config',
    '*/ansible-pull',
  ],
} as const;

/**
 * Generates an exec-approvals.json structure for the given safety mode.
 *
 * - full: No allowlist needed, full access granted
 * - standard/safe: Build allowlist from TOOL_BINARIES
 *
 * @param mode - The safety mode (safe, standard, full)
 * @param _agentIds - Agent IDs (reserved for future use, currently uses wildcard)
 * @returns ExecApprovalsFile structure ready to write as JSON
 */
export function generateExecApprovals(
  mode: SafetyMode,
  _agentIds: string[]
): ExecApprovalsFile {
  if (mode === 'full') {
    return {
      version: 1,
      defaults: {
        security: 'full',
        ask: 'off',
      },
    };
  }

  // Build allowlist from all tool binaries
  const allowlist: ExecAllowlistEntry[] = Object.values(TOOL_BINARIES)
    .flat()
    .map((pattern) => ({ pattern }));

  const askMode = mode === 'safe' ? 'always' : 'on-miss';

  return {
    version: 1,
    defaults: {
      security: 'allowlist',
      ask: askMode,
    },
    agents: {
      '*': {
        allowlist,
      },
    },
  };
}
