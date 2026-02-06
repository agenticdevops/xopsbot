import type { ToolDefinition, CommandDefinition, RiskLevel } from './schema';
import { WORKSPACE_TOOLS } from './index';

/**
 * Risk level display labels for section headers.
 * Maps each risk level to a human-readable header describing that category.
 */
const RISK_HEADERS: Record<RiskLevel, string> = {
  LOW: 'Read-Only Operations',
  MEDIUM: 'Diagnostic Operations',
  HIGH: 'Mutations',
  CRITICAL: 'Destructive Operations',
};

/**
 * Risk level behavior descriptions for the summary table.
 * Describes what happens at each risk level in Standard safety mode.
 */
const RISK_BEHAVIOR: Record<RiskLevel, string> = {
  LOW: 'Auto-execute without prompting',
  MEDIUM: 'Execute with awareness notification',
  HIGH: 'Require explicit approval before execution',
  CRITICAL: 'Require approval with confirmation prompt',
};

/** Ordered list of risk levels from lowest to highest. */
const RISK_ORDER: readonly RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

/**
 * Removes generated safety annotation sections from existing TOOLS.md content.
 *
 * Strips:
 * - The leading `# Tools` heading (if it is the very first line)
 * - Everything between `<!-- GENERATED:` and `<!-- END GENERATED -->` markers (inclusive)
 *
 * Returns the remaining hand-written content, trimmed of leading whitespace.
 *
 * @param content - Existing TOOLS.md content that may contain generated sections
 * @returns Content with generated sections removed
 */
export function stripGeneratedSections(content: string): string {
  let result = content;

  // Strip leading # Tools heading if it is the very first line
  result = result.replace(/^# Tools\s*\n/, '');

  // Strip generated block between markers (inclusive)
  result = result.replace(
    /<!-- GENERATED:.*?-->\s*[\s\S]*?<!-- END GENERATED -->\s*/g,
    ''
  );

  return result;
}

/**
 * Generates a markdown safety annotation section for a single tool.
 *
 * Groups the tool's commands by risk level and formats each group as a
 * markdown table with columns: Command, Risk, Description.
 * Empty groups (risk levels with no commands) are omitted.
 *
 * @param tool - The tool definition to generate a section for
 * @returns Markdown string with tool heading and risk-grouped command tables
 */
export function generateToolSafetySection(tool: ToolDefinition): string {
  const sections: string[] = [];
  sections.push(`## ${tool.name}\n`);
  sections.push(`${tool.description}\n`);

  // Group commands by risk level
  const grouped = new Map<RiskLevel, CommandDefinition[]>();
  for (const cmd of tool.commands) {
    const list = grouped.get(cmd.risk) ?? [];
    list.push(cmd);
    grouped.set(cmd.risk, list);
  }

  // Emit tables in risk order, omitting empty groups
  for (const risk of RISK_ORDER) {
    const commands = grouped.get(risk);
    if (!commands || commands.length === 0) continue;

    const header = RISK_HEADERS[risk];
    sections.push(`### ${header} (${risk} risk)\n`);
    sections.push('| Command | Risk | Description |');
    sections.push('|---------|------|-------------|');
    for (const cmd of commands) {
      sections.push(`| \`${tool.name} ${cmd.command}\` | ${cmd.risk} | ${cmd.description} |`);
    }
    sections.push('');
  }

  return sections.join('\n');
}

/**
 * Generates a complete TOOLS.md file for a workspace with safety annotations.
 *
 * The output contains:
 * 1. A `# Tools` heading
 * 2. A generated block (wrapped in HTML comment markers) containing:
 *    - Risk Classification Summary table
 *    - Per-tool safety annotation sections (only for tools assigned to this workspace)
 * 3. Any hand-written content preserved from `existingContent` (with old generated
 *    sections stripped)
 *
 * @param workspace - Workspace name (e.g., 'k8s-agent', 'finops-agent')
 * @param allTools - Array of all tool definitions
 * @param existingContent - Optional existing TOOLS.md content to preserve hand-written sections from
 * @returns Complete TOOLS.md markdown string
 */
export function generateWorkspaceToolsMd(
  workspace: string,
  allTools: ToolDefinition[],
  existingContent?: string
): string {
  // Determine which tools belong to this workspace
  const toolNames = WORKSPACE_TOOLS[workspace] ?? [];
  const workspaceTools = allTools.filter((t) => toolNames.includes(t.name));

  const parts: string[] = [];

  // Header
  parts.push('# Tools\n');

  // Begin generated block
  parts.push('<!-- GENERATED: Safety annotations from tool definitions -->\n');

  // Risk Classification Summary table
  parts.push('## Risk Classification Summary\n');
  parts.push('| Risk Level | Behavior |');
  parts.push('|------------|----------|');
  for (const risk of RISK_ORDER) {
    parts.push(`| ${risk} | ${RISK_BEHAVIOR[risk]} |`);
  }
  parts.push('');

  // Per-tool safety sections
  for (const tool of workspaceTools) {
    parts.push(generateToolSafetySection(tool));
  }

  // End generated block
  parts.push('<!-- END GENERATED -->');

  // Append hand-written content if provided
  if (existingContent) {
    const handWritten = stripGeneratedSections(existingContent).trim();
    if (handWritten.length > 0) {
      parts.push('');
      parts.push(handWritten);
    }
  }

  parts.push('');

  return parts.join('\n');
}
