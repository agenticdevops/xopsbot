---
name: incident-analysis
description: "Systematic incident investigation and evidence gathering for infrastructure incidents. Use when investigating a production incident, assessing impact and blast radius, checking what changed recently in the cluster, gathering evidence from metrics and logs during an incident, performing initial triage to classify severity, or building an incident timeline with kubectl and promtool."
metadata:
  {
    "openclaw":
      {
        "emoji": "mag_right",
        "requires": { "bins": ["kubectl"] },
      },
  }
---

# Incident Analysis

Systematic investigation and evidence gathering for infrastructure incidents.

## Initial Assessment (First 2 Minutes)

Rapid situational awareness before any mitigation decisions. The goal is to understand scope, not to fix anything yet.

### Quick State Check

```bash
# What pods are unhealthy right now?
kubectl get pods -A --field-selector=status.phase!=Running,status.phase!=Succeeded

# Any pods in error states?
kubectl get pods -A | grep -E 'CrashLoopBackOff|Error|OOMKilled|ImagePullBackOff|Pending'

# Recent events cluster-wide (last 15 minutes of activity)
kubectl get events -A --sort-by='.lastTimestamp' | tail -30

# Node health
kubectl get nodes -o wide
kubectl top nodes
```

### Endpoint Health

```bash
# Services with no healthy backends (critical signal)
kubectl get endpoints -A | grep "<none>"

# Ingress status
kubectl get ingress -A

# Check specific service endpoints
kubectl get endpoints <service-name> -n <namespace> -o yaml
```

### Scope Decision Tree

```
Is this a NEW incident or an EXPANDING existing one?

1. Check if there's an active incident thread
   YES -> Join existing incident, update scope
   NO  -> Declare new incident, continue assessment

2. What is the blast radius?
   Single pod/container    -> Likely self-healing, monitor
   Single deployment/service -> Service-level incident
   Multiple services       -> Potential cascading failure
   Entire namespace/cluster -> Infrastructure-level incident

3. Is it getting worse?
   Check pod restart counts increasing:
```

```bash
# Compare restart counts (run twice, 60 seconds apart)
kubectl get pods -n <namespace> -o custom-columns=NAME:.metadata.name,RESTARTS:.status.containerStatuses[*].restartCount
```

## Evidence Collection

### What Changed Recently?

Focus on the last 30 minutes. Most incidents correlate with a recent change.

```bash
# Recent deployments (rollout history across namespace)
for deploy in $(kubectl get deployments -n <namespace> -o name); do
  echo "=== $deploy ===" && kubectl rollout history $deploy -n <namespace> | tail -5
done

# Recent events by type (Warning events are most relevant)
kubectl get events -n <namespace> --field-selector type=Warning --sort-by='.lastTimestamp'

# ConfigMap changes (check last-applied annotation timestamps)
kubectl get configmaps -n <namespace> -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.metadata.annotations.kubectl\.kubernetes\.io/last-applied-configuration}{"\n"}{end}'

# Recent scaling events
kubectl get events -n <namespace> --field-selector reason=ScalingReplicaSet --sort-by='.lastTimestamp'

# HPA activity
kubectl get hpa -n <namespace>
kubectl describe hpa -n <namespace>

# Check if any nodes were recently added or cordoned
kubectl get nodes --sort-by='.metadata.creationTimestamp'
kubectl get nodes -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.unschedulable}{"\n"}{end}'
```

### What Is the Current Impact?

Quantify the impact with concrete numbers.

```bash
# Pod restart counts (high restart count = ongoing instability)
kubectl get pods -n <namespace> -o custom-columns=NAME:.metadata.name,RESTARTS:.status.containerStatuses[*].restartCount,STATUS:.status.phase --sort-by='.status.containerStatuses[*].restartCount'

# CrashLoopBackOff count (how many pods are crash-looping?)
kubectl get pods -A | grep CrashLoopBackOff | wc -l

# Container exit codes (non-zero = application error)
kubectl get pods -n <namespace> -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.containerStatuses[*].lastState.terminated.exitCode}{"\t"}{.status.containerStatuses[*].lastState.terminated.reason}{"\n"}{end}'

# Resource usage vs requests/limits
kubectl top pods -n <namespace> --sort-by=memory
kubectl top pods -n <namespace> --sort-by=cpu

# Check if pods are being evicted
kubectl get events -n <namespace> --field-selector reason=Evicted
```

For deeper metric analysis (error rates, latency percentiles, resource trends), use the **observability-rca** skill which provides PromQL queries and the metrics-to-logs-to-traces investigation workflow.

### Service Dependency Mapping

Identify which services are affected upstream and downstream.

```bash
# All services and their selectors
kubectl get services -n <namespace> -o custom-columns=NAME:.metadata.name,SELECTOR:.spec.selector

# Endpoints for affected service (which pods back this service?)
kubectl get endpoints <service-name> -n <namespace>

# What depends on this service? Check other services' environment variables
kubectl get pods -n <namespace> -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[*].env[*].value}{"\n"}{end}' | grep <service-name>

# Ingress rules pointing to affected service
kubectl get ingress -n <namespace> -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.rules[*].http.paths[*].backend.service.name}{"\n"}{end}'

# Network policies affecting the service
kubectl get networkpolicies -n <namespace> -o wide

# Check if service mesh sidecar is healthy (if using Istio/Linkerd)
kubectl get pods -n <namespace> -l app=<service> -o jsonpath='{.items[*].status.containerStatuses[*].name}' | tr ' ' '\n'
```

## Severity Classification Checklist

Use this checklist to determine incident severity. See workspace severity definitions for specific thresholds and response time expectations.

```
User Impact Assessment:
[ ] All users affected                    -> SEV-1 indicator
[ ] Significant subset of users affected  -> SEV-2 indicator
[ ] Small subset of users affected        -> SEV-3 indicator
[ ] No direct user impact                 -> SEV-4 indicator

Data Integrity Assessment:
[ ] Data loss confirmed or likely         -> Escalate to SEV-1
[ ] Data corruption possible              -> Escalate to SEV-2
[ ] No data integrity risk                -> No escalation

Blast Radius Assessment:
[ ] Multiple services/namespaces affected -> Escalate one level
[ ] Spreading to new components           -> Escalate one level
[ ] Contained to single component         -> No escalation

Business Context:
[ ] Revenue-generating service            -> Escalate one level
[ ] Customer-facing service               -> Escalate one level
[ ] Internal/tooling service              -> No escalation
```

```bash
# Gather data for severity classification
# How many pods are affected?
kubectl get pods -A --field-selector=status.phase!=Running,status.phase!=Succeeded | wc -l

# How many namespaces have issues?
kubectl get pods -A --field-selector=status.phase!=Running,status.phase!=Succeeded -o jsonpath='{range .items[*]}{.metadata.namespace}{"\n"}{end}' | sort -u

# Are there any PodDisruptionBudget violations?
kubectl get pdb -A
```

## Investigation Patterns

### Error Rate Spike Investigation

When metrics show a sudden increase in errors.

```bash
# Step 1: Identify which pods/deployments have errors
kubectl get pods -n <namespace> | grep -E 'Error|CrashLoopBackOff'
kubectl describe pod <erroring-pod> -n <namespace>

# Step 2: Check events for the affected deployment
kubectl get events -n <namespace> --field-selector involvedObject.name=<deployment> --sort-by='.lastTimestamp'

# Step 3: Check if a recent deployment caused the errors
kubectl rollout history deployment/<name> -n <namespace>
kubectl rollout history deployment/<name> -n <namespace> --revision=<latest>

# Step 4: Check application logs for error patterns
kubectl logs deployment/<name> -n <namespace> --tail=100 --timestamps
kubectl logs deployment/<name> -n <namespace> --previous --tail=50

# Step 5: Check resource constraints (OOMKilled?)
kubectl get pods -n <namespace> -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.containerStatuses[*].lastState.terminated.reason}{"\n"}{end}'
```

Use **observability-rca** skill for PromQL error rate queries and log correlation.

### Latency Degradation Investigation

When response times are elevated but the service is not down.

```bash
# Step 1: Check resource pressure on pods
kubectl top pods -n <namespace> --sort-by=cpu
kubectl top pods -n <namespace> --sort-by=memory

# Step 2: Check HPA status (is it scaling or maxed out?)
kubectl get hpa -n <namespace>
kubectl describe hpa <name> -n <namespace>

# Step 3: Check pod scheduling (are pods pending?)
kubectl get pods -n <namespace> --field-selector=status.phase=Pending
kubectl describe pod <pending-pod> -n <namespace> | grep -A 10 Events

# Step 4: Check node pressure
kubectl describe nodes | grep -A 5 Conditions
kubectl top nodes

# Step 5: Check for CPU throttling
kubectl get pods -n <namespace> -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[*].resources.limits.cpu}{"\t"}{.spec.containers[*].resources.requests.cpu}{"\n"}{end}'
```

### Service Unavailability Investigation

When a service is completely unreachable.

```bash
# Step 1: Check if pods exist and are running
kubectl get pods -n <namespace> -l app=<service>
kubectl get deployment <service> -n <namespace>

# Step 2: Check endpoint registration
kubectl get endpoints <service> -n <namespace>
# Empty endpoints = no healthy pods backing the service

# Step 3: Check readiness probe status
kubectl describe pods -n <namespace> -l app=<service> | grep -A 5 "Readiness"

# Step 4: Check network policies
kubectl get networkpolicies -n <namespace>
kubectl describe networkpolicy <policy-name> -n <namespace>

# Step 5: DNS resolution test
kubectl run dns-test --rm -i --restart=Never --image=busybox -- nslookup <service>.<namespace>.svc.cluster.local

# Step 6: Service port verification
kubectl get service <service> -n <namespace> -o jsonpath='{.spec.ports[*]}'
kubectl get pods -n <namespace> -l app=<service> -o jsonpath='{.items[*].spec.containers[*].ports[*].containerPort}'
```

### Cascading Failure Investigation

When multiple services are failing and you need to find the origin.

```bash
# Step 1: Map all unhealthy components
kubectl get pods -A | grep -v Running | grep -v Completed

# Step 2: Check service dependencies (which service failed first?)
kubectl get events -A --sort-by='.lastTimestamp' --field-selector type=Warning | head -30

# Step 3: Look for the earliest failure (often the root cause)
kubectl get events -A --sort-by='.metadata.creationTimestamp' --field-selector type=Warning | head -10

# Step 4: Check upstream service health
kubectl get endpoints -A | grep "<none>"

# Step 5: Identify the propagation path
# For each failing service, check what it depends on:
kubectl get pods -n <namespace> -l app=<service> -o jsonpath='{.items[0].spec.containers[0].env[*]}' | jq '.'

# Step 6: Find isolation point (where can you stop the cascade?)
# Candidate: the first healthy service in the dependency chain
kubectl get pods -A -l app=<upstream-service> -o wide
```

## Building the Timeline

Construct a timeline from multiple data sources to understand the sequence of events.

### Timeline Entry Format

```
[HH:MM:SS UTC] [SOURCE] [EVENT]
  Evidence: [command output or log line]
  Impact: [what changed as a result]
```

### Extracting Timestamps

```bash
# Deployment timestamps (when was the last rollout?)
kubectl get deployment <name> -n <namespace> -o jsonpath='{.metadata.annotations.deployment\.kubernetes\.io/revision}{"\t"}{.metadata.creationTimestamp}'

# Event timestamps (cluster activity log)
kubectl get events -n <namespace> --sort-by='.lastTimestamp' -o custom-columns=TIME:.lastTimestamp,TYPE:.type,REASON:.reason,OBJECT:.involvedObject.name,MESSAGE:.message

# Pod creation timestamps
kubectl get pods -n <namespace> --sort-by='.metadata.creationTimestamp' -o custom-columns=NAME:.metadata.name,CREATED:.metadata.creationTimestamp,STATUS:.status.phase

# Container start/termination timestamps
kubectl get pods -n <namespace> -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}started:{.status.containerStatuses[*].state.running.startedAt}{"\t"}terminated:{.status.containerStatuses[*].lastState.terminated.finishedAt}{"\n"}{end}'

# Node condition transition timestamps
kubectl get nodes -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{range .status.conditions[*]}{.type}={.status} at {.lastTransitionTime}{"\t"}{end}{"\n"}{end}'
```

### Example Timeline

```
[10:42:15 UTC] [kubectl events]     New deployment revision created for payments-api
  Evidence: kubectl get events -n prod --field-selector involvedObject.name=payments-api
  Impact: Rolling update started

[10:42:45 UTC] [kubectl pods]       New pods entering CrashLoopBackOff
  Evidence: kubectl get pods -n prod -l app=payments-api
  Impact: Service degradation begins

[10:43:00 UTC] [kubectl endpoints]  payments-api endpoints reduced from 5 to 2
  Evidence: kubectl get endpoints payments-api -n prod
  Impact: Upstream services experience increased latency

[10:44:30 UTC] [kubectl events]     orders-api pods reporting connection timeouts
  Evidence: kubectl logs deployment/orders-api -n prod --since=5m | grep timeout
  Impact: Cascading failure begins
```

## Safety Mode Behavior

This skill respects the configured xops.bot safety mode:

| Operation Type | Safe Mode | Standard Mode | Full Mode |
|---------------|-----------|---------------|-----------|
| Read-only (get, describe, logs, events, top) | Allowed | Auto-execute | Auto-execute |
| Diagnostic (exec, port-forward, debug) | Blocked | Requires approval | Executes with awareness |
| Mutations (rollback, scale, cordon, drain) | Blocked | Requires approval + confirmation | Requires awareness |

All investigation commands in this skill are read-only. If investigation reveals a need for mitigation actions (rollback, scale, isolate), hand off to the **incident-response** skill.

## Related Skills

- **observability-rca**: For metrics-to-logs-to-traces correlation during investigation
- **k8s-debug**: For deep Kubernetes troubleshooting (pod states, container debugging, resource issues)
- **incident-response**: For active mitigation after analysis identifies the problem
- **incident-rca**: For structured post-incident root cause analysis and postmortem
