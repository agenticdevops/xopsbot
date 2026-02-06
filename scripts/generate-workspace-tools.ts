/**
 * Generates enhanced TOOLS.md files for all 5 workspaces.
 * Uses the generateWorkspaceToolsMd function from xopsbot/tools.
 *
 * Usage: bun run scripts/generate-workspace-tools.ts [workspace...]
 * If no workspaces specified, generates for all 5.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { generateWorkspaceToolsMd, ALL_TOOLS, WORKSPACE_TOOLS } from '../xopsbot/tools/index';

const ROOT = resolve(import.meta.dir, '..');
const ALL_WORKSPACES = Object.keys(WORKSPACE_TOOLS);

// Parse CLI args: specific workspaces or all
const requestedWorkspaces = process.argv.slice(2);
const workspaces = requestedWorkspaces.length > 0
  ? requestedWorkspaces.filter((w) => ALL_WORKSPACES.includes(w))
  : ALL_WORKSPACES;

if (workspaces.length === 0) {
  console.error('No valid workspaces specified. Available:', ALL_WORKSPACES.join(', '));
  process.exit(1);
}

for (const workspace of workspaces) {
  const toolsPath = resolve(ROOT, 'xopsbot', 'workspaces', workspace, 'TOOLS.md');

  // Read existing content if file exists
  let existingContent: string | undefined;
  if (existsSync(toolsPath)) {
    existingContent = readFileSync(toolsPath, 'utf-8');
  }

  // Generate enhanced content
  const enhanced = generateWorkspaceToolsMd(workspace, ALL_TOOLS, existingContent);

  // Write back
  writeFileSync(toolsPath, enhanced, 'utf-8');
  console.log(`Generated: ${toolsPath}`);

  // Report tool sections included
  const toolNames = WORKSPACE_TOOLS[workspace] ?? [];
  console.log(`  Tools: ${toolNames.join(', ')}`);
}

console.log(`\nDone. Generated ${workspaces.length} workspace TOOLS.md files.`);
