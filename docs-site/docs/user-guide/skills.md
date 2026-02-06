---
sidebar_position: 5
title: DevOps Skills
description: Available DevOps skills, what they do, how they trigger, and how safety modes affect their behavior.
---

# DevOps Skills

xops.bot ships with ten DevOps skills that give agents domain expertise. Each skill is a structured knowledge file in OpenClaw format -- when you ask the agent something relevant, it automatically loads the right skill to guide its response.

You do not install or activate skills manually. The agent reads the skill description and decides whether to load it based on what you are asking.

## How Skills Work

Skills are Markdown files with YAML frontmatter. The `description` field is the primary trigger -- OpenClaw reads it to decide if a skill is relevant to your current conversation. The body contains workflows, commands, best practices, and troubleshooting tables that the agent uses to give accurate, actionable answers.

Each skill declares its required binaries (e.g., `kubectl`, `docker`, `terraform`). If the binary is not available on the host, the skill still loads but the agent will note the missing tool.

## Kubernetes

### k8s-deploy

Safe Kubernetes deployment practices, rollout strategies, and rollback procedures.

**Triggers when you ask about:**
- Deploying new application versions
- Rolling back failed deployments
- Scaling applications up or down
- Managing deployment strategies (rolling, blue-green, canary)
- Pre-deployment health checks

**Key workflows:**
- Pre-deployment checklist (cluster health, image verification, state backup)
- Deployment methods (image update, manifest apply, patch)
- Rollout management (status, pause/resume, rollback)
- Scaling (manual and HPA autoscaling)
- Post-deployment verification and smoke tests

**Required tools:** `kubectl`

### k8s-debug

Kubernetes debugging and troubleshooting workflows for diagnosing cluster issues.

**Triggers when you ask about:**
- Pods crashing or restarting (CrashLoopBackOff, OOMKilled)
- Services not responding
- Deployments stuck in Pending state
- Resource constraints and capacity issues
- Network connectivity problems between services
- Container log analysis

**Key workflows:**
- Quick diagnosis commands (pod status, events, logs)
- Common pod state resolution (CrashLoopBackOff, ImagePullBackOff, Pending, OOMKilled)
- Resource debugging (usage, requests/limits)
- Network debugging (service connectivity, DNS)
- Debugging checklist (7-step systematic approach)

**Required tools:** `kubectl`

## Containers

### docker-ops

Docker container operations, debugging, and resource management.

**Triggers when you ask about:**
- Managing Docker containers (start, stop, restart)
- Checking container logs
- Debugging container startup issues
- Inspecting container state and configuration
- Cleaning up Docker resources (prune)
- Monitoring container resource usage
- Troubleshooting network connectivity between containers

**Key workflows:**
- Quick status commands (list, logs, stats)
- Container management (start/stop/restart, exec, inspect)
- Image management (list, pull, push)
- Cleanup commands (container/image/volume/network prune)
- Debugging (startup failures, network issues, resource limits)

**Required tools:** `docker`

## Cloud

### aws-ops

AWS operations, resource queries, and cloud infrastructure management using the AWS CLI.

**Triggers when you ask about:**
- Managing EC2 instances (list, start, stop)
- Querying S3 storage (list, copy, sync)
- Working with EKS clusters
- Searching CloudWatch logs
- Checking IAM permissions
- Invoking Lambda functions
- Managing RDS databases
- Investigating AWS costs and billing

**Key workflows:**
- Setup and authentication (identity check, profile switching)
- EC2 instance management (list, actions, details)
- S3 storage operations (list, copy, sync, bucket info)
- EKS cluster management (list, kubeconfig update)
- CloudWatch log querying (tail, search with Insights)
- IAM user/role management and permission checking
- Lambda function invocation and log viewing
- RDS database listing and status
- Cost and billing queries (month-to-date, by service)

**Required tools:** `aws`

## Infrastructure as Code

### terraform-workflow

Terraform infrastructure as code workflows and best practices.

**Triggers when you ask about:**
- Managing infrastructure with Terraform
- Reviewing and applying plans
- Debugging state issues
- Importing existing resources into Terraform
- Managing Terraform workspaces
- Handling state locking
- Following IaC best practices for safe infrastructure changes

**Key workflows:**
- Basic workflow (init, plan, apply, destroy)
- State management (view, move, remove, import, pull, locking)
- Workspace management (list, create, switch)
- Validation and formatting (validate, fmt)
- Output and variable management
- Debugging (verbose logging, common issues, refresh)
- Safe practices (plan review checklist, safe apply workflow, prevent_destroy)
- Module management and CI/CD integration
- Security scanning (tfsec, checkov, trivy)

**Required tools:** `terraform`

### ansible-ops

Ansible configuration management operations, playbook execution, and server automation.

**Triggers when you ask about:**
- Running Ansible playbooks
- Managing server configurations
- Performing ad-hoc commands across hosts
- Debugging Ansible connectivity
- Checking playbook changes with dry-run
- Managing inventory (static and dynamic)
- Using Ansible roles and collections
- Managing secrets with Ansible Vault

**Key workflows:**
- Pre-run checks (version verification, connectivity testing)
- Basic workflow (ad-hoc commands, playbook execution, dry-run)
- Inventory management (list hosts, host patterns, dynamic inventory)
- Role and collection management (Galaxy install, requirements files)
- Vault secret management (encrypt, decrypt, view, edit, rekey)
- Debugging (verbose output, syntax check, common issues)
- Safe practices (progressive deployment, idempotent patterns, backup before changes)

**Required tools:** `ansible`, `ansible-playbook`

## Observability

### observability-rca

Observability-driven root cause analysis correlating Prometheus metrics, Loki logs, and Jaeger traces.

**Triggers when you ask about:**
- Investigating service degradation or outages
- Correlating metrics with logs for a specific time window
- Tracing request flows through distributed services
- Performing root cause analysis with observability data
- Diagnosing latency spikes or error rate increases
- Following the metrics-to-logs-to-traces investigation workflow

**Key workflows:**
- Metrics analysis (PromQL queries via promtool for error rates, latency, resource usage)
- Log investigation (LogQL queries via logcli for error patterns, rate calculations)
- Trace analysis (Jaeger API queries via curl for request flow, dependency graphs)
- Cross-signal correlation (aligning findings across metrics, logs, and traces)
- Troubleshooting decision tree (symptom to signal to query)

**Required tools:** `promtool`, `logcli`, `curl`

**Available to:** RCA Bot

## Incident Response

### incident-analysis

Systematic incident investigation and evidence gathering for infrastructure incidents.

**Triggers when you ask about:**
- Investigating a production incident
- Assessing impact and blast radius
- Checking what changed recently in the cluster
- Gathering evidence from metrics and logs during an incident
- Performing initial triage to classify severity
- Building an incident timeline

**Key workflows:**
- Initial assessment (pod status, recent events, endpoint health)
- Evidence collection (deployments, config changes, scaling events)
- Severity classification checklist
- Investigation patterns (error spikes, latency, unavailability, cascading failures)
- Timeline construction from multiple data sources

**Required tools:** `kubectl`

**Available to:** Incident Bot

### incident-response

Incident response and mitigation workflows for active production incidents.

**Triggers when you ask about:**
- Mitigating an active outage
- Rolling back a failed deployment during an incident
- Isolating affected components to reduce blast radius
- Scaling services to handle load during degradation
- Coordinating structured incident response

**Key workflows:**
- Stabilization playbook (rollback, isolate, scale)
- Mitigation decision trees (rollback vs scale vs isolate)
- Traffic management (route away from affected components)
- Recovery verification (metrics returning to baseline)
- Handoff to RCA with structured format

**Required tools:** `kubectl`

**Available to:** Incident Bot

### incident-rca

Incident root cause analysis combining observability data with structured investigation methodology.

**Triggers when you ask about:**
- Conducting post-incident RCA
- Reconstructing incident timelines from multiple data sources
- Tracking hypotheses during root cause investigation
- Identifying contributing factors beyond the proximate cause
- Writing blameless postmortem reports
- Correlating deployment changes with incident onset

**Key workflows:**
- RCA workflow (data collection, timeline reconstruction, hypotheses, root cause)
- Contributing factor analysis (changes, environment, process)
- Blameless postmortem template
- Common RCA patterns (deployment regression, resource exhaustion, dependency failure, config drift)

**Required tools:** `kubectl`, `promtool`, `logcli`, `curl`

**Available to:** Incident Bot, RCA Bot

## Safety Mode Integration

Every skill includes a Safety Mode Behavior section that defines how operations are classified under each safety mode. The classification varies by domain because risk is context-dependent -- a `kubectl get` is very different from a `terraform destroy`.

The general pattern across all skills:

| Operation Type | Safe Mode | Standard Mode | Full Mode |
|---------------|-----------|---------------|-----------|
| Read-only commands | Allowed | Auto-execute | Auto-execute |
| Mutations (state changes) | Blocked | Requires approval | Executes with awareness |
| Destructive operations | Blocked | Requires approval + confirmation | Requires awareness |

### Domain-specific classifications

Each skill defines its own read-only, mutation, and destructive categories:

| Skill | Read-only | Mutations | Destructive |
|-------|-----------|-----------|-------------|
| k8s-deploy | get, describe, rollout status | apply, set image, scale, patch | rollback, delete, scale to zero |
| k8s-debug | get, describe, logs, events, top | exec into pod, run debug pod | restart, scale, delete pod |
| docker-ops | ps, logs, inspect, stats | start, stop, restart, exec | kill, prune, system prune |
| aws-ops | describe, list, get, ls, cost queries | start, stop, create, invoke | terminate, delete, sync --delete |
| terraform-workflow | plan, show, state list, validate, output | apply, import, state mv, taint | destroy, state rm, force-unlock |
| ansible-ops | --check, --diff, --list-hosts, ping, setup | ansible-playbook (without --check) | vault operations, ad-hoc mutations |
| observability-rca | promtool query, logcli query, curl GET (Jaeger) | promtool push metrics | tsdb bench write, tsdb create-blocks-from |
| incident-analysis | get, describe, logs, events, top | -- | -- |
| incident-response | get, describe, rollout status | rollout undo, scale, patch, apply, delete | -- |
| incident-rca | get, describe, logs, events, promtool query, logcli query | -- | -- |

For full details on safety modes and risk classifications, see [Safety Configuration](./safety-configuration.md).

## Skill Locations

Each skill exists in two locations: the agent workspace (used by that specific agent) and the shared directory (available to all agents).

| Skill | Agent | Workspace Path | Shared Path |
|-------|-------|---------------|-------------|
| k8s-deploy | K8s Bot | `xopsbot/workspaces/k8s-agent/skills/k8s-deploy/` | `xopsbot/skills/k8s-deploy/` |
| k8s-debug | K8s Bot | `xopsbot/workspaces/k8s-agent/skills/k8s-debug/` | `xopsbot/skills/k8s-debug/` |
| docker-ops | K8s Bot | `xopsbot/workspaces/k8s-agent/skills/docker-ops/` | `xopsbot/skills/docker-ops/` |
| aws-ops | Platform Bot | `xopsbot/workspaces/platform-agent/skills/aws-ops/` | `xopsbot/skills/aws-ops/` |
| terraform-workflow | Platform Bot | `xopsbot/workspaces/platform-agent/skills/terraform-workflow/` | `xopsbot/skills/terraform-workflow/` |
| ansible-ops | Platform Bot | `xopsbot/workspaces/platform-agent/skills/ansible-ops/` | `xopsbot/skills/ansible-ops/` |
| observability-rca | RCA Bot | `xopsbot/workspaces/rca-agent/skills/observability-rca/` | `xopsbot/skills/observability-rca/` |
| incident-analysis | Incident Bot | `xopsbot/workspaces/incident-agent/skills/incident-analysis/` | `xopsbot/skills/incident-analysis/` |
| incident-response | Incident Bot | `xopsbot/workspaces/incident-agent/skills/incident-response/` | `xopsbot/skills/incident-response/` |
| incident-rca | Incident Bot, RCA Bot | `xopsbot/workspaces/incident-agent/skills/incident-rca/`, `xopsbot/workspaces/rca-agent/skills/incident-rca/` | `xopsbot/skills/incident-rca/` |

Both copies are identical. The workspace copy is loaded by the assigned agent. The shared copy ensures any agent can access any skill when needed.
