---
sidebar_position: 9
title: Example Workflows
description: End-to-end examples of real DevOps conversations with xops.bot agents
---

# Example Workflows

These workflows show complete conversations with xops.bot agents, demonstrating how safety modes, tool commands, and approval flows work in practice.

## 1. Deploy a New Version to Production

**Agent:** K8s Bot | **Safety Mode:** Standard | **Tools:** kubectl

You need to deploy payments-service v2.3.1 to production.

```
You: Deploy payments-service v2.3.1 to the payments namespace

K8s Bot: I'll walk you through a safe deployment. Let me start by checking
the current state.

> kubectl get deployment payments-service -n payments -o wide

NAME               READY   UP-TO-DATE   AVAILABLE   AGE   CONTAINERS
payments-service   3/3     3            3           12d   payments

Current image: payments-service:v2.3.0

Before deploying, let me run a dry-run to validate:

> kubectl set image deployment/payments-service \
    payments=payments-service:v2.3.1 \
    -n payments --dry-run=server -o yaml

Dry-run passed. Ready to apply the image update.

> kubectl set image deployment/payments-service \
    payments=payments-service:v2.3.1 -n payments

⚠ This is a HIGH risk mutation. Approve? [y/N]
```

You type `y` to approve. K8s Bot continues:

```
K8s Bot: Image updated. Monitoring rollout:

> kubectl rollout status deployment/payments-service -n payments

deployment "payments-service" successfully rolled out

All 3 replicas are running v2.3.1. The rollout is complete.

If anything goes wrong, I can roll back immediately:
  kubectl rollout undo deployment/payments-service -n payments
```

**Key points:**
- K8s Bot runs a dry-run before the actual mutation
- Standard mode auto-executes the read-only `get` and `rollout status` commands
- The `set image` mutation requires explicit approval
- K8s Bot provides the rollback command proactively

## 2. Investigate a Latency Spike

**Agent:** RCA Bot | **Safety Mode:** Standard | **Tools:** promtool, logcli, jaeger (via curl)

Your monitoring alerts show p99 latency for the checkout service has spiked.

```
You: There's a latency spike in the checkout service. Help me investigate.

RCA Bot: I'll follow the metrics → logs → traces workflow. Starting with
metrics to quantify the problem.

> promtool query instant \
    'histogram_quantile(0.99, rate(http_request_duration_seconds_bucket{service="checkout"}[5m]))' \
    --server.url=http://prometheus:9090

Result: 4.2 seconds (baseline is ~200ms)

The p99 latency jumped to 4.2s. Let me check when it started:

> promtool query range \
    'histogram_quantile(0.99, rate(http_request_duration_seconds_bucket{service="checkout"}[5m]))' \
    --server.url=http://prometheus:9090 --start='2h ago' --step=1m

The spike started at 14:32 UTC. Now checking logs around that time:

> logcli query '{app="checkout"} |= "error" | json' \
    --addr=http://loki:3100 --since=2h --limit=50

Found 47 error entries. Common pattern: "connection timeout: inventory-db:5432"

The logs show database connection timeouts starting at 14:31 UTC. Let me trace
a slow request:

> curl -s 'http://jaeger:16686/api/v3/traces?query.service_name=checkout&query.duration_min=3s&query.limit=5'

Found a trace showing the checkout → inventory-db span taking 4.1 seconds
(normal: 15ms).
```

RCA Bot correlates the findings:

```
RCA Bot: Root cause analysis:

Timeline:
  14:31 UTC - Database connection timeouts begin in checkout service logs
  14:32 UTC - p99 latency spikes from 200ms to 4.2s
  14:32 UTC - Traces show inventory-db spans as the bottleneck

Root Cause: The inventory database (inventory-db:5432) is experiencing
connection issues, causing checkout service requests to queue and timeout.

Recommended investigation:
  1. Check inventory-db pod status: kubectl describe pod -l app=inventory-db
  2. Check connection pool metrics: promtool query 'pg_active_connections{db="inventory"}'
  3. Check if there was a recent deployment to inventory-db
```

**Key points:**
- All three tools (promtool, logcli, jaeger) are LOW risk -- Standard mode auto-executes
- RCA Bot follows the structured metrics → logs → traces workflow
- The bot correlates findings across signals to identify root cause

## 3. Respond to a Production Incident

**Agent:** Incident Bot | **Safety Mode:** Standard | **Tools:** kubectl

A PagerDuty alert fires: the API gateway is returning 503 errors.

```
You: We're getting 503 errors from the API gateway. It's affecting customers.

Incident Bot: Starting incident response. Let me assess the situation.

> kubectl get pods -n api-gateway --sort-by='.status.containerStatuses[0].restartCount'

NAME                          READY   STATUS             RESTARTS   AGE
api-gateway-xyz789            0/1     CrashLoopBackOff   8          3m
api-gateway-abc123            1/1     Running            0          2d
api-gateway-def456            1/1     Running            0          2d

One pod is in CrashLoopBackOff. Let me check what happened:

> kubectl describe pod api-gateway-xyz789 -n api-gateway

Events show: OOMKilled at 14:45 UTC. The container exceeded its memory limit.

> kubectl logs api-gateway-xyz789 -n api-gateway --previous --tail=50

Last log line: "java.lang.OutOfMemoryError: Java heap space"

Assessment:
  Severity: SEV-2 (partial service degradation, 1 of 3 pods down)
  Impact: ~33% of traffic hitting the crashed pod, getting 503s
  Cause: OOM in one api-gateway pod

Recommended mitigation (choose one):
  1. Delete the crashing pod (Kubernetes will recreate it)
  2. Rollback to previous deployment if this is a recent deploy
  3. Increase memory limits if the workload legitimately needs more

Option 1 is fastest for immediate relief.
```

You choose option 1:

```
You: Delete the crashing pod

Incident Bot: I'll delete the pod so Kubernetes recreates it with a fresh
memory allocation.

> kubectl delete pod api-gateway-xyz789 -n api-gateway

⚠ This is a CRITICAL risk operation. Approve? [y/N]
```

You approve, and Incident Bot monitors recovery:

```
Incident Bot: Pod deleted. Watching for replacement:

> kubectl get pods -n api-gateway -w

api-gateway-new123   0/1   ContainerCreating   0   2s
api-gateway-new123   1/1   Running             0   15s

New pod is running. All 3 replicas are healthy.

> kubectl get endpoints api-gateway -n api-gateway

3/3 endpoints active. Traffic should normalize shortly.

Recommendation: Investigate why this pod hit OOM. Check if there was a traffic
spike or memory leak. Consider increasing memory limits if the workload has
grown. I can hand this off to RCA Bot for deeper investigation.
```

**Key points:**
- Incident Bot follows the structured triage workflow: assess → mitigate → verify
- Read-only commands (get, describe, logs) auto-execute in Standard mode
- The `delete pod` command is CRITICAL risk and requires explicit approval
- Incident Bot provides severity classification and recovery verification
- Offers handoff to RCA Bot for post-incident analysis

## 4. Analyze Cloud Costs

**Agent:** FinOps Bot | **Safety Mode:** Standard | **Tools:** aws

Your team wants to reduce the monthly AWS bill.

```
You: Show me our AWS costs for the last month, broken down by service

FinOps Bot: I'll pull the cost data. Let me check your current identity
first.

> aws sts get-caller-identity

Using account: 123456789012 (prod)

> aws ce get-cost-and-usage \
    --time-period Start=2026-01-01,End=2026-02-01 \
    --granularity MONTHLY \
    --metrics "UnblendedCost" \
    --group-by Type=DIMENSION,Key=SERVICE

January 2026 AWS Costs: $12,847.32

Top 5 services:
  1. Amazon EC2             $5,230.41  (40.7%)
  2. Amazon RDS             $3,102.89  (24.1%)
  3. Amazon S3              $1,847.22  (14.4%)
  4. AWS Lambda             $  892.10  ( 6.9%)
  5. Amazon CloudFront      $  641.33  ( 5.0%)

EC2 is the largest cost driver. Let me check for savings opportunities:

> aws ec2 describe-instances \
    --filters "Name=instance-state-name,Values=running" \
    --query 'Reservations[*].Instances[*].[InstanceId,InstanceType,LaunchTime]' \
    --output table

Found 23 running instances. Checking for underutilized ones:

> aws cloudwatch get-metric-statistics \
    --namespace AWS/EC2 --metric-name CPUUtilization \
    --period 86400 --statistics Average \
    --start-time 2026-01-01 --end-time 2026-02-01 \
    --dimensions Name=InstanceId,Value=i-0abc123

Savings recommendations:
  1. 4 instances averaging <10% CPU -- candidates for rightsizing or shutdown
  2. 6 instances eligible for Reserved Instance pricing (savings: ~30%)
  3. 2 m5.xlarge instances could downsize to m5.large (est. savings: $180/mo)

Estimated monthly savings: $1,200 - $1,800 if all recommendations are applied.
```

**Key points:**
- All AWS commands used are read-only (describe, list, get) -- auto-execute in Standard mode
- FinOps Bot structures the analysis: total costs → breakdown → drilling into top spender → recommendations
- No mutations needed for cost analysis

## 5. Set Up Terraform Infrastructure

**Agent:** Platform Bot | **Safety Mode:** Standard | **Tools:** terraform

You need to initialize and apply a new Terraform module for a VPC.

```
You: Initialize and plan the terraform module in infra/vpc

Platform Bot: I'll walk you through the safe Terraform workflow. Starting
with initialization.

> terraform -chdir=infra/vpc init

Initializing provider plugins...
- Finding hashicorp/aws versions matching "~> 5.0"...
- Installing hashicorp/aws v5.31.0...

Terraform has been successfully initialized.

Now let me validate the configuration:

> terraform -chdir=infra/vpc validate

Success! The configuration is valid.

Generating an execution plan:

> terraform -chdir=infra/vpc plan -out=tfplan

Plan: 12 to add, 0 to change, 0 to destroy.

Resources to create:
  + aws_vpc.main
  + aws_subnet.public[0-2]
  + aws_subnet.private[0-2]
  + aws_internet_gateway.main
  + aws_nat_gateway.main
  + aws_route_table.public
  + aws_route_table.private
  + aws_route_table_association.public[0-2]

The plan looks clean -- 12 new resources, no changes or deletions.
Would you like me to apply it?
```

You confirm:

```
You: Yes, apply the plan

Platform Bot: Applying the saved plan.

> terraform -chdir=infra/vpc apply tfplan

⚠ This is a HIGH risk mutation. Approve? [y/N]
```

You approve:

```
Platform Bot: Apply complete! Resources: 12 added, 0 changed, 0 destroyed.

Outputs:
  vpc_id     = "vpc-0abc123def456"
  public_subnets  = ["subnet-aaa", "subnet-bbb", "subnet-ccc"]
  private_subnets = ["subnet-ddd", "subnet-eee", "subnet-fff"]

The VPC is ready. The plan file (tfplan) was used for the apply, which means
exactly what was reviewed in the plan is what was applied -- no surprises.
```

**Key points:**
- `terraform init` and `validate` are MEDIUM risk -- auto-execute in Standard mode
- `terraform plan` is also MEDIUM risk (read-only analysis) -- auto-executes
- `terraform apply` is HIGH risk -- requires explicit approval
- Platform Bot uses `-out=tfplan` to save the plan and apply exactly what was reviewed
- This is the safe Terraform workflow: init → validate → plan → review → apply
