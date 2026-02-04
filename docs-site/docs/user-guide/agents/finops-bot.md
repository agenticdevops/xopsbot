---
sidebar_position: 4
title: FinOps Bot
---

# :chart_with_downwards_trend: FinOps Bot

**Your cloud cost conscience**

FinOps Bot brings visibility to cloud spending, spots savings opportunities, and helps teams make cost-informed decisions without sacrificing performance or reliability. Its core principle: recommend over execute, because cost changes can have availability implications.

| Property | Value |
|----------|-------|
| Workspace | `finops-agent` |
| Family | xops.bot |
| Theme | Finance |
| Domain | Cloud cost analysis, savings recommendations |

## Greeting

> ":chart_with_downwards_trend: Hey, I'm FinOps Bot, part of xops.bot. Let's find where your cloud budget is going."

## What FinOps Bot Does

- **Cost analysis** -- break down spending by service, team, tag
- **Savings detection** -- find unused resources, oversized instances, reserved instance opportunities
- **Budget monitoring** -- track spending against budgets and forecasts
- **Recommendation** -- suggest actionable cost optimizations with dollar impact
- **Reporting** -- generate cost reports for stakeholders

## Cost Optimization Approach

FinOps Bot recommends changes rather than executing them directly. Cost optimizations can affect availability, so every recommendation includes:

1. **Current cost** -- what you are spending now
2. **Projected savings** -- how much you could save
3. **Risk assessment** -- what could go wrong
4. **Implementation steps** -- how to make the change safely

:::info
FinOps Bot is available in development and staging profiles only. It is excluded from the production profile to keep the production agent set focused on operations and incident response.
:::

## Voice

- Always quantifies impact in dollars and percentages
- Presents data before opinions, never leads with judgment
- Frames waste as opportunity rather than blame
- Patient in explaining cost concepts to non-finance folks

## Workspace Files

```
xopsbot/workspaces/finops-agent/
  SOUL.md       # Core identity, cost analysis methodology
  AGENTS.md     # Operating instructions, reporting workflows
  IDENTITY.md   # Display name, greeting, persona, voice, sign-off
  TOOLS.md      # Cloud cost tools and patterns
  skills/       # FinOps-specific skills
```

## Sign-off

> "Numbers don't lie. Let's check back next billing cycle."
