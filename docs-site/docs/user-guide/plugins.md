---
sidebar_position: 7
title: Plugins
description: Install and manage skill + tool bundles
---

# Plugins

Plugins bundle related skills and tools into installable packages. Instead of manually selecting individual tools and skills, install a plugin to get everything you need for a domain. For example, the `kubernetes` plugin gives you the k8s-deploy and k8s-debug skills along with the kubectl tool -- all configured and ready to use.

Plugins handle the mechanics of skill placement, registry tracking, and exec-approvals regeneration. You install, and the plugin system does the rest.

## Available Plugins

xops.bot ships with five built-in plugins covering the core DevOps domains.

| Plugin | Skills | Tools | Workspaces |
|--------|--------|-------|------------|
| **kubernetes** | k8s-deploy, k8s-debug | kubectl | k8s-agent |
| **docker** | docker-ops | docker | k8s-agent |
| **aws** | aws-ops | aws | finops-agent, platform-agent |
| **terraform** | terraform-workflow, ansible-ops | terraform, ansible | platform-agent |
| **observability** | observability-rca, incident-analysis, incident-response, incident-rca | promtool, logcli, jaeger | rca-agent, incident-agent |

### kubernetes

Kubernetes operations: deployments, debugging, and container management. Install this plugin to get safe deployment workflows (rolling updates, rollback procedures, scaling) and structured debugging (CrashLoopBackOff diagnosis, resource debugging, network troubleshooting). Ideal for teams managing Kubernetes clusters.

### docker

Docker container operations: builds, images, and container lifecycle. Covers container management (start, stop, restart), log analysis, resource monitoring, and cleanup commands. Assigned to the k8s-agent workspace since container operations are closely related to Kubernetes workflows.

### aws

AWS cloud operations: EC2, S3, IAM, Lambda, and cost management. Provides workflows for managing AWS infrastructure, querying resources, and investigating costs. Assigned to both finops-agent (for cost analysis) and platform-agent (for infrastructure management).

### terraform

Infrastructure as Code: Terraform workflows and Ansible configuration management. Bundles both IaC tools into a single plugin since they frequently work together in platform engineering. Terraform is required; Ansible binaries are optional (the plugin still installs if only Terraform is available).

### observability

Observability and incident response: metrics, logs, traces, and RCA workflows. The largest plugin, bundling four skills that cover the full incident lifecycle -- from initial investigation (incident-analysis) through active response (incident-response) to post-incident root cause analysis (incident-rca and observability-rca). Assigned to both rca-agent and incident-agent workspaces.

## Installing Plugins

```bash
bun run xopsbot/cli/plugin.ts install kubernetes
```

When you install a plugin, the system:

1. **Resolves dependencies** -- If the plugin depends on another plugin, dependencies are installed first (topological order).
2. **Copies skills** -- Skill files are copied to both the shared directory (`~/.xopsbot/skills/`) and each workspace directory (`~/.xopsbot/workspaces/<workspace>/skills/`).
3. **Updates the registry** -- The plugin is recorded in `~/.xopsbot/plugins/registry.json` with its version, install timestamp, and enabled status.
4. **Regenerates exec-approvals** -- The `~/.openclaw/exec-approvals.json` file is rebuilt to include binary patterns for all enabled plugins' tools.

Example output:

```
Installed kubernetes plugin (2 skills, 1 tools)
```

If the plugin is already installed:

```
Plugin kubernetes is already installed.
```

## Listing Plugins

```bash
bun run xopsbot/cli/plugin.ts list
```

The list command shows all available plugins with their current status:

```
Plugins

  * kubernetes        installed, enabled
    Kubernetes operations: deployments, debugging, and container management
    Skills: k8s-deploy, k8s-debug  |  Tools: kubectl

  o docker            installed, disabled
    Docker container operations: builds, images, and container lifecycle
    Skills: docker-ops  |  Tools: docker

  - aws               not installed
    AWS cloud operations: EC2, S3, IAM, Lambda, and cost management
    Skills: aws-ops  |  Tools: aws
```

**Status indicators:**

| Indicator | Meaning |
|-----------|---------|
| `*` (green) | Installed and enabled -- skills are active, tools are in exec-approvals |
| `o` (yellow) | Installed but disabled -- skills remain on disk, tools removed from exec-approvals |
| `-` (dim) | Not installed |

## Enabling and Disabling

Disable a plugin to temporarily remove its tools from exec-approvals without uninstalling:

```bash
bun run xopsbot/cli/plugin.ts disable kubernetes
```

Re-enable it later:

```bash
bun run xopsbot/cli/plugin.ts enable kubernetes
```

**What disabling does:**

- Marks the plugin as disabled in the registry
- Regenerates exec-approvals.json **without** the disabled plugin's tool binary patterns
- Skill files remain on disk (not deleted)

**What disabling does NOT do:**

- Does not remove skill files from shared or workspace directories
- Does not remove the plugin from the registry

This is a soft-disable. The agent loses permission to execute the plugin's tool binaries (via exec-approvals), but the skill knowledge files are still present. Re-enabling restores tool access immediately.

## Removing Plugins

```bash
bun run xopsbot/cli/plugin.ts remove kubernetes
```

Removal is a full uninstall:

1. **Checks for dependents** -- If another installed plugin depends on this one, removal is blocked. Remove the dependent plugin first.
2. **Deletes skill files** -- Removes skills from both shared and workspace directories.
3. **Updates the registry** -- Removes the plugin entry from `registry.json`.
4. **Regenerates exec-approvals** -- Rebuilds without the removed plugin's tools.

If another plugin depends on the one you are removing:

```
Cannot remove observability: required by monitoring
Remove dependent plugins first.
```

## Plugin Dependencies

Plugins can declare dependencies on other plugins. When you install a plugin with dependencies, the system automatically resolves and installs them in the correct order (topological sort with cycle detection).

All five built-in plugins are independent -- none depend on another. Dependencies become relevant when creating custom plugins that build on existing ones. For example, a hypothetical "monitoring" plugin might depend on the "observability" plugin to ensure Prometheus and Loki tools are available.

During install, dependencies are installed first:

```
  Installed dependency: observability (4 skills)

Installed monitoring plugin (1 skills, 1 tools)
```

## Required Binaries

Each plugin declares which binaries must be present on the host for its tools to function. If a required binary is missing, the plugin still installs successfully, but the tools will not be able to execute commands.

| Plugin | Required Binaries | Optional Binaries |
|--------|-------------------|-------------------|
| **kubernetes** | `kubectl` | -- |
| **docker** | `docker` | -- |
| **aws** | `aws` | -- |
| **terraform** | `terraform` | `ansible`, `ansible-playbook` |
| **observability** | `promtool`, `logcli` | `curl` |

**Required** means the plugin's core functionality depends on this binary. Without it, the corresponding tool commands will fail.

**Optional** means the binary enhances the plugin but is not mandatory. The terraform plugin works without Ansible binaries (you just cannot use ansible-ops skill commands). The observability plugin works without curl (you just cannot query Jaeger's HTTP API directly).

Verify binary availability before installing:

```bash
which kubectl    # Should return a path
which terraform  # Should return a path
which promtool   # Should return a path
```
