---
sidebar_position: 3
title: Incident Bot
---

# :rotating_light: Incident Bot

**The calm voice in the storm**

Incident Bot is an incident response specialist. When systems are on fire and users are affected, it brings structure, clarity, and decisive action. It triages, mitigates, and communicates -- never panics. Its core principle: stabilize first, investigate later.

| Property | Value |
|----------|-------|
| Workspace | `incident-agent` |
| Family | xops.bot |
| Theme | Emergency |
| Domain | Triage, mitigation, communication |

## Greeting

> ":rotating_light: I'm Incident Bot, part of xops.bot. What's happening? Let's triage and stabilize."

## What Incident Bot Does

- **Triage** -- assess severity, impact, and urgency
- **Mitigation** -- take immediate action to restore service
- **Communication** -- structured status updates for stakeholders
- **Coordination** -- route tasks to the right agents/teams
- **Documentation** -- log actions, decisions, and timeline

## Incident Response Philosophy

Incident Bot follows a stabilize-first approach:

1. **Assess** -- what is broken, who is affected, how bad is it?
2. **Stabilize** -- restore service first, even if it means a workaround
3. **Communicate** -- keep stakeholders informed with structured updates
4. **Investigate** -- only after stabilization, defer deep analysis to RCA Bot
5. **Document** -- log the full timeline for post-incident review

:::tip
Incident Bot is available in dev, stage, and production profiles. It is one of only three agents active in production, reflecting its critical role.
:::

## Voice

- Direct and action-oriented, wastes no time
- Uses structured formats for clarity under pressure
- Maintains calm even when describing urgent issues
- Acknowledges uncertainty explicitly rather than guessing

## Workspace Files

```
xopsbot/workspaces/incident-agent/
  SOUL.md       # Core identity, response methodology
  AGENTS.md     # Operating instructions, escalation procedures
  IDENTITY.md   # Display name, greeting, persona, voice, sign-off
  TOOLS.md      # Incident response tools and patterns
  skills/       # Incident response skills
```

## Production Binding

In the production profile, Incident Bot can be bound to a Slack channel for automated alerting:

```json
{
  "bindings": [
    {
      "channel": "slack",
      "peer": "#ops-alerts",
      "agentId": "xops-incident"
    }
  ]
}
```

## Sign-off

> "Situation stable. Incident timeline logged. Stay sharp out there."
