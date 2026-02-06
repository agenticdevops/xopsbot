---
sidebar_position: 10
title: CLI Reference
description: Complete reference for all xopsbot CLI commands
---

# CLI Reference

xops.bot provides CLI commands for setup, safety management, plugin management, and preset management. All commands are run with `bun run`.

## Setup Wizard

Run the interactive setup wizard to configure xops.bot.

```bash
bun run setup
# or
bun run xopsbot/wizard/index.ts
```

The wizard launches automatically on first run (when `~/.openclaw/openclaw.json` does not exist). It walks you through 6 selections: preset, workspaces, channels, tools, safety mode, and LLM provider.

**Re-running the wizard** overwrites existing configuration. To trigger first-run detection, delete the config file:

```bash
rm ~/.openclaw/openclaw.json
bun run setup
```

See [Setup Wizard](/user-guide/setup-wizard) for a detailed walkthrough of each step.

---

## Safety Mode Switching

Switch safety modes at runtime without re-running the wizard.

### Switch mode

```bash
bun run xopsbot/cli/safety-switch.ts <safe|standard|full>
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `mode` | Yes | One of: `safe`, `standard`, `full` |

**What it does:**

1. Updates the active profile's `safety.mode` field in `~/.xopsbot/profiles/<name>/profile.json`
2. Regenerates `~/.openclaw/openclaw.json` with updated exec security settings and agent deny lists
3. Regenerates `~/.openclaw/exec-approvals.json` with updated binary allowlists

**Example:**

```bash
$ bun run xopsbot/cli/safety-switch.ts safe

Safety mode switched: standard -> safe
  Read-only mode. All mutations are blocked.

Updated files:
  - ~/.xopsbot/profiles/dev/profile.json
  - ~/.openclaw/openclaw.json
  - ~/.openclaw/exec-approvals.json

Note: Restart OpenClaw gateway for changes to take effect.
```

**Mode descriptions:**

| Mode | Behavior |
|------|----------|
| `safe` | Read-only. All mutations are blocked. |
| `standard` | Mutations require explicit approval. |
| `full` | All operations allowed. Development only. |

See [Safety Configuration](/user-guide/safety-configuration) for details on how modes interact with risk levels.

---

## Plugin Management

Manage skill and tool bundles.

### Install a plugin

```bash
bun run xopsbot/cli/plugin.ts install <name>
```

Resolves dependencies, copies skills to shared and workspace directories, updates the registry, and regenerates exec-approvals.

```bash
$ bun run xopsbot/cli/plugin.ts install kubernetes

Installed kubernetes plugin (2 skills, 1 tools)
```

If the plugin has dependencies, they are installed first:

```bash
$ bun run xopsbot/cli/plugin.ts install monitoring

  Installed dependency: observability (4 skills)

Installed monitoring plugin (1 skills, 1 tools)
```

Already-installed plugins are skipped:

```bash
$ bun run xopsbot/cli/plugin.ts install kubernetes
Plugin kubernetes is already installed.
```

### Remove a plugin

```bash
bun run xopsbot/cli/plugin.ts remove <name>
```

Deletes skill files from shared and workspace directories, removes the registry entry, and regenerates exec-approvals. Blocked if another plugin depends on this one.

```bash
$ bun run xopsbot/cli/plugin.ts remove kubernetes

Removed kubernetes plugin
```

### List plugins

```bash
bun run xopsbot/cli/plugin.ts list
```

Shows all available plugins with installed/enabled status:

```
Plugins

  * kubernetes        installed, enabled
    Kubernetes operations: deployments, debugging, and container management
    Skills: k8s-deploy, k8s-debug  |  Tools: kubectl

  o docker            installed, disabled
    Docker container operations: builds, images, and container lifecycle
    Skills: docker-ops  |  Tools: docker

  - aws               not installed
    AWS cloud operations: EC2, S3, IAM, Lambda, and cost management
    Skills: aws-ops  |  Tools: aws
```

| Indicator | Meaning |
|-----------|---------|
| `*` (green) | Installed and enabled |
| `o` (yellow) | Installed but disabled |
| `-` (dim) | Not installed |

### Enable a plugin

```bash
bun run xopsbot/cli/plugin.ts enable <name>
```

Marks a disabled plugin as enabled and regenerates exec-approvals to restore tool access.

### Disable a plugin

```bash
bun run xopsbot/cli/plugin.ts disable <name>
```

Marks an installed plugin as disabled and regenerates exec-approvals to remove tool access. Skill files remain on disk.

**Available plugins:**

| Plugin | Skills | Tools |
|--------|--------|-------|
| `kubernetes` | k8s-deploy, k8s-debug | kubectl |
| `docker` | docker-ops | docker |
| `aws` | aws-ops | aws |
| `terraform` | terraform-workflow, ansible-ops | terraform, ansible |
| `observability` | observability-rca, incident-analysis, incident-response, incident-rca | promtool, logcli, jaeger |

See [Plugins](/user-guide/plugins) for detailed documentation.

---

## Preset Management

Manage role-based configuration bundles.

### List presets

```bash
bun run xopsbot/cli/preset.ts list
```

Shows all available presets with the active indicator:

```
Presets

  > devops               DevOps Starter (active)
    General DevOps: Kubernetes, Docker, and AWS with Standard safety mode
    Plugins: kubernetes, docker, aws  |  Tools: kubectl, docker, aws

    sre                  SRE
    Observability and incident response: metrics, logs, traces with Standard safety mode
    Plugins: kubernetes, observability  |  Tools: kubectl, promtool, logcli, jaeger

    platform-engineer    Platform Engineer
    Infrastructure as Code: Terraform, Ansible, and AWS with Standard safety mode
    Plugins: terraform, aws, kubernetes  |  Tools: terraform, ansible, aws, kubectl
```

The `>` indicator marks the currently active preset.

### Show preset details

```bash
bun run xopsbot/cli/preset.ts show <name>
```

Displays the full configuration for a specific preset:

```bash
$ bun run xopsbot/cli/preset.ts show sre

SRE
Observability and incident response: metrics, logs, traces with Standard safety mode

  Plugins:    kubernetes, observability
  Workspaces: k8s-agent, rca-agent, incident-agent
  Tools:      kubectl, promtool, logcli, jaeger
  Safety:     standard
```

### Apply a preset

```bash
bun run xopsbot/cli/preset.ts apply <name>
```

Installs all preset plugins (idempotent) and writes the active-preset marker to `~/.xopsbot/active-preset`.

```bash
$ bun run xopsbot/cli/preset.ts apply platform-engineer

Applying preset: Platform Engineer

Installed terraform plugin (2 skills, 2 tools)
Installed aws plugin (1 skills, 1 tools)
Installed kubernetes plugin (2 skills, 1 tools)

Preset applied: platform-engineer
  Workspaces: platform-agent, k8s-agent, finops-agent
  Tools:      terraform, ansible, aws, kubectl
  Safety:     standard

Note: Restart OpenClaw gateway for changes to take effect.
```

**Available presets:**

| Preset | Plugins | Tools | Safety |
|--------|---------|-------|--------|
| `devops` | kubernetes, docker, aws | kubectl, docker, aws | Standard |
| `sre` | kubernetes, observability | kubectl, promtool, logcli, jaeger | Standard |
| `platform-engineer` | terraform, aws, kubernetes | terraform, ansible, aws, kubectl | Standard |

See [Presets](/user-guide/presets) for detailed documentation.

---

## Configuration Files

All CLI commands read and write to these locations:

| File | Purpose | Written by |
|------|---------|------------|
| `~/.openclaw/openclaw.json` | OpenClaw main config | Wizard, safety-switch |
| `~/.openclaw/exec-approvals.json` | Tool execution permissions | Wizard, safety-switch, plugin, preset |
| `~/.xopsbot/profiles/<name>/profile.json` | Environment profile | Wizard, safety-switch |
| `~/.xopsbot/plugins/registry.json` | Installed plugin state | Plugin CLI |
| `~/.xopsbot/active-profile` | Active profile marker | Wizard |
| `~/.xopsbot/active-preset` | Active preset marker | Wizard, preset CLI |
| `~/.xopsbot/workspaces/` | Agent workspace files | Wizard, plugin CLI |
| `~/.xopsbot/skills/` | Shared skill files | Plugin CLI |

:::tip
After any CLI command that modifies `openclaw.json`, restart the OpenClaw gateway for changes to take effect. Changes to `exec-approvals.json` take effect immediately.
:::
