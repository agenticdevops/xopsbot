```
__  __  ___  ____  ____    ____   ___ _____
 \ \/ / / _ \|  _ \/ ___|  | __ ) / _ \_   _|
  \  / | | | | |_) \___ \  |  _ \| | | || |
  /  \ | |_| |  __/ ___) |_| |_) | |_| || |
 /_/\_\ \___/|_|   |____/(_)____/ \___/ |_|
```

**DevOps agents powered by OpenClaw**

Your infrastructure, one conversation away.

---

xops.bot is a DevOps-focused configuration layer for [OpenClaw](https://github.com/openclaw) that provides specialized AI agents for Kubernetes operations, incident response, root cause analysis, cost optimization, and platform engineering -- all with safety controls you can trust.

## Agents

| Agent | Domain | What it does |
|-------|--------|-------------|
| K8s Bot | Kubernetes | Cluster operations, deployments, troubleshooting |
| RCA Bot | Investigation | Root cause analysis using metrics, logs, and traces |
| Incident Bot | Emergency | Triage, mitigation, and incident communication |
| FinOps Bot | Finance | Cloud cost analysis and savings recommendations |
| Platform Bot | Infrastructure | Terraform, Ansible, and platform engineering |

## Safety Modes

Every command has a risk classification (LOW / MEDIUM / HIGH / CRITICAL). Your safety mode determines what runs automatically, what needs approval, and what gets blocked.

| Mode | Read-only | Mutations | Destructive |
|------|-----------|-----------|-------------|
| **Safe** | Prompted | Blocked | Blocked |
| **Standard** (default) | Auto-execute | Requires approval | Requires approval |
| **Full** | Auto-execute | Auto-execute | Auto-execute |

Standard mode is the default. Mutations require your explicit "yes" before executing.

## Quick Start

**Prerequisites:** [Bun](https://bun.sh/) v1.0+, [OpenClaw](https://github.com/openclaw), an LLM API key

```bash
# 1. Clone and install
git clone https://github.com/agenticdevops/xopsbot.git
cd xopsbot && bun install

# 2. Set your API key
export ANTHROPIC_API_KEY="your-key-here"

# 3. Run the setup wizard
bun run setup

# 4. Start OpenClaw
openclaw
```

The wizard walks you through 6 selections: role preset, workspaces, channels, tools, safety mode, and LLM provider. Pick the **DevOps Starter** preset to get running in under 5 minutes.

## Presets

Choose a role preset for a curated setup, or go custom.

| Preset | Plugins | Tools | For whom |
|--------|---------|-------|----------|
| **DevOps Starter** | kubernetes, docker, aws | kubectl, docker, aws | General DevOps engineers |
| **SRE** | kubernetes, observability | kubectl, promtool, logcli, jaeger | Site reliability engineers |
| **Platform Engineer** | terraform, aws, kubernetes | terraform, ansible, aws, kubectl | Infrastructure/platform teams |

Presets pre-populate your configuration but don't lock it -- customize anything afterward.

## Tools

8 tools with 186 commands classified by risk level:

| Tool | Domain | Commands |
|------|--------|----------|
| kubectl | Kubernetes | 35 |
| docker | Containers | 38 |
| aws | Cloud (AWS) | 36 |
| terraform | Infrastructure as Code | 26 |
| ansible | Configuration Management | 18 |
| promtool | Metrics (Prometheus) | 22 |
| logcli | Logs (Loki) | 6 |
| jaeger | Traces (Jaeger) | 5 |

## Skills

10 skills across 6 domains:

- **Kubernetes** -- k8s-deploy, k8s-debug
- **Containers** -- docker-ops
- **Cloud** -- aws-ops
- **IaC** -- terraform-workflow, ansible-ops
- **Observability** -- observability-rca
- **Incident Response** -- incident-analysis, incident-response, incident-rca

Skills are loaded automatically when you ask about relevant topics. No manual activation needed.

## Plugins

Install skill + tool bundles with one command:

```bash
bun run xopsbot/cli/plugin.ts install kubernetes
# Installed kubernetes plugin (2 skills, 1 tools)

bun run xopsbot/cli/plugin.ts list
# * kubernetes        installed, enabled
# - docker            not installed
# - aws               not installed
# - terraform         not installed
# - observability     not installed
```

5 built-in plugins: `kubernetes`, `docker`, `aws`, `terraform`, `observability`.

## CLI Commands

```bash
# Setup wizard
bun run setup

# Safety mode switching
bun run xopsbot/cli/safety-switch.ts <safe|standard|full>

# Plugin management
bun run xopsbot/cli/plugin.ts install|remove|list|enable|disable <name>

# Preset management
bun run xopsbot/cli/preset.ts list|show|apply <name>
```

## Profiles

Environment-specific configurations with progressive safety restrictions:

| | Development | Staging | Production |
|---|---|---|---|
| Safety | Full | Standard | Standard |
| Audit | Off | On | On |
| Agents | 5 | 4 | 3 |

Production runs only K8s Bot, RCA Bot, and Incident Bot -- minimal surface area for critical operations.

## Project Structure

```
xopsbot/
  workspaces/        5 agent workspace templates
  skills/            10 shared DevOps skills
  plugins/           5 plugin manifests + registry
  presets/            3 role-based preset definitions
  profiles/           3 environment profiles (dev/stage/prod)
  safety/             Risk classifications for all tools
  schemas/            Zod validation schemas
  cli/                CLI commands (plugin, preset, safety-switch)
  wizard/             6-step setup wizard
docs-site/           Docusaurus documentation (29 pages)
```

## Documentation

Full documentation at **[agenticops.github.io/xopsbot](https://agenticops.github.io/xopsbot/)**

- [5-Minute Quickstart](https://agenticops.github.io/xopsbot/user-guide/quickstart)
- [Core Concepts](https://agenticops.github.io/xopsbot/user-guide/concepts)
- [Example Workflows](https://agenticops.github.io/xopsbot/user-guide/workflows)
- [Safety Configuration](https://agenticops.github.io/xopsbot/user-guide/safety-configuration)
- [CLI Reference](https://agenticops.github.io/xopsbot/user-guide/cli-reference)
- [Troubleshooting](https://agenticops.github.io/xopsbot/user-guide/troubleshooting)

## How It Works

xops.bot does not replace OpenClaw -- it extends it. OpenClaw provides the runtime (AI providers, TUI, channels, skill system). xops.bot adds the DevOps domain layer:

```
You (terminal, Slack, Discord, Telegram)
  └── OpenClaw (runtime)
        └── xops.bot (DevOps layer)
              ├── Agents (personality, workflows, constraints)
              ├── Skills (domain knowledge)
              ├── Tools (classified commands)
              └── Safety (approval behavior)
                    └── Your Infrastructure (K8s, AWS, Terraform, Docker)
```

## License

Apache License 2.0 -- see [LICENSE](LICENSE).

## Built on

[OpenClaw](https://github.com/openclaw) -- the open source agent platform.
