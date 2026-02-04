---
sidebar_position: 2
title: Wizard Walkthrough
---

# Setup Wizard Walkthrough

The xops.bot setup wizard configures your agent workspaces, safety profile, and generates your OpenClaw configuration. It runs in your terminal with a modern interactive interface powered by `@clack/prompts`.

## Starting the Wizard

```bash
bun run setup
# or
bun run wizard
```

## Step 1: Banner

The wizard opens with the xops.bot ASCII art banner:

```
  +--+ +=+ +=+ +=+  +--+  +=+ +=+
  |  | | | |=| `-+  |  |  | |  |
  +--+ +-+ +   +-+  +--+  +-+  +

  xops.bot
  DevOps agents powered by OpenClaw
```

This confirms you are running the xops.bot distribution.

## Step 2: Welcome

The welcome screen explains what the wizard will do:

1. Select which agent workspaces to enable
2. Choose a safety profile (dev/stage/prod)
3. Generate your OpenClaw configuration

It also shows where configuration files will be saved:

- `~/.openclaw/openclaw.json` -- OpenClaw main config
- `~/.xopsbot/workspaces/` -- Agent workspace files
- `~/.xopsbot/profiles/` -- Profile configuration

## Step 3: Select Workspaces

Choose which agents to enable. Use arrow keys to navigate and space to toggle:

| Workspace | Agent | Description |
|-----------|-------|-------------|
| `k8s-agent` | K8s Bot | Kubernetes operations specialist |
| `rca-agent` | RCA Bot | Root cause analysis specialist |
| `incident-agent` | Incident Bot | Incident response specialist |
| `finops-agent` | FinOps Bot | Cost optimization specialist |
| `platform-agent` | Platform Bot | Platform engineering (IaC) |

By default, `k8s-agent` and `rca-agent` are pre-selected. You must select at least one workspace.

:::tip
Start with K8s Bot and RCA Bot if you are primarily doing Kubernetes operations. Add more agents as your needs grow.
:::

## Step 4: Select Profile

Choose a safety profile that matches your environment:

| Profile | Safety Mode | Audit Logging | Active Agents |
|---------|-------------|---------------|---------------|
| **Development** | Full | Off | All 5 |
| **Staging** | Standard | On | 4 (no FinOps Bot) |
| **Production** | Standard | On | 3 (K8s, RCA, Incident) |

The safety mode controls how mutations are handled:

- **Full** -- All operations allowed without prompts (development only)
- **Standard** -- Mutations require explicit approval before execution
- **Safe** -- Read-only operations only, all mutations blocked

:::caution
Never use the Full safety mode in staging or production environments. Standard mode ensures every mutation is reviewed before execution.
:::

## Step 5: Generate Configuration

The wizard generates your configuration files:

1. Creates `~/.xopsbot/workspaces/` directory and copies selected workspace templates
2. Creates `~/.xopsbot/profiles/` directory and copies the selected profile
3. Generates `~/.openclaw/openclaw.json` with workspace and profile references

A summary is displayed showing your selections and the files created.

## After the Wizard

Once the wizard completes, start OpenClaw:

```bash
openclaw
```

Your agents will be available based on the workspaces and profile you selected.

### Re-running the Wizard

You can re-run the wizard at any time to change your configuration:

```bash
bun run setup
```

Existing files will be overwritten with the new selections.

## Cancellation

Press `Ctrl+C` at any time to cancel the wizard. No files will be created or modified.
