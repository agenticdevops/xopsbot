---
sidebar_position: 3
title: Safety Configuration
description: Configure safety modes to protect your infrastructure from unintended mutations.
---

# Safety Configuration

xops.bot uses a three-tier safety model to protect your infrastructure. Each mode controls whether the agent can execute mutating commands, and whether those commands require your explicit approval before running.

## Safety Modes

| Mode | Behavior | Best For |
|------|----------|----------|
| **Safe** | Read-only. All mutation tools blocked. Even read commands prompt for approval. | Production monitoring, on-call investigation |
| **Standard** (default) | Read commands run freely. Mutations require your explicit approval. | Daily operations, most environments |
| **Full** | All commands run without approval. | Trusted dev environments only |

## Choosing During Setup

The [setup wizard](./setup-wizard.md) asks you to select a safety mode in Step 5. Standard mode is recommended for most users. If you are unsure, choose Standard -- you can always switch later.

:::caution
Never use Full mode in staging or production environments. Standard mode ensures every mutation is reviewed before execution.
:::

## Switching at Runtime

You can switch safety modes without re-running the full wizard:

```bash
bun run xopsbot/cli/safety-switch.ts standard
```

This command:

1. Updates the active profile's `safety.mode` field
2. Regenerates `~/.openclaw/openclaw.json` with updated exec security settings
3. Regenerates `~/.openclaw/exec-approvals.json` with updated binary allowlists

**Note:** After switching, restart the OpenClaw gateway for `openclaw.json` changes to take effect. Changes to `exec-approvals.json` take effect immediately.

## Safety by Environment

The default profiles are configured with environment-appropriate safety settings:

| Profile | Safety Mode | Audit Logging |
|---------|-------------|---------------|
| `dev` | Full | Off |
| `stage` | Standard | On |
| `prod` | Standard | On |

Production environments should never use Full mode. The dev profile uses Full mode to reduce friction during development, but this is only appropriate for local, trusted environments.

## Risk Classifications

Every DevOps tool command has a risk level. xops.bot uses these classifications to determine what requires approval in Standard mode.

| Risk Level | Description | Standard Mode Behavior |
|------------|-------------|------------------------|
| **LOW** | Read-only, no side effects | Runs without prompt |
| **MEDIUM** | Local modifications, non-destructive | Runs without prompt |
| **HIGH** | Remote mutations that modify state | Requires approval |
| **CRITICAL** | Destructive, hard to undo | Requires approval |

### Tool Examples

**kubectl**
- LOW: `get`, `describe`, `logs`, `top`, `explain`
- HIGH: `apply`, `scale`, `patch`, `rollout`
- CRITICAL: `delete`, `drain`

**docker**
- LOW: `ps`, `images`, `inspect`, `logs`, `stats`
- HIGH: `run`, `start`, `stop`, `push`
- CRITICAL: `rm`, `rmi`, `prune`

**terraform**
- LOW: `validate`, `show`, `output`, `state list`
- MEDIUM: `plan`, `init`
- HIGH: `apply`, `import`, `taint`
- CRITICAL: `destroy`, `workspace delete`

**aws**
- LOW: `describe-*`, `list-*`, `get-*`, `s3 ls`
- HIGH: `s3 cp`, `ec2 run-instances`, `ec2 stop-instances`
- CRITICAL: `ec2 terminate-instances`, `s3 rm`, `rds delete-*`

**ansible**
- LOW: `--list-hosts`, `ansible-doc`, `ansible-inventory --graph`
- MEDIUM: `ansible-playbook --check`, `ansible-vault encrypt`
- HIGH: `ansible`, `ansible-playbook`

The complete risk classifications are defined in `xopsbot/safety/risk-classifications.json`.

## Audit Logging

All operations are logged by OpenClaw in JSONL format. The audit logging configuration controls verbosity:

- **Enabled** (stage/prod): Logging level `info` -- records all operations for audit trail
- **Disabled** (dev): Logging level `warn` -- only logs warnings and errors

Logs are written to `/tmp/openclaw/openclaw-YYYY-MM-DD.log`.

In Safe and Standard modes, sensitive data is automatically redacted from tool outputs. This prevents credentials and secrets from appearing in logs.

To check your current audit logging setting, look at your active profile:

```bash
cat ~/.xopsbot/profiles/dev/profile.json | jq '.safety.audit_logging'
```
