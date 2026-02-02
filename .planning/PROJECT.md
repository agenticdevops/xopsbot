# xops.bot

## What This Is

A lightweight, DevOps-specialist AI agent built on OpenClaw patterns. xops.bot is a personal bot for DevOps engineers that uses existing LLM subscriptions (Claude Pro/Max, ChatGPT, Gemini) with built-in safety for infrastructure operations. Think "Nanobot simplicity meets OpenClaw power" — focused exclusively on DevOps workflows.

## Core Value

DevOps engineers can safely interact with their infrastructure tools (kubectl, Docker, AWS, Terraform) through natural conversation, with mutations requiring explicit approval.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Provider Integration:**
- [ ] Use existing Claude Pro/Max subscription (sessionKey auth pattern from OpenClaw)
- [ ] Support ChatGPT subscription
- [ ] Support Gemini subscription
- [ ] Provider fallback when one is unavailable

**Interfaces:**
- [ ] TUI (rich terminal UI)
- [ ] Chat integration (Telegram)
- [ ] Chat integration (Slack)
- [ ] Web dashboard

**Core Agent Features (from OpenClaw):**
- [ ] Conversational agent with context awareness
- [ ] Heartbeat system for proactive monitoring/alerts
- [ ] Canvas/live UI for rich terminal rendering
- [ ] Skill system for modular capabilities

**DevOps Tools (Day 1):**
- [ ] kubectl/Kubernetes operations
- [ ] Docker container management
- [ ] AWS CLI operations
- [ ] Terraform infrastructure management

**Safety (from moltbot-devops-presets):**
- [ ] Three-tier safety model: Safe (read-only) / Standard (approval for mutations) / Full (all allowed)
- [ ] Risk classification for commands (LOW/MEDIUM/HIGH/CRITICAL)
- [ ] Approval workflow for mutations
- [ ] Audit trail for all operations

**Skills (from agentic-ops-skills + devops-execution-engine):**
- [ ] k8s-deploy skill
- [ ] k8s-debug skill
- [ ] docker-ops skill
- [ ] aws-ops skill
- [ ] terraform-workflow skill
- [ ] incident-response skill
- [ ] system-health skill
- [ ] log-analysis skill

### Out of Scope

- Mobile app — web-first for v1
- Multi-tenant/team features — personal use first
- MCP-only approach — direct CLI tool access preferred, MCP optional
- OAuth login for xops.bot itself — local-first, no account needed
- AOF/Rust integration — TypeScript for v1 to get provider auth working

## Context

**Heritage:**
- Built on/inspired by OpenClaw (conversational agent, heartbeat, canvas, skill system, provider auth)
- Safety model from moltbot-devops-presets (Safe/Standard/Full tiers)
- DevOps skills from agentic-ops-skills and devops-execution-engine
- Simplicity ethos from Nanobot (minimal, hackable, focused)

**Why this exists:**
The user has failed to get existing Claude/ChatGPT subscriptions working with AOF (pure Rust). OpenClaw and OpenCode have proven TypeScript patterns for sessionKey extraction and provider auth. xops.bot adopts these patterns while focusing exclusively on DevOps use cases.

**Target user:**
- v1: The developer themself (dogfooding)
- v1.x: Solo DevOps engineers managing their own infrastructure

**Domain:**
- xops.bot (purchased)

**Existing code to leverage:**
- `/Users/gshah/work/opsflow-sh/experiments/openclaw/` — provider auth, agent patterns
- `/Users/gshah/work/opsflow-sh/experiments/moltbot-devops-presets/` — safety model
- `/Users/gshah/work/opsflow-sh/experiments/agentic-ops-skills/` — skill library
- `/Users/gshah/work/opsflow-sh/experiments/devops-execution-engine/` — execution patterns

## Constraints

- **Provider auth**: Must use existing LLM subscriptions (Claude Pro/Max, ChatGPT, Gemini) — non-negotiable
- **Tech stack**: TypeScript/Node.js (required for proven provider auth patterns)
- **Priority**: Speed to market over architectural purity
- **Safety default**: Standard mode (approval for mutations) as default
- **Location**: Build in `xopsbot/` directory

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| TypeScript over Rust | Provider auth patterns proven in OpenClaw/OpenCode, failed in pure Rust | — Pending |
| OpenClaw-based architecture | Has conversational agent, heartbeat, canvas, skills, provider auth we need | — Pending |
| Standard safety as default | Balance usability with safety for personal DevOps use | — Pending |
| Direct CLI tools over MCP-only | MCP is brittle, eats context, has service management overhead | — Pending |

---
*Last updated: 2025-02-02 after initialization*
