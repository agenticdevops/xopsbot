---
sidebar_position: 2
title: Safety Architecture
description: How xops.bot maps its safety model to OpenClaw's exec security infrastructure.
---

# Safety Architecture

xops.bot's safety layer is a **configuration generator**, not an enforcement engine. OpenClaw handles all enforcement. xops.bot generates the correct config values from its simple Safe/Standard/Full model.

## Two-Layer Security Model

OpenClaw has two independent layers for exec tool security. Understanding this distinction is essential for working with xops.bot's safety module.

### Layer 1: Tool Policy

Controls which OpenClaw tools are available to the LLM.

```
openclaw.json -> agents.defaults.tools.profile / allow / deny
              -> agents.list[].tools.profile / allow / deny
```

This determines whether `exec`, `write`, `edit`, and `apply_patch` tools are even offered to the agent. In Safe mode, xops.bot denies these tools entirely at this layer.

### Layer 2: Exec Security

Controls which shell commands the exec tool can run.

```
openclaw.json -> agents.defaults.tools.exec.security / ask / safeBins
              -> agents.list[].tools.exec.security / ask / safeBins

exec-approvals.json -> defaults.security / ask
                    -> agents.<id>.allowlist[]
```

This determines what commands pass when an agent invokes the exec tool. The `security` field sets the enforcement mode, `ask` sets when to prompt for approval, and the allowlist defines which binaries are permitted.

### Configuration Flow

```
User selects "Standard"
  |
  v
safetyModeToExecConfig('standard')
  -> { security: 'allowlist', ask: 'on-miss', safeBins: [...] }
  -> Written to openclaw.json agents.defaults.tools.exec
  |
generateExecApprovals('standard', agentIds)
  -> { version: 1, defaults: {...}, agents: { '*': { allowlist: [...] } } }
  -> Written to ~/.openclaw/exec-approvals.json
```

## File Structure

The safety module generates OpenClaw configuration from xops.bot's simple SafetyMode type.

```
xopsbot/safety/
  risk-classifications.json   -- Tool risk levels (source of truth)
  generate-exec-config.ts     -- SafetyMode -> OpenClaw tools.exec config
  generate-allowlist.ts       -- SafetyMode -> exec-approvals.json
  audit-config.ts             -- audit_logging flag -> OpenClaw logging config
  index.ts                    -- Public API barrel export
```

### risk-classifications.json

Defines risk levels (LOW, MEDIUM, HIGH, CRITICAL) for every command in each DevOps tool (kubectl, docker, aws, terraform, ansible). This is the source of truth for xops.bot's understanding of command safety.

### generate-exec-config.ts

Maps SafetyMode to OpenClaw's `ExecToolConfig`:

- `safe` -> `{ security: 'allowlist', ask: 'always', safeBins }`
- `standard` -> `{ security: 'allowlist', ask: 'on-miss', safeBins }`
- `full` -> `{ security: 'full', ask: 'off' }`

Exports `SAFE_BINS` (read-only utilities like jq, grep, cat) and `SAFE_MODE_TOOL_DENY` (tools to block in Safe mode).

### generate-allowlist.ts

Generates the `exec-approvals.json` structure with binary path patterns. Maps tool names from risk-classifications.json to glob patterns like `*/kubectl`.

### audit-config.ts

Maps the profile's `audit_logging` boolean to OpenClaw's logging config:

- `true` -> `{ level: 'info', redactSensitive: 'tools' }`
- `false` -> `{ level: 'warn', redactSensitive: 'tools' }`

## Key Design Decisions

### Why path-based allowlists

OpenClaw's exec-approvals matches on executable paths, not command strings. This means we allowlist binaries like `*/kubectl` rather than patterns like `kubectl get`. The `ask` mechanism handles sub-command granularity.

### Why ask: on-miss for Standard mode

Low-risk commands from known tools should run without friction. Using `ask: 'on-miss'` means DevOps tool binaries on the allowlist execute freely, but any unknown binary or chained command triggers approval.

### Why tool deny for Safe mode

Safe mode blocks `exec`, `write`, `edit`, and `apply_patch` at the tool policy layer (Layer 1). This provides defense in depth -- even if something bypasses exec security, the agent cannot invoke write-capable tools.

### Why no custom enforcement

OpenClaw's exec security is battle-tested. It handles pipelines, command chaining, quoting, and approval workflows across all channels (TUI, Telegram, Discord, Slack). xops.bot generates config, it does not duplicate enforcement logic.

## Adding New Tool Support

To add a new DevOps tool (e.g., helm):

1. **Add risk classifications**

   Edit `xopsbot/safety/risk-classifications.json`:

   ```json
   {
     "tools": {
       "helm": {
         "description": "Kubernetes package manager",
         "default_risk": "MEDIUM",
         "commands": {
           "list": "LOW",
           "status": "LOW",
           "get": "LOW",
           "install": "HIGH",
           "upgrade": "HIGH",
           "uninstall": "CRITICAL",
           "rollback": "HIGH"
         }
       }
     }
   }
   ```

2. **Add binary patterns**

   Edit `xopsbot/safety/generate-allowlist.ts`:

   ```typescript
   export const TOOL_BINARIES: Record<string, readonly string[]> = {
     // ... existing tools
     helm: ['*/helm'],
   };
   ```

3. **Run tests**

   ```bash
   bun test xopsbot/safety/
   ```

4. **Regenerate configs**

   The new tool automatically appears in generated `exec-approvals.json` after running the wizard or safety switch command.

## Common Pitfalls

### Tool policy vs exec security confusion

**Wrong:** Setting `tools.deny: ['kubectl']` expecting it to block kubectl commands.

**Why it fails:** `kubectl` is a shell binary, not an OpenClaw tool. OpenClaw tools are `exec`, `write`, `read`, `edit`, etc.

**Correct:** Use `tools.deny: ['exec']` to block all command execution, or use `tools.exec.security: 'allowlist'` with exec-approvals to control which binaries run.

### Gateway restart needed

Config changes to `openclaw.json` may require restarting the OpenClaw gateway. Changes to `exec-approvals.json` take effect immediately (it's re-read per exec call).

Always document this in user-facing output:

```typescript
console.log('Note: Restart OpenClaw gateway for changes to take effect.');
```

### Glob vs regex patterns

**Wrong:** Using regex syntax in exec-approvals allowlist: `^kubectl$`

**Correct:** Using glob patterns: `*/kubectl`

OpenClaw's allowlist uses glob patterns for matching executable paths, not regular expressions.
