---
slug: /
sidebar_position: 0
title: Welcome
hide_table_of_contents: true
---

# xops.bot

**DevOps agents powered by OpenClaw**

Your infrastructure, one conversation away.

xops.bot is a DevOps-focused distribution of [OpenClaw](https://github.com/openclaw) that provides specialized AI agents for Kubernetes operations, incident response, root cause analysis, cost optimization, and platform engineering -- all with a safety-first approach to infrastructure automation.

## Quick Start

1. **[Install xops.bot](/user-guide/installation)** -- prerequisites and setup
2. **[Run the wizard](/user-guide/setup-wizard)** -- choose a preset, configure agents, tools, and safety mode
3. **[Start OpenClaw](/user-guide/quickstart#step-4-start-openclaw)** -- `openclaw` to launch your agents
4. **[Talk to your agents](/user-guide/workflows)** -- deploy, investigate, analyze, and manage infrastructure

Or follow the **[5-Minute Quickstart](/user-guide/quickstart)** for the fastest path to a working setup.

## Choose Your Path

| I want to... | Go here |
|--------------|---------|
| Get running in 5 minutes | [Quickstart](/user-guide/quickstart) |
| Understand how it all works | [Core Concepts](/user-guide/concepts) |
| Configure my setup | [Setup Wizard](/user-guide/setup-wizard) |
| See real-world examples | [Example Workflows](/user-guide/workflows) |
| Look up a CLI command | [CLI Reference](/user-guide/cli-reference) |
| Fix a problem | [Troubleshooting](/user-guide/troubleshooting) |

## Agents

| Agent | Domain | Description |
|-------|--------|-------------|
| :wheel_of_dharma: [K8s Bot](/user-guide/agents/k8s-bot) | Kubernetes | Cluster operations, deployments, troubleshooting |
| :mag: [RCA Bot](/user-guide/agents/rca-bot) | Investigation | Root cause analysis, evidence gathering, timelines |
| :rotating_light: [Incident Bot](/user-guide/agents/incident-bot) | Emergency | Triage, mitigation, communication |
| :chart_with_downwards_trend: [FinOps Bot](/user-guide/agents/finops-bot) | Finance | Cloud cost analysis, savings recommendations |
| :building_construction: [Platform Bot](/user-guide/agents/platform-bot) | Infrastructure | IaC, platform building, reliability |

## Key Features

- **Three safety modes** -- Safe (read-only), Standard (approval required), Full (unrestricted). [Learn more](/user-guide/safety-configuration)
- **10 DevOps skills** -- deployment, debugging, cloud ops, IaC, observability, incident response. [Learn more](/user-guide/skills)
- **8 tool integrations** -- kubectl, docker, aws, terraform, ansible, promtool, logcli, jaeger. [Learn more](/user-guide/tool-safety)
- **5 plugins** -- installable bundles for Kubernetes, Docker, AWS, Terraform, and Observability. [Learn more](/user-guide/plugins)
- **3 role presets** -- DevOps Starter, SRE, Platform Engineer for one-click setup. [Learn more](/user-guide/presets)
- **3 environment profiles** -- dev, staging, production with progressive safety restrictions. [Learn more](/user-guide/profiles)

## For Developers

- **[Architecture](/developer-guide/architecture)** -- how xops.bot extends OpenClaw
- **[Adding Agents](/developer-guide/adding-agents)** -- create your own agent workspace
- **[Adding Skills](/developer-guide/adding-skills)** -- extend agent capabilities
- **[Adding Plugins](/developer-guide/adding-plugins)** -- bundle skills and tools
- **[Adding Presets](/developer-guide/adding-presets)** -- create role-based configurations
- **[Contributing](/developer-guide/contributing)** -- development setup and conventions
