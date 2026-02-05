---
sidebar_position: 3
title: Profiles
---

# Profiles

Profiles define **where** and **how safely** your agents operate. Each profile represents an environment (development, staging, production) with its own safety mode, audit settings, and active agent selection.

## Profile Comparison

| Setting | Development | Staging | Production |
|---------|-------------|---------|------------|
| **Safety Mode** | Full | Standard | Standard |
| **Audit Logging** | Off | On | On |
| **K8s Bot** | Yes | Yes | Yes |
| **RCA Bot** | Yes | Yes | Yes |
| **Incident Bot** | Yes | Yes | Yes |
| **FinOps Bot** | Yes | No | No |
| **Platform Bot** | Yes | Yes | No |
| **Total Agents** | 5 | 4 | 3 |

## Safety Modes

Safety modes control how mutations (create, update, delete operations) are handled:

### Full Mode

- All operations allowed without prompts
- No approval required for mutations
- **Use only in development environments**
- Audit logging is off by default

### Standard Mode

- Mutations require explicit approval before execution
- The agent shows the exact command and waits for confirmation
- **Recommended for staging and production**
- Audit logging is on by default

### Safe Mode

- Read-only operations only
- All mutations are blocked with an explanation
- Useful for monitoring and investigation-only scenarios

## Progressive Workspace Restriction

xops.bot uses a principle of least privilege across environments:

- **Development** -- All 5 agents active. Full access for experimentation.
- **Staging** -- 4 agents (no FinOps Bot). Mutations require approval.
- **Production** -- 3 agents (K8s, RCA, Incident only). Minimal surface area for critical operations.

This ensures that agents with broader permissions (FinOps Bot analyzing costs, Platform Bot modifying infrastructure) are not active in production where changes must go through formal pipelines.

## Profile Structure

Each profile is a JSON file in `xopsbot/profiles/<name>/profile.json`:

```json
{
  "name": "prod",
  "description": "Production environment - Mutations require explicit approval, full audit trail",

  "environment": {
    "KUBECONFIG": "~/.kube/prod-config",
    "AWS_PROFILE": "prod",
    "AWS_REGION": "us-west-2"
  },

  "safety": {
    "mode": "standard",
    "audit_logging": true
  },

  "active_workspaces": [
    "k8s-agent",
    "rca-agent",
    "incident-agent"
  ],

  "bindings": [
    {
      "channel": "slack",
      "peer": "#ops-alerts",
      "agentId": "xops-incident"
    }
  ]
}
```

## Schema

Profiles are validated against a Zod schema defined in `xopsbot/schemas/profile.schema.ts`:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Profile name (1-50 chars) |
| `description` | string | No | Human-readable description |
| `environment` | Record | No | Environment variables |
| `safety.mode` | enum | Yes | `safe`, `standard`, or `full` |
| `safety.audit_logging` | boolean | No | Enable audit trail (default: true) |
| `active_workspaces` | string[] | Yes | At least one workspace |
| `bindings` | array | No | Channel-to-agent bindings |

## Bindings

Bindings connect communication channels to specific agents. They are optional and primarily used in production for automated alerting:

```json
{
  "channel": "slack",
  "peer": "#ops-alerts",
  "agentId": "xops-incident"
}
```

This routes messages from `#ops-alerts` on Slack directly to Incident Bot.

## Choosing a Profile

- **Starting out?** Use **Development** for full access while learning.
- **Testing workflows?** Use **Staging** to practice with approval gates.
- **Running in production?** Use **Production** for the safest configuration.

The setup wizard helps you choose the right safety mode. See the [Setup Wizard](/user-guide/setup-wizard) for details.
