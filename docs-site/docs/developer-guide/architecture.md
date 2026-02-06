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
- **Setup wizard** -- interactive onboarding with preset, workspace, channel, tool, safety, and provider selection
- **Safety configuration** -- Safe/Standard/Full modes with risk classifications
- **Agent workspaces** -- 5 specialized DevOps agents
- **Profiles** -- Environment-specific settings (dev/stage/prod)
- **Plugins** -- 5 installable skill + tool bundles (kubernetes, docker, aws, terraform, observability)
- **Presets** -- 3 role-based configurations (DevOps Starter, SRE, Platform Engineer)
- **CLI tools** -- plugin management, preset management, runtime safety switching

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
  skills/                     # Shared skill files (10 skills)
  plugins/                    # Plugin manifests and registry
    manifests/                # Plugin definition files
    registry.ts               # Plugin registry management
    resolve-dependencies.ts   # Topological dependency resolution
    index.ts                  # Plugin barrel exports
  presets/                    # Preset definitions
    schema.ts                 # PresetDefinition Zod schema
    definitions/              # Preset definition files
      devops.ts               # DevOps Starter preset
      sre.ts                  # SRE preset
      platform-engineer.ts    # Platform Engineer preset
    index.ts                  # Preset barrel exports
  cli/                        # CLI commands
    plugin.ts                 # Plugin install/remove/list/enable/disable
    preset.ts                 # Preset list/show/apply
    safety-switch.ts          # Runtime safety mode switching
    index.ts                  # CLI barrel exports
  wizard/                     # Setup wizard
    banner.ts                 # ASCII art banner (picocolors)
    index.ts                  # Wizard orchestrator (6-step flow)
    types.ts                  # WizardResults, ProviderChoice types
    utils/
      first-run.ts            # First-run detection (isFirstRun)
    steps/
      welcome.ts              # Welcome note (describes 6 selections)
      preset.ts               # Preset selection (DevOps/SRE/Platform/Custom)
      workspaces.ts           # Workspace selection (multiselect, 5 agents)
      channels.ts             # Channel selection (multiselect, optional)
      tools.ts                # DevOps tool selection (multiselect, 8 tools)
      safety.ts               # Safety mode selection (safe/standard/full)
      provider.ts             # LLM provider selection with env var detection
      generate.ts             # Config generation + summary display
    templates/
      openclaw.json5.ts       # OpenClaw config template (JSON5)
```

## Configuration Flow

```
User runs wizard (or auto-launches on first run)
  -> Banner displayed
  -> Welcome note (describes 6 selections)
  -> Select role preset (DevOps Starter / SRE / Platform Engineer / Custom)
  -> Select workspaces (multiselect, 5 agents -- preset pre-populates defaults)
  -> Select channels (multiselect, optional)
  -> Select tools (multiselect, 8 tools -- preset pre-populates defaults)
  -> Select safety mode (safe/standard/full -- preset pre-populates default)
  -> Select LLM provider (anthropic/openai/google)
  -> Install preset plugins (if preset selected)
  -> Generate config
    -> Copy workspace templates to ~/.xopsbot/workspaces/
    -> Generate ~/.openclaw/openclaw.json with channels, tools, provider
    -> Write active-preset marker to ~/.xopsbot/active-preset
  -> Summary displayed with next steps
  -> User runs `openclaw`
    -> OpenClaw reads config
    -> Loads agent workspaces
    -> Applies safety constraints
    -> Agents ready for conversation
```

See the [Wizard Architecture](/developer-guide/wizard-architecture) page for implementation details.

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
