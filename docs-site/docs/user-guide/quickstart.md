---
sidebar_position: 1
title: 5-Minute Quickstart
description: Get xops.bot running in under 5 minutes
---

# 5-Minute Quickstart

Get xops.bot up and running with a working DevOps agent in under 5 minutes.

## Prerequisites

You need three things installed:

- **[Bun](https://bun.sh/)** v1.0+ -- `curl -fsSL https://bun.sh/install | bash`
- **[OpenClaw](https://github.com/openclaw)** -- the AI agent runtime that powers xops.bot
- **An LLM API key** -- Anthropic (Claude), OpenAI, or Google (Gemini)

## Step 1: Install

```bash
git clone https://github.com/agenticdevops/xopsbot.git
cd xopsbot
bun install
```

## Step 2: Set your API key

```bash
export ANTHROPIC_API_KEY="your-key-here"
```

Or use `openclaw login` if your provider supports it.

## Step 3: Run the setup wizard

```bash
bun run setup
```

The wizard walks you through 6 quick selections:

1. **Choose a preset** -- select **DevOps Starter** for the fastest setup
2. **Select workspaces** -- the preset pre-selects K8s Bot, RCA Bot, and FinOps Bot
3. **Choose channels** -- skip for now (press Enter)
4. **Pick tools** -- the preset pre-selects kubectl, docker, and aws
5. **Set safety mode** -- Standard is recommended (mutations require approval)
6. **Connect your LLM** -- confirm your API key is detected

The wizard generates your configuration files:

```
~/.openclaw/openclaw.json        # OpenClaw main config
~/.openclaw/exec-approvals.json  # Tool execution permissions
~/.xopsbot/workspaces/           # Agent workspace files
~/.xopsbot/profiles/             # Safety profiles
```

## Step 4: Start OpenClaw

```bash
openclaw
```

Your agents are now ready for conversation.

## Step 5: Try it out

Talk to K8s Bot:

```
You: Show me the pods in the default namespace

K8s Bot: I'll check the pods for you.

> kubectl get pods -n default

NAME                        READY   STATUS    RESTARTS   AGE
nginx-deployment-abc123     1/1     Running   0          2d
redis-master-def456         1/1     Running   0          5d
```

Try a mutation (Standard mode will ask for approval):

```
You: Scale the nginx deployment to 3 replicas

K8s Bot: I'll scale the deployment. This requires your approval since
it modifies cluster state.

> kubectl scale deployment/nginx-deployment --replicas=3 -n default

Approve? [y/N]
```

## What's Next

You now have a working xops.bot setup. Here's where to go from here:

- **[Core Concepts](/user-guide/concepts)** -- understand how agents, safety, plugins, and presets fit together
- **[Example Workflows](/user-guide/workflows)** -- see complete end-to-end scenarios for deployments, incidents, and more
- **[Safety Configuration](/user-guide/safety-configuration)** -- learn about Safe, Standard, and Full modes
- **[Agents](/user-guide/agents/k8s-bot)** -- explore what each agent can do
- **[Plugins](/user-guide/plugins)** -- install additional tool bundles
- **[Presets](/user-guide/presets)** -- switch to SRE or Platform Engineer role configurations

:::tip
Start with Standard safety mode. It lets read-only commands run freely while requiring your explicit approval for any mutation. You can always switch modes later with `bun run xopsbot/cli/safety-switch.ts <mode>`.
:::
