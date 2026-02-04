---
sidebar_position: 1
title: Architecture
---

# Architecture

xops.bot is a **configuration layer on top of OpenClaw**, not a fork or a standalone application. It provides DevOps-specific agent personalities, safety constraints, tool conventions, and an onboarding wizard. OpenClaw handles everything else -- provider authentication, conversation management, TUI, channels, scheduling, and the skill system.

## What OpenClaw Provides

OpenClaw is the runtime that powers xops.bot:

- **Provider authentication** -- Claude Pro/Max, ChatGPT Plus, Gemini subscriptions
- **Agent core** -- conversation management, session handling
- **TUI** -- terminal user interface
- **Channels** -- Telegram, Discord, Slack, Teams integration
- **Skill system** -- extensible skill execution
- **Subagents** -- multi-agent coordination
- **Heartbeat/monitoring** -- agent health checks
- **Scheduling** -- recurring tasks

## What xops.bot Adds

xops.bot layers DevOps capabilities on top of OpenClaw:

- **SOUL.md** -- DevOps personality, security constraints, communication style
- **Branding** -- ASCII art banner, cyan/blue theme, agent identity system
- **Setup wizard** -- interactive onboarding with workspace and profile selection
- **Safety configuration** -- Safe/Standard/Full modes with risk classifications
- **Agent workspaces** -- 5 specialized DevOps agents
- **Profiles** -- Environment-specific settings (dev/stage/prod)

## Four-File Workspace Pattern

Each agent workspace follows a consistent four-file pattern:

```
xopsbot/workspaces/<agent-name>/
  SOUL.md       # WHO the agent is (personality, constraints, boundaries)
  AGENTS.md     # HOW the agent operates (workflows, escalation rules)
  IDENTITY.md   # WHAT the agent looks like (display name, greeting, sign-off)
  TOOLS.md      # WHAT tools the agent uses (conventions, risk classifications)
  skills/       # Additional skills (future)
```

### SOUL.md -- Core Identity

Defines the agent's personality, domain expertise, communication style, and security constraints. Security constraints are placed here because they are **non-negotiable** -- they are part of who the agent is, not operating instructions that can be overridden.

### AGENTS.md -- Operating Instructions

Defines how the agent handles specific request types, troubleshooting workflows, escalation rules, and change management procedures.

### IDENTITY.md -- Display Identity

Contains machine-readable metadata (YAML frontmatter with name, family, emoji, theme) and human-readable display elements (greeting, persona description, voice characteristics, sign-off).

### TOOLS.md -- Tool Conventions

Documents the tools the agent uses, including command patterns, best practices, output formats, and risk classifications for each operation.

## Directory Structure

```
xopsbot/
  schemas/                    # Zod validation schemas
    profile.schema.ts         # Profile, SafetyConfig, Binding schemas
  safety/
    risk-classifications.json # Tool risk levels (low/medium/high/critical)
  workspaces/                 # Agent workspace templates
    k8s-agent/                # K8s Bot
    rca-agent/                # RCA Bot
    incident-agent/           # Incident Bot
    finops-agent/             # FinOps Bot
    platform-agent/           # Platform Bot
  profiles/                   # Environment profiles
    dev/profile.json          # Development (full mode, all agents)
    stage/profile.json        # Staging (standard mode, 4 agents)
    prod/profile.json         # Production (standard mode, 3 agents)
  wizard/                     # Setup wizard
    banner.ts                 # ASCII art banner (picocolors)
    index.ts                  # Wizard entry point
    steps/
      welcome.ts              # Welcome screen
      workspaces.ts           # Workspace selection (multiselect)
      profile.ts              # Profile selection
      generate.ts             # Config generation
    templates/
      openclaw.json5.ts       # OpenClaw config template
```

## Configuration Flow

```
User runs wizard
  -> Banner displayed
  -> Welcome screen
  -> Select workspaces (multiselect)
  -> Select profile (single select)
  -> Generate config
    -> Copy workspace templates to ~/.xopsbot/workspaces/
    -> Copy profile to ~/.xopsbot/profiles/
    -> Generate ~/.openclaw/openclaw.json
  -> User runs `openclaw`
    -> OpenClaw reads config
    -> Loads agent workspaces
    -> Applies safety constraints
    -> Agents ready for conversation
```

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Config on OpenClaw, not a fork | Get upstream improvements, reduce maintenance |
| Security in SOUL.md | Constraints are identity, not operating instructions |
| Four-file workspace pattern | Clean separation of concerns |
| Progressive workspace restriction | Least privilege across environments |
| Bot suffix naming | Friendly, approachable agent names |
| JSON5 for config output | Readable config with comment support |
| @clack/prompts for wizard | Modern, accessible CLI interaction |
