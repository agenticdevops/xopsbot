---
sidebar_position: 1
title: Installation
---

# Installation

Get xops.bot up and running in a few minutes.

## Prerequisites

Before installing xops.bot, make sure you have:

- **[Bun](https://bun.sh/)** v1.0 or later (runtime)
- **[OpenClaw](https://github.com/openclaw)** installed and accessible on your PATH
- **An LLM provider subscription** -- Claude Pro/Max, ChatGPT Plus, or Gemini Advanced (OpenClaw handles authentication)

### Optional (for specific agents)

| Tool | Required by | Purpose |
|------|------------|---------|
| `kubectl` | K8s Bot | Kubernetes cluster operations |
| `helm` | K8s Bot | Helm chart management |
| `aws` CLI | FinOps Bot, Platform Bot | AWS cloud operations |
| `terraform` | Platform Bot | Infrastructure as Code |

## Install

### 1. Clone the repository

```bash
git clone https://github.com/opsflow-sh/xopsbot.git
cd xopsbot
```

### 2. Install dependencies

```bash
bun install
```

### 3. Run the setup wizard

```bash
bun run setup
```

The wizard walks you through selecting agent workspaces and a safety profile. See the [Wizard Walkthrough](/user-guide/wizard-walkthrough) for a detailed guide.

### 4. Start OpenClaw

```bash
openclaw
```

OpenClaw will load your xops.bot configuration and start the agents you selected.

## Verify Installation

After running the wizard, check that the following files were created:

```
~/.openclaw/openclaw.json      # OpenClaw config pointing to xops.bot workspaces
~/.xopsbot/workspaces/         # Your selected agent workspace templates
~/.xopsbot/profiles/           # Your selected safety profile
```

You can also verify by running:

```bash
bun run wizard
```

If the banner appears and the wizard starts, everything is working.

## Directory Structure

After installation, your project looks like this:

```
xopsbot/
  schemas/           # Zod schemas (profile, safety)
  safety/            # Risk classifications for tools
  workspaces/        # Agent workspace templates
    k8s-agent/       # K8s Bot workspace
    rca-agent/       # RCA Bot workspace
    incident-agent/  # Incident Bot workspace
    finops-agent/    # FinOps Bot workspace
    platform-agent/  # Platform Bot workspace
  profiles/          # Environment profile templates
    dev/             # Development (full access)
    stage/           # Staging (approval required)
    prod/            # Production (restricted)
  wizard/            # Setup wizard
    banner.ts        # ASCII art banner
    index.ts         # Wizard entry point
    steps/           # Wizard step implementations
    templates/       # Config generation templates
```

## Next Steps

- **[Run the wizard](/user-guide/wizard-walkthrough)** to configure your environment
- **[Learn about agents](/user-guide/agents/k8s-bot)** to understand what each Bot does
- **[Understand profiles](/user-guide/profiles)** to choose the right safety level
