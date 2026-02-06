---
sidebar_position: 6
title: Adding Tools
description: How to add new tool definitions with per-command risk classifications to xops.bot.
---

# Adding Tools

Tool definitions are TypeScript data structures that define per-command risk classifications for DevOps binaries. They are NOT skill files (SKILL.md). Skills describe workflows and knowledge; tool definitions describe what commands exist and how dangerous each one is.

Tool definitions are the single source of truth for two safety enforcement layers: binary-level exec-approvals and prompt-level TOOLS.md safety annotations.

## Architecture

xops.bot enforces tool safety through two independent layers:

### Layer 1: Binary-level (exec-approvals.json)

Hard guardrail. OpenClaw reads `exec-approvals.json` to decide which binaries an agent can execute at all. If a binary is not listed, the agent cannot run it regardless of what the LLM thinks.

### Layer 2: Prompt-level (TOOLS.md)

Soft guardrail. Each workspace has a `TOOLS.md` file with per-command risk tables. The LLM reads these tables to understand which commands need approval and which are safe to auto-execute.

Both layers are generated from the same tool definitions. You define once, both layers update.

## Adding a New Tool

Follow this checklist to add a tool definition:

### Step 1: Create the definition file

Create `xopsbot/tools/definitions/{toolname}.ts`:

```typescript
import type { ToolDefinition } from '../schema';

export const myTool = {
  name: 'mytool',
  description: 'My tool description',
  defaultRisk: 'MEDIUM',
  binaryPatterns: ['*/mytool'],
  commands: [
    {
      command: 'status',
      risk: 'LOW',
      description: 'Show current status',
      readOnly: true,
    },
    {
      command: 'apply',
      risk: 'HIGH',
      description: 'Apply changes',
      readOnly: false,
    },
    {
      command: 'destroy',
      risk: 'CRITICAL',
      description: 'Destroy all resources',
      readOnly: false,
    },
  ],
} as const satisfies ToolDefinition;
```

Use `as const satisfies ToolDefinition` to preserve literal types while ensuring schema compliance.

### Step 2: Add to barrel export

In `xopsbot/tools/index.ts`, add the export and include in `ALL_TOOLS`:

```typescript
export { myTool } from './definitions/mytool';

import { myTool } from './definitions/mytool';

export const ALL_TOOLS: ToolDefinition[] = [
  kubectlTool,
  dockerTool,
  awsTool,
  terraformTool,
  ansibleTool,
  // promtoolTool, logcliTool, jaegerTool also in array (8 tools total)
  myTool,  // <-- add here
];
```

### Step 3: Add workspace mapping

In the same file, update `WORKSPACE_TOOLS` to assign the tool to one or more agent workspaces:

```typescript
export const WORKSPACE_TOOLS: Record<string, string[]> = {
  'k8s-agent': ['kubectl', 'docker'],
  'platform-agent': ['terraform', 'ansible', 'aws', 'mytool'],
  // ...
};
```

### Step 4: Regenerate workspace files

Run the TOOLS.md generator to update workspace safety annotations. Binary patterns are automatically derived from `ALL_TOOLS` via `TOOL_BINARIES` -- no manual allowlist edits needed.

### Step 5: Run tests

```bash
bun test xopsbot/tools/
```

All existing tests should pass, and your new tool will be picked up by the generator functions.

## ToolDefinition Schema Reference

Tool definitions use Zod schemas defined in `xopsbot/tools/schema.ts`:

### ToolDefinition

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Tool binary name (e.g., "kubectl", "docker") |
| `description` | `string` | Yes | Human-readable description of the tool |
| `defaultRisk` | `RiskLevel` | Yes | Risk level for commands not explicitly classified |
| `binaryPatterns` | `string[]` | Yes | Glob patterns for exec-approvals matching (e.g., `["*/kubectl"]`) |
| `commands` | `CommandDefinition[]` | Yes | Individual command definitions with risk annotations |

### CommandDefinition

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `command` | `string` | Yes | The command or subcommand (e.g., "get", "ec2 terminate-instances") |
| `risk` | `RiskLevel` | Yes | Risk level for this command |
| `description` | `string` | Yes | Human-readable description |
| `readOnly` | `boolean` | Yes | Whether the command has no side effects |
| `riskModifiers` | `RiskModifier[]` | No | Flag patterns that modify the base risk level |

### RiskModifier

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `flag` | `string` | Yes | Flag or flag pattern (e.g., "--dry-run", "--check") |
| `effect` | `"lower" \| "raise"` | Yes | Whether this flag lowers or raises the base risk |
| `description` | `string` | Yes | Human-readable explanation |

### RiskLevel

One of: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.

## Risk Level Guidelines

When classifying commands, follow these principles:

| Risk Level | Criteria | Questions to Ask |
|------------|----------|------------------|
| **LOW** | Read-only, no side effects | Does it only retrieve information? Can it run 100 times with no change? |
| **MEDIUM** | Local modifications or diagnostic | Does it modify local state only? Is it non-destructive remotely? |
| **HIGH** | Remote mutations | Does it create, update, or reconfigure resources? Is it recoverable? |
| **CRITICAL** | Destructive, hard to reverse | Does it delete resources? Could it cause data loss? Is undo difficult? |

**When unsure, classify higher.** It is better to require unnecessary approval than to auto-execute a destructive command.

**Use risk modifiers** for commands whose risk changes with flags. For example, `kubectl apply --dry-run` is effectively LOW even though the base command is HIGH.

## Common Pitfalls

**1. Confusing tool definitions with skills.**
Skills are SKILL.md files with workflows and knowledge. Tool definitions are TypeScript data structures with risk classifications. They serve different purposes and live in different directories.

**2. Forgetting readOnly alignment.**
If `risk` is LOW, `readOnly` should almost always be `true`. If `risk` is HIGH or CRITICAL, `readOnly` should be `false`. A LOW-risk command that is not read-only is suspicious.

**3. Missing binary patterns.**
Some tools use multiple binaries. Ansible has `ansible`, `ansible-playbook`, `ansible-galaxy`, `ansible-vault`, and more. List all binary patterns that the agent might need to execute.

**4. Overly broad command strings.**
AWS commands use two-level subcommands (e.g., `ec2 terminate-instances`). If you only classify `ec2`, every EC2 subcommand gets the same risk. Classify specific subcommands when risk varies within a service.

**5. Not updating WORKSPACE_TOOLS.**
Adding a tool to `ALL_TOOLS` makes it available for generation, but agents only get tools listed in their `WORKSPACE_TOOLS` entry. Forgetting this step means the tool exists but no agent can use it.

## Checklist

Before submitting a new tool definition, verify:

- [ ] **Definition file created** in `xopsbot/tools/definitions/{toolname}.ts`
- [ ] **Uses `satisfies ToolDefinition`** for type safety with literal preservation
- [ ] **All commands classified** with appropriate risk levels
- [ ] **readOnly aligned** with risk level (LOW = true, HIGH/CRITICAL = false)
- [ ] **Risk modifiers added** for commands with flag-dependent risk
- [ ] **Binary patterns complete** covering all executables the tool uses
- [ ] **Added to barrel export** and `ALL_TOOLS` array
- [ ] **Workspace mapping updated** in `WORKSPACE_TOOLS`
- [ ] **TOOLS.md regenerated** for affected workspaces
- [ ] **Tests passing** with `bun test xopsbot/tools/`
- [ ] **Documentation updated** in the [Tool Safety user guide](../user-guide/tool-safety.md)
