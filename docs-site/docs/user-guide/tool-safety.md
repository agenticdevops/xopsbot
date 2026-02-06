---
sidebar_position: 6
title: Tool Safety
description: How xops.bot classifies every DevOps tool command by risk level, and how safety modes control execution behavior.
---

# Tool Safety

xops.bot classifies every DevOps tool command by risk level. This classification drives approval behavior -- whether a command runs automatically, requires your approval, or is blocked entirely depends on its risk level and your current safety mode.

## Risk Classification

Every command that xops.bot can execute is assigned one of four risk levels:

| Risk Level | Meaning | Examples |
|------------|---------|----------|
| **LOW** | Read-only, no side effects. Retrieves information without changing anything. | `kubectl get`, `docker ps`, `aws describe` |
| **MEDIUM** | Diagnostic or local operations. May access resources but does not modify remote state. | `terraform plan`, `ansible --check`, `terraform init` |
| **HIGH** | Mutations that modify state. Creates, updates, or reconfigures infrastructure. | `kubectl apply`, `docker run`, `aws ec2 run-instances` |
| **CRITICAL** | Destructive operations that cannot be easily undone. Deletes resources, removes data, or tears down infrastructure. | `kubectl delete`, `docker rm`, `terraform destroy` |

Commands not explicitly classified inherit the tool's default risk level (typically MEDIUM).

## How Safety Modes Interact with Risk Levels

Your safety mode determines what happens when a command at each risk level is executed:

| Risk Level | Safe Mode | Standard Mode | Full Mode |
|------------|-----------|---------------|-----------|
| **LOW** | Allowed (prompted) | Auto-execute | Auto-execute |
| **MEDIUM** | Allowed (prompted) | Auto-execute | Auto-execute |
| **HIGH** | Blocked | Requires approval | Executes with awareness |
| **CRITICAL** | Blocked | Requires approval + confirmation | Requires awareness |

**Key behaviors:**

- **Safe Mode** blocks all mutations. Even read-only commands prompt for confirmation. Use this for production monitoring and on-call investigation.
- **Standard Mode** (default) runs read-only commands freely. Mutations require your explicit "yes" before executing. Critical commands ask twice.
- **Full Mode** runs everything without prompts. Only use this in trusted development environments.

For detailed mode configuration, see [Safety Configuration](./safety-configuration.md).

## Per-Tool Reference

### kubectl

Kubernetes command-line tool. 35 classified commands.

| Command | Risk | Description |
|---------|------|-------------|
| `get` | LOW | List resources in tabular or JSON/YAML format |
| `describe` | LOW | Show detailed information about a resource |
| `logs` | LOW | Print container logs |
| `top` | LOW | Display resource usage (CPU/memory) |
| `apply` | HIGH | Apply a configuration to a resource |
| `create` | HIGH | Create a resource from a file or stdin |
| `scale` | HIGH | Set a new size for a deployment or replica set |
| `delete` | CRITICAL | Delete resources by name, label, or file |
| `drain` | CRITICAL | Drain a node in preparation for maintenance |

**Risk modifier:** `kubectl apply --dry-run` lowers the risk from HIGH to effective LOW. Dry run validates without mutating.

### docker

Docker container runtime. 38 classified commands.

| Command | Risk | Description |
|---------|------|-------------|
| `ps` | LOW | List containers |
| `images` | LOW | List images |
| `logs` | LOW | Fetch the logs of a container |
| `stats` | LOW | Display container resource usage |
| `run` | HIGH | Create and start a new container |
| `start` | HIGH | Start a stopped container |
| `stop` | HIGH | Stop a running container |
| `push` | HIGH | Push an image to a registry |
| `rm` | CRITICAL | Remove one or more containers |
| `rmi` | CRITICAL | Remove one or more images |
| `system prune` | CRITICAL | Remove all unused data |

### aws

AWS Command Line Interface. 36 classified commands.

| Command | Risk | Description |
|---------|------|-------------|
| `describe` | LOW | Describe AWS resources |
| `list` | LOW | List AWS resources |
| `sts get-caller-identity` | LOW | Check current IAM identity |
| `ec2 run-instances` | HIGH | Launch new EC2 instances |
| `ec2 stop-instances` | HIGH | Stop running EC2 instances |
| `s3 cp` | HIGH | Copy objects to/from S3 |
| `iam create` | HIGH | Create IAM resources |
| `ec2 terminate-instances` | CRITICAL | Permanently terminate EC2 instances |
| `s3 rm` | CRITICAL | Delete objects from S3 |
| `rds delete` | CRITICAL | Delete an RDS database instance |
| `cloudformation delete-stack` | CRITICAL | Delete a CloudFormation stack |

### terraform

HashiCorp Terraform infrastructure as code. 26 classified commands.

| Command | Risk | Description |
|---------|------|-------------|
| `version` | LOW | Print Terraform version |
| `validate` | LOW | Validate configuration files |
| `show` | LOW | Show the current state or a saved plan |
| `state list` | LOW | List resources in the state |
| `plan` | MEDIUM | Generate an execution plan |
| `init` | MEDIUM | Initialize a working directory |
| `apply` | HIGH | Apply changes to infrastructure |
| `import` | HIGH | Import existing infrastructure into state |
| `state rm` | HIGH | Remove items from the state |
| `destroy` | CRITICAL | Destroy all managed infrastructure |
| `workspace delete` | CRITICAL | Delete a Terraform workspace |

**Risk modifier:** `terraform plan -out=tfplan` lowers the effective risk. A saved plan enables review before apply.

### ansible

Ansible automation platform. 18 classified commands.

| Command | Risk | Description |
|---------|------|-------------|
| `ansible --version` | LOW | Print version information |
| `ansible --list-hosts` | LOW | List hosts matching a pattern |
| `ansible-inventory --list` | LOW | List inventory in JSON format |
| `ansible-doc` | LOW | Show module documentation |
| `ansible-playbook --check` | MEDIUM | Dry-run a playbook without changes |
| `ansible-galaxy install` | MEDIUM | Install roles or collections |
| `ansible` (ad-hoc) | HIGH | Run ad-hoc commands on hosts |
| `ansible-playbook` | HIGH | Execute a playbook |
| `ansible-pull` | HIGH | Pull and execute a playbook from VCS |

**Risk modifier:** `ansible-playbook --check` lowers the risk from HIGH to MEDIUM. Check mode simulates without making changes.

### promtool

Prometheus tooling CLI for metrics queries and config validation. 22 classified commands.

| Command | Risk | Description |
|---------|------|-------------|
| `query instant` | LOW | Execute instant PromQL query |
| `query range` | LOW | Execute range PromQL query |
| `check config` | LOW | Validate Prometheus configuration files |
| `check rules` | LOW | Validate alerting and recording rule files |
| `test rules` | LOW | Unit test alerting and recording rules |
| `tsdb analyze` | LOW | Analyze TSDB block churn, cardinality, and compaction |
| `push metrics` | MEDIUM | Push metrics to Prometheus remote write endpoint |
| `tsdb bench write` | HIGH | Run write benchmarks against TSDB |
| `tsdb create-blocks-from` | HIGH | Create TSDB blocks from external data sources |

Almost entirely read-only. The only non-LOW commands are `push metrics` (MEDIUM) and two TSDB write operations (HIGH). No CRITICAL commands.

### logcli

Grafana Loki command-line tool for log queries. 6 classified commands.

| Command | Risk | Description |
|---------|------|-------------|
| `query` | LOW | Run LogQL query for logs over a time range |
| `instant-query` | LOW | Run instant LogQL query |
| `labels` | LOW | Find values for a given label |
| `series` | LOW | Query log streams matching label selectors |
| `stats` | LOW | Query index statistics |
| `volume` | LOW | Query aggregate volumes |

Entirely read-only. logcli is a pure query tool with no write operations.

### jaeger

Jaeger distributed tracing query via HTTP API. 5 classified commands.

| Command | Risk | Description |
|---------|------|-------------|
| `get-services` | LOW | List all services that have reported traces |
| `get-operations` | LOW | List operations for a given service |
| `find-traces` | LOW | Search traces by service, operation, time, duration |
| `get-trace` | LOW | Retrieve a single trace by trace ID |
| `get-dependencies` | LOW | Service dependency graph for a time range |

Entirely read-only. Jaeger has no dedicated CLI -- queries use curl against the Jaeger HTTP API v3. These are conceptual command names mapping to API endpoints.

## Workspace Tool Assignments

Each workspace has access to specific tools based on its agent's domain:

| Workspace | Agent | Tools |
|-----------|-------|-------|
| k8s-agent | K8s Bot | kubectl, docker |
| platform-agent | Platform Bot | terraform, ansible, aws |
| finops-agent | FinOps Bot | aws |
| rca-agent | RCA Bot | kubectl, promtool, logcli, jaeger |
| incident-agent | Incident Bot | kubectl, promtool, logcli, jaeger |

An agent can only execute commands for tools assigned to its workspace. K8s Bot cannot run `terraform apply`, and Platform Bot cannot run `kubectl delete`.

## Practical Examples

### Checking pod status in production (Safe Mode)

You ask K8s Bot: "Show me the pods in the payments namespace."

The bot runs `kubectl get pods -n payments`. Even though `get` is LOW risk, Safe Mode prompts you to confirm the read operation. You approve, and the bot displays the pod list.

### Deploying a new version (Standard Mode)

You ask K8s Bot: "Deploy the new payments image v2.3.1."

The bot prepares `kubectl set image deployment/payments payments=payments:v2.3.1`. This is `set`, classified as HIGH. Standard Mode shows you the exact command and asks for approval. You review and type "yes". The bot executes and confirms the rollout.

### Cleaning up dev containers (Full Mode)

You ask K8s Bot: "Prune all stopped containers and dangling images."

The bot runs `docker system prune`. This is CRITICAL, but Full Mode executes with awareness -- the bot notes the risk level in its response but does not block execution. Use Full Mode only in trusted development environments where cleanup is expected.

### Investigating a latency spike (Standard Mode)

You ask RCA Bot: "There's a latency spike in the payments service. Help me investigate."

The bot starts with metrics: `promtool query instant 'histogram_quantile(0.99, rate(http_request_duration_seconds_bucket{service="payments"}[5m]))' --server.url=http://prometheus:9090`. This is LOW risk, so Standard Mode auto-executes. The bot identifies the spike started at 10:45.

Next, logs: `logcli query '{app="payments"} |= "error"' --addr=http://loki:3100 --since=1h`. Also LOW risk, auto-executes. The bot finds connection timeout errors to the database.

Finally, traces: `curl http://jaeger:16686/api/v3/traces?query.service_name=payments&query.duration_min=2s`. LOW risk, auto-executes. The bot traces a slow request and finds the database span taking 8 seconds instead of the usual 50ms.

The bot correlates: latency spike at 10:45, database connection errors in logs starting at 10:44, traces showing database spans as the bottleneck. Root cause: database connection pool exhaustion.
