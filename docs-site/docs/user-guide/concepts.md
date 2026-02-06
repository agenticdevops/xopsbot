---
sidebar_position: 4
title: Core Concepts
description: How agents, safety, profiles, skills, plugins, and presets work together
---

# Core Concepts

xops.bot is a DevOps-focused configuration layer for [OpenClaw](https://github.com/openclaw). It does not replace OpenClaw -- it extends it with specialized agents, safety controls, and DevOps tooling. OpenClaw handles the runtime (provider auth, conversations, TUI, channels), while xops.bot handles the DevOps domain.

This page explains how the key concepts fit together.

## Agents

xops.bot provides 5 specialized DevOps agents, each with its own personality, domain expertise, and tool access:

| Agent | Domain | What it does |
|-------|--------|-------------|
| [K8s Bot](/user-guide/agents/k8s-bot) | Kubernetes | Cluster operations, deployments, troubleshooting |
| [RCA Bot](/user-guide/agents/rca-bot) | Investigation | Root cause analysis using metrics, logs, and traces |
| [Incident Bot](/user-guide/agents/incident-bot) | Emergency | Triage, mitigation, communication during incidents |
| [FinOps Bot](/user-guide/agents/finops-bot) | Finance | Cloud cost analysis and savings recommendations |
| [Platform Bot](/user-guide/agents/platform-bot) | Infrastructure | Terraform, Ansible, and platform engineering |

Each agent lives in a **workspace** -- a directory containing its identity, operating instructions, tool conventions, and skills. Agents only have access to tools assigned to their workspace. K8s Bot uses kubectl; Platform Bot uses terraform. They do not overlap.

## Safety Model

Every command xops.bot can execute has a **risk classification**: LOW, MEDIUM, HIGH, or CRITICAL. Your **safety mode** determines what happens at each risk level.

| Mode | Read-only (LOW/MEDIUM) | Mutations (HIGH) | Destructive (CRITICAL) |
|------|----------------------|-------------------|------------------------|
| **Safe** | Prompted | Blocked | Blocked |
| **Standard** (default) | Auto-execute | Requires approval | Requires approval |
| **Full** | Auto-execute | Auto-execute | Auto-execute |

**Standard mode is recommended for most environments.** It lets you investigate freely while ensuring every mutation is reviewed before execution.

:::caution
Never use Full mode in staging or production. Standard mode exists to prevent accidents -- a misunderstood `kubectl delete namespace` cannot be undone.
:::

For the complete risk classification of every tool command, see [Tool Safety](/user-guide/tool-safety). For mode configuration details, see [Safety Configuration](/user-guide/safety-configuration).

## Profiles

Profiles represent **environments** -- development, staging, production. Each profile configures:

- **Safety mode** -- how cautiously to operate
- **Audit logging** -- whether to record all operations
- **Active workspaces** -- which agents are available
- **Environment variables** -- KUBECONFIG, AWS_PROFILE, etc.
- **Channel bindings** -- route Slack/Teams channels to specific agents

| Profile | Safety | Agents | Audit |
|---------|--------|--------|-------|
| Development | Full | All 5 | Off |
| Staging | Standard | 4 (no FinOps) | On |
| Production | Standard | 3 (K8s, RCA, Incident) | On |

Production restricts the agent surface area to only what is needed for operations and incident response. See [Profiles](/user-guide/profiles) for details.

## Skills

Skills are **domain knowledge files** that give agents expertise. When you ask about deploying to Kubernetes, the agent automatically loads the `k8s-deploy` skill which contains deployment workflows, rollback procedures, and safety checks.

xops.bot ships with 10 skills across 4 domains:

| Domain | Skills |
|--------|--------|
| Kubernetes | k8s-deploy, k8s-debug |
| Containers | docker-ops |
| Cloud | aws-ops |
| IaC | terraform-workflow, ansible-ops |
| Observability | observability-rca |
| Incident Response | incident-analysis, incident-response, incident-rca |

You do not install or activate skills manually. The agent loads the right skill based on what you are asking about. See [DevOps Skills](/user-guide/skills) for details on each skill.

## Plugins

Plugins are **installable bundles** that package skills and tools together. Instead of manually selecting individual tools and skills, install a plugin to get everything for a domain.

| Plugin | Skills | Tools |
|--------|--------|-------|
| kubernetes | k8s-deploy, k8s-debug | kubectl |
| docker | docker-ops | docker |
| aws | aws-ops | aws |
| terraform | terraform-workflow, ansible-ops | terraform, ansible |
| observability | observability-rca, incident-analysis, incident-response, incident-rca | promtool, logcli, jaeger |

When you install a plugin, xops.bot copies skill files to the right workspaces, updates the plugin registry, and regenerates exec-approvals so the tools are permitted to run. See [Plugins](/user-guide/plugins) for management commands.

## Presets

Presets are **role-based configurations** that bundle multiple plugins together for common DevOps roles. They are the fastest way to get a curated setup.

| Preset | Plugins | For whom |
|--------|---------|----------|
| DevOps Starter | kubernetes, docker, aws | General DevOps engineers |
| SRE | kubernetes, observability | Site reliability engineers |
| Platform Engineer | terraform, aws, kubernetes | Infrastructure/platform teams |

Select a preset during the [setup wizard](/user-guide/setup-wizard) or apply one later via CLI. Presets pre-populate your tool, workspace, and safety selections but do not lock them -- you can customize everything afterward. See [Presets](/user-guide/presets) for details.

## How It All Fits Together

```
Preset (role)
  └── selects Plugins (capabilities)
        └── bundles Skills (knowledge) + Tools (executables)
              └── controlled by Safety Mode (approval behavior)
                    └── configured per Profile (environment)
```

**Example:** You select the **SRE preset**. This installs the **kubernetes** and **observability** plugins. The kubernetes plugin gives you **k8s-deploy** and **k8s-debug** skills with the **kubectl** tool. The observability plugin gives you **observability-rca**, **incident-analysis**, **incident-response**, and **incident-rca** skills with **promtool**, **logcli**, and **jaeger** tools. In your **production profile**, **Standard safety mode** ensures that kubectl mutations require approval while promtool queries run freely.

Each layer is independent and composable:

| Layer | Question it answers | Can be changed independently |
|-------|-------------------|------------------------------|
| **Preset** | What is my role? | Yes -- apply a different preset anytime |
| **Plugin** | What capabilities do I need? | Yes -- install/remove plugins freely |
| **Skill** | What domain knowledge is available? | Automatic -- loaded by plugins |
| **Tool** | What binaries can run? | Yes -- controlled by plugins and exec-approvals |
| **Safety** | How cautiously should I operate? | Yes -- switch modes at runtime |
| **Profile** | What environment am I in? | Yes -- switch profiles anytime |
