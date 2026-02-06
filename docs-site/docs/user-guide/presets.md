---
sidebar_position: 8
title: Presets
description: Role-based configurations for quick setup
---

# Presets

Presets are role-based configurations that bundle plugins, workspaces, tools, and safety settings for common DevOps roles. Instead of configuring everything manually, select a preset to get a curated setup in one step. Presets can be selected during the setup wizard or applied later via CLI.

**Key concept:** Presets compose plugins. They do NOT replace plugins or profiles. The hierarchy is:

- **Presets** select plugins (which plugins to install)
- **Plugins** bundle skills and tools (what capabilities to add)
- **Profiles** configure environments (how safely to operate)

## Available Presets

xops.bot ships with three built-in presets covering the most common DevOps roles.

| Preset | Plugins | Workspaces | Tools | Safety |
|--------|---------|------------|-------|--------|
| **DevOps Starter** | kubernetes, docker, aws | k8s-agent, rca-agent, finops-agent | kubectl, docker, aws | Standard |
| **SRE** | kubernetes, observability | k8s-agent, rca-agent, incident-agent | kubectl, promtool, logcli, jaeger | Standard |
| **Platform Engineer** | terraform, aws, kubernetes | platform-agent, k8s-agent, finops-agent | terraform, ansible, aws, kubectl | Standard |

### DevOps Starter

For general DevOps engineers working with containers and cloud. Covers Kubernetes operations, Docker container management, and AWS cloud operations. This preset installs three plugins (kubernetes, docker, aws) giving you six skills across three workspaces. The recommended starting point for most users.

### SRE

For Site Reliability Engineers focused on observability and incident response. Covers metrics queries (Prometheus via promtool), log analysis (Loki via logcli), distributed tracing (Jaeger), and structured incident investigation. Installs the kubernetes and observability plugins, giving you access to incident analysis, incident response, root cause analysis, and observability RCA skills.

### Platform Engineer

For platform engineers managing infrastructure as code. Covers Terraform workflows, Ansible configuration management, AWS cloud operations, and Kubernetes cluster management. Installs three plugins (terraform, aws, kubernetes) across three workspaces including the FinOps agent for cost optimization.

## Selecting a Preset in the Wizard

When you run the setup wizard, the first step prompts you to choose a role preset:

```
$ bun run xopsbot/wizard/index.ts

  ? Choose a role preset
  > DevOps Starter     (kubectl, docker, aws | Standard safety)
    SRE                (kubectl, promtool, logcli, jaeger | Standard safety)
    Platform Engineer  (terraform, ansible, aws, kubectl | Standard safety)
    Custom             (Choose everything manually)
```

How preset selection works:

- **Selecting a preset** pre-populates workspaces, tools, and safety mode in subsequent wizard steps. You can modify any of these defaults before finishing -- presets suggest, they do not lock.
- **Selecting "Custom"** gives the manual wizard flow where you choose everything yourself (same as before presets existed).
- After you complete the wizard, the preset's plugins are automatically installed and the active-preset marker is written.

The wizard is a 6-step flow when using presets: preset selection, workspaces, channels, tools, safety, and provider.

## Managing Presets via CLI

### Listing presets

```bash
bun run xopsbot/cli/preset.ts list
```

Example output:

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

### Viewing preset details

```bash
bun run xopsbot/cli/preset.ts show sre
```

Example output:

```
SRE
Observability and incident response: metrics, logs, traces with Standard safety mode

  Plugins:    kubernetes, observability
  Workspaces: k8s-agent, rca-agent, incident-agent
  Tools:      kubectl, promtool, logcli, jaeger
  Safety:     standard
```

### Applying a preset

```bash
bun run xopsbot/cli/preset.ts apply platform-engineer
```

When you apply a preset, the system:

1. **Installs all preset plugins** -- Each plugin in the preset is installed via `pluginInstall` (idempotent -- already-installed plugins are skipped).
2. **Writes the active-preset marker** -- Records the preset name in `~/.xopsbot/active-preset` so CLI commands know which preset is active.

A restart of the OpenClaw gateway is needed for changes to take effect.

## Customizing After Preset

Presets are a starting point, not a constraint. After applying a preset, you can freely customize your setup:

- **Install additional plugins:** `bun run xopsbot/cli/plugin.ts install docker`
- **Change safety mode:** `bun run xopsbot/cli/safety-switch.ts safe`
- **Re-run the wizard** to reconfigure entirely: `bun run xopsbot/wizard/index.ts`
- **Enable or disable individual plugins:** `bun run xopsbot/cli/plugin.ts disable aws`

Presets do not prevent manual customization. They set initial defaults that you can override at any time.

## Presets vs Plugins vs Profiles

These three layers are independent and composable:

| Layer | Purpose | Example |
|-------|---------|---------|
| **Preset** | Role-based bundle (WHAT role) | "I'm an SRE" |
| **Plugin** | Skill + tool bundle (WHAT capabilities) | "I need observability tools" |
| **Profile** | Environment config (WHERE + HOW SAFELY) | "This is production, use Standard safety" |

Any preset can be used with any profile. A preset selects which plugins to install; a profile controls how safely those tools operate. For example, you can apply the SRE preset and then switch to safe mode for a production environment -- the preset's tools remain available but mutations require approval.
