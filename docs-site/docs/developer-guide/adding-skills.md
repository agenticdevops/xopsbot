---
sidebar_position: 5
title: Adding Skills
description: How to create new DevOps skills in OpenClaw canonical format for xops.bot.
---

# Adding Skills

Skills are the domain knowledge files that give xops.bot agents expertise in specific DevOps tools and workflows. This guide explains how to create new skills following the OpenClaw canonical format.

## Skill Format

A skill is a Markdown file named `SKILL.md` with YAML frontmatter and a structured body.

### Frontmatter

```yaml
---
name: skill-name
description: "A trigger-rich description of what this skill covers. Use when [context 1], [context 2], [context 3], [context 4], [context 5], or [context 6] with [tool binary]."
metadata:
  {
    "openclaw":
      {
        "emoji": "emoji_name",
        "requires": { "bins": ["tool-binary"] },
      },
  }
---
```

**Fields:**

| Field | Required | Purpose |
|-------|----------|---------|
| `name` | Yes | Unique skill identifier. Use lowercase with hyphens (e.g., `helm-ops`). |
| `description` | Yes | Primary trigger mechanism. OpenClaw reads this to decide whether to load the skill. |
| `metadata.openclaw.emoji` | Yes | Emoji name (without colons) displayed in skill listings. |
| `metadata.openclaw.requires.bins` | Yes | Array of binary names the skill depends on. |

### Description: The Primary Trigger

:::caution
The `description` field is the single most important part of your skill file. OpenClaw uses it to decide whether to load the skill body into context. A weak description means the skill never triggers.
:::

Write descriptions that are rich in trigger contexts. Include 5-6 specific scenarios where the skill should activate. Always end with the tool binary name so OpenClaw can match on tool mentions.

**Good description:**

```
"Helm chart management and Kubernetes package operations. Use when installing Helm charts,
upgrading releases, rolling back failed deployments, managing chart repositories,
debugging release history, or templating charts for review with helm."
```

**Bad description:**

```
"Helm operations."
```

The good description triggers on "install a chart", "upgrade the release", "roll back", "add repo", "release history", "template the chart", and "helm". The bad description only triggers on "helm operations".

### Metadata Structure

The metadata block uses OpenClaw's JSON format nested inside YAML. The `requires.bins` array tells OpenClaw which binaries must be present for the skill to be fully functional.

Multiple binaries are supported when a tool ecosystem uses separate executables:

```yaml
metadata:
  {
    "openclaw":
      {
        "emoji": "gear",
        "requires": { "bins": ["ansible", "ansible-playbook"] },
      },
  }
```

## Body Guidelines

The body is standard Markdown that the agent reads when the skill is loaded. Follow these guidelines:

### Length

Keep skills under 500 lines. OpenClaw loads the entire skill into context, so longer files consume more tokens without proportional benefit. If a skill exceeds 500 lines, split it into two skills (e.g., `helm-deploy` and `helm-debug`).

### Structure

Use a consistent section pattern:

1. **Title** -- `# Tool Name` with a one-line summary
2. **Setup / Pre-checks** -- Verify tool is configured correctly
3. **Core Workflows** -- The most common operations, grouped logically
4. **Debugging** -- Troubleshooting tables and diagnostic commands
5. **Safe Practices** -- Domain-specific safety guidance
6. **Quick Reference** -- Condensed command cheat sheet
7. **Safety Mode Behavior** -- How operations map to safety modes
8. **Related Skills** -- Cross-references to complementary skills

### Content Style

- **Concrete commands over theory.** Show the exact `kubectl`, `docker`, or `terraform` command, not an abstract explanation.
- **Include expected output context.** When a command produces important output, note what to look for.
- **Use tables for decision trees.** Symptom/Check/Fix tables are scannable under pressure.
- **Group by task, not by command.** Organize around what the user is trying to do, not alphabetical command listings.

## Safety Mode Behavior Section

Every skill must include a Safety Mode Behavior section near the end. This documents how operations in this skill domain are classified under each safety mode.

### Template

```markdown
## Safety Mode Behavior

This skill respects the configured xops.bot safety mode:

| Operation Type | Safe Mode | Standard Mode | Full Mode |
|---------------|-----------|---------------|-----------|
| Read-only (list the read-only commands) | Allowed | Auto-execute | Auto-execute |
| Mutations (list the mutation commands) | Blocked | Requires approval | Executes with awareness |
| Destructive (list the destructive commands) | Blocked | Requires approval + confirmation | Requires awareness |

Always check the current safety mode before executing mutations. When in doubt, prefer [safe alternative] first.
```

Classify operations into three tiers:

| Tier | Definition | Examples |
|------|-----------|---------|
| Read-only | No side effects, does not modify state | `get`, `describe`, `list`, `--check`, `plan` |
| Mutations | Modifies state but is recoverable | `apply`, `start`, `stop`, `scale`, `install` |
| Destructive | Hard to reverse or high-blast-radius | `delete`, `destroy`, `prune`, `force-unlock` |

The classification must be domain-appropriate. What counts as "destructive" differs between Kubernetes (delete pod) and Terraform (destroy infrastructure).

## File Placement

Each skill file must be placed in **two locations**:

1. **Agent workspace** -- The skill is loaded by the assigned agent
2. **Shared directory** -- The skill is available to any agent

Both copies must be identical. Do not use symlinks -- the setup wizard copies `~/.xopsbot/` to user machines, and symlinks would break.

### Directory structure

```
xopsbot/
  workspaces/
    <agent>/
      skills/
        <skill-name>/
          SKILL.md          # Workspace copy
  skills/
    <skill-name>/
      SKILL.md              # Shared copy
```

### Workspace Assignment

| Domain | Agent | Workspace |
|--------|-------|-----------|
| Kubernetes (k8s-*) | K8s Bot | `xopsbot/workspaces/k8s-agent/skills/` |
| Containers (docker-*) | K8s Bot | `xopsbot/workspaces/k8s-agent/skills/` |
| AWS Cloud (aws-*) | Platform Bot | `xopsbot/workspaces/platform-agent/skills/` |
| Infrastructure as Code (terraform-*, ansible-*) | Platform Bot | `xopsbot/workspaces/platform-agent/skills/` |
| Observability (prometheus-*, loki-*, jaeger-*) | Observability Bot | `xopsbot/workspaces/observability-agent/skills/` |
| Incident Response (incident-*, rca-*) | Incident Bot | `xopsbot/workspaces/incident-agent/skills/` |
| Cost/FinOps (finops-*, cost-*) | FinOps Bot | `xopsbot/workspaces/finops-agent/skills/` |

If a skill spans multiple domains, assign it to the most natural agent and place the shared copy for cross-agent access.

## Example: Existing Skills

The six skills shipped with xops.bot are good references for format and style:

| Skill | Lines | Sections | Good example of |
|-------|-------|----------|-----------------|
| `k8s-deploy` | ~327 | 10 | Deployment workflows, strategy patterns |
| `k8s-debug` | ~252 | 8 | Troubleshooting tables, diagnostic flows |
| `docker-ops` | ~266 | 9 | Quick reference commands, cleanup patterns |
| `aws-ops` | ~351 | 12 | Multi-service coverage, cost queries |
| `terraform-workflow` | ~332 | 13 | IaC workflow, CI/CD integration, security scanning |
| `ansible-ops` | ~344 | 8 | Vault management, progressive deployment |

Read these in `xopsbot/skills/` before writing a new skill.

## Checklist

Before submitting a new skill, verify:

- [ ] **Frontmatter complete** -- `name`, `description`, `metadata` with `emoji`, `requires.bins`
- [ ] **Description is trigger-rich** -- 5-6 specific trigger contexts, ends with tool name
- [ ] **Body under 500 lines** -- Split into two skills if longer
- [ ] **Concrete commands** -- Real CLI examples, not abstract explanations
- [ ] **Troubleshooting table** -- At least one Symptom/Check/Fix table
- [ ] **Safety Mode Behavior section** -- Three-tier classification for this domain
- [ ] **Related Skills section** -- Cross-references to complementary skills
- [ ] **Workspace copy** -- Placed in correct agent workspace directory
- [ ] **Shared copy** -- Placed in `xopsbot/skills/<skill-name>/SKILL.md`
- [ ] **Both copies identical** -- No differences between workspace and shared
- [ ] **Risk classifications updated** -- If adding a new tool, update `xopsbot/safety/risk-classifications.json`
- [ ] **Documentation updated** -- Add the skill to the [DevOps Skills user guide](../user-guide/skills.md)
