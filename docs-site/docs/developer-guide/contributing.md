---
sidebar_position: 3
title: Contributing
---

# Contributing

How to set up a development environment and contribute to xops.bot.

## Development Setup

### Prerequisites

- **[Bun](https://bun.sh/)** v1.0 or later
- **[Node.js](https://nodejs.org/)** v20 or later (for Docusaurus docs site)
- **Git**

### Clone and Install

```bash
git clone https://github.com/opsflow-sh/xopsbot.git
cd xopsbot
bun install
```

### Run the Wizard (Development)

```bash
bun run wizard
```

### Run the Docs Site (Development)

```bash
cd docs-site
npm install
npm start
```

The docs site opens at `http://localhost:3000/xopsbot/`.

## Project Structure

```
xopsbot/                  # Root
  package.json            # Bun project config
  xopsbot/                # Core xops.bot distribution
    schemas/              # Zod schemas
    safety/               # Risk classifications
    workspaces/           # Agent workspace templates (5 agents)
    profiles/             # Environment profiles (dev/stage/prod)
    wizard/               # Setup wizard
  docs-site/              # Docusaurus documentation site
    docs/                 # Documentation pages
    src/css/              # Custom theme (cyan/blue)
    docusaurus.config.ts  # Site configuration
    sidebars.ts           # Sidebar structure
  docs/                   # Additional docs (landing page brief)
  .github/workflows/      # CI/CD workflows
```

## Key Concepts

### Configuration Layer on OpenClaw

xops.bot is not a standalone application. It is a configuration layer that extends [OpenClaw](https://github.com/openclaw) with DevOps-specific agent personalities, safety constraints, and onboarding tooling. Changes should respect this architecture.

### Four-File Workspace Pattern

Every agent workspace follows the same structure:

| File | Purpose |
|------|---------|
| `SOUL.md` | Who the agent is (personality, constraints) |
| `AGENTS.md` | How the agent operates (workflows, escalation) |
| `IDENTITY.md` | What the agent looks like (display name, greeting) |
| `TOOLS.md` | What tools the agent uses (conventions, risk levels) |

See [Architecture](/developer-guide/architecture) for details.

### Bot Naming Convention

All agents use the **Bot** suffix (K8s Bot, RCA Bot, etc.) to maintain a friendly, approachable identity. Never use "Agent" in user-facing names.

### Safety Modes

All agent operations respect the configured safety mode:

- **Full** -- no prompts, development only
- **Standard** -- mutations require approval
- **Safe** -- read-only

## Making Changes

### Agent Workspaces

To modify an existing agent, edit the relevant files in `xopsbot/workspaces/<agent>/`. To add a new agent, see the [Adding Agents](/developer-guide/adding-agents) guide.

### Profiles

Profile templates are in `xopsbot/profiles/`. Changes to profile structure should also update the Zod schema in `xopsbot/schemas/profile.schema.ts`.

### Wizard

The setup wizard is in `xopsbot/wizard/`. It uses `@clack/prompts` for the terminal UI and `picocolors` for styling.

### Documentation

Documentation lives in `docs-site/docs/`. The site uses Docusaurus 3 with TypeScript configuration. Always update docs when changing user-facing behavior.

To preview changes:

```bash
cd docs-site
npm start
```

## Code Conventions

| Area | Convention |
|------|-----------|
| Runtime | Bun for xops.bot core, Node/npm for docs site |
| Language | TypeScript throughout |
| Config format | JSON5 for generated configs, JSON for templates |
| Schema validation | Zod |
| CLI prompts | @clack/prompts |
| Styling | picocolors (terminal), Infima CSS variables (docs) |
| Naming | Bot suffix for agents, kebab-case for directories |

## Branching

- `main` -- stable branch, docs deploy from here
- Feature branches -- create from `main`, PR back to `main`

## Commit Messages

Use conventional commits:

```
feat(scope): add new feature
fix(scope): fix bug description
docs(scope): update documentation
chore(scope): tooling or config change
```

Scope is typically the phase-plan identifier (e.g., `02-04`) or the component name.
