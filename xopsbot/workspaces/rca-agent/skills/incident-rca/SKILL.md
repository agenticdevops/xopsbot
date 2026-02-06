---
name: incident-rca
description: "Incident root cause analysis combining observability data with structured investigation methodology. Use when conducting post-incident RCA, reconstructing incident timelines from multiple data sources, tracking hypotheses during root cause investigation, identifying contributing factors beyond the proximate cause, writing blameless postmortem reports, or correlating deployment changes with incident onset using kubectl and promtool."
metadata:
  {
    "openclaw":
      {
        "emoji": "detective",
        "requires": { "bins": ["kubectl", "promtool", "logcli", "curl"] },
      },
  }
---

# Incident Root Cause Analysis

Structured RCA methodology combining process rigor with observability data for thorough post-incident investigation.

## RCA Workflow

Root cause analysis follows four phases: collect evidence, reconstruct the timeline, formulate and test hypotheses, and identify the root cause with contributing factors. Each phase builds on the previous.

### Phase 1: Data Collection

Gather all evidence sources before forming any conclusions. Premature hypotheses bias the investigation.

**Kubernetes event data:**

```bash
# Events in the incident timeframe (last 2 hours)
kubectl get events -n <namespace> --sort-by='.lastTimestamp' --field-selector reason!=Pulled

# Deployment history for the affected service
kubectl rollout history deployment/<name> -n <namespace>

# ConfigMap audit -- check for recent changes
kubectl get configmap -n <namespace> -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.metadata.resourceVersion}{"\n"}{end}'

# Node conditions (check for pressure, disk, memory issues)
kubectl get nodes -o custom-columns='NAME:.metadata.name,STATUS:.status.conditions[?(@.status=="True")].type'
```

**Use the observability-rca skill for metrics-to-logs-to-traces correlation during this phase.** That skill provides PromQL patterns, LogQL queries, and Jaeger API calls for technical investigation. This phase focuses on what data to collect and organize.

**Evidence collection checklist:**

- [ ] Metrics snapshots from the incident window (error rates, latency, resource usage)
- [ ] Log excerpts from affected services (errors, warnings, state changes)
- [ ] Trace IDs for failed or slow requests
- [ ] Deployment manifests and recent change diffs
- [ ] Kubernetes events and pod lifecycle data
- [ ] Alert firing history and notification timestamps
- [ ] On-call responder actions and communications

### Phase 2: Timeline Reconstruction

Build a precise chronological timeline from all collected evidence. The timeline is the backbone of the investigation.

**Timeline entry format:**

| Time (UTC) | Event | Source | Impact |
|------------|-------|--------|--------|
| 14:32:00 | Deployment v2.3.1 started | kubectl rollout history | None yet |
| 14:33:15 | First 5xx errors in payments | Prometheus metrics | User-facing errors begin |
| 14:33:45 | Alert: payments-error-rate fired | Alertmanager | On-call paged |
| 14:35:00 | Pod restarts detected | kubectl events | Service degradation |
| 14:38:00 | Rollback initiated | Incident responder | Mitigation started |
| 14:40:30 | Error rate returning to baseline | Prometheus metrics | Recovery underway |

**Commands to extract timestamps:**

```bash
# Events sorted by time (primary timeline source)
kubectl get events -n <namespace> --sort-by='.lastTimestamp' \
  -o custom-columns='TIME:.lastTimestamp,TYPE:.type,REASON:.reason,OBJECT:.involvedObject.name,MESSAGE:.message'

# Deployment rollout history
kubectl rollout history deployment/<name> -n <namespace>

# ReplicaSet creation times (proxy for deployment timing)
kubectl get rs -n <namespace> -l app=<label> \
  --sort-by='.metadata.creationTimestamp' \
  -o custom-columns='NAME:.metadata.name,CREATED:.metadata.creationTimestamp,REPLICAS:.status.replicas'
```

**Merging data from multiple sources:**

1. Collect timestamps from kubectl events, metrics queries, log entries, and alert history
2. Normalize all timestamps to UTC
3. Sort chronologically and annotate each entry with its source
4. Mark key transitions: onset, detection, response, mitigation, recovery

### Phase 3: Hypothesis Formulation

Generate hypotheses from the timeline, then systematically test each one. The goal is falsification -- try to disprove each hypothesis rather than confirm it.

**Hypothesis tracking table:**

| # | Hypothesis | Evidence For | Evidence Against | Status |
|---|------------|--------------|------------------|--------|
| 1 | Deployment v2.3.1 introduced regression | Errors started 90s after deploy | Similar errors seen before this deploy | Testing |
| 2 | Database connection pool exhaustion | Connection timeout logs present | Pool metrics show available connections | Rejected |
| 3 | Upstream dependency degradation | Dependency latency increased 10x | Dependency team reports no issues | Testing |

**Hypothesis generation methodology:**

1. Review the timeline and identify candidate causes (typically 3-5)
2. For each candidate, list what evidence you would expect to see if true
3. For each candidate, list what evidence would disprove it
4. Prioritize hypotheses by: likelihood (from timeline), testability (can you check now?), impact (would this explain the full scope?)

**Commands to validate or invalidate hypotheses:**

```bash
# Check deployment diffs (was the code change related?)
kubectl get deployment <name> -n <namespace> -o yaml > current.yaml
kubectl rollout history deployment/<name> -n <namespace> --revision=<N>

# Resource trends (was this a slow buildup?)
kubectl top pods -n <namespace> --sort-by=memory
kubectl top nodes

# Config changes (did configuration change?)
kubectl get configmap <name> -n <namespace> -o yaml
kubectl describe configmap <name> -n <namespace>

# Dependency health (is an upstream service degraded?)
kubectl get endpoints <service> -n <namespace>
kubectl describe service <service> -n <namespace>

# Pod restart history (instability pattern)
kubectl get pods -n <namespace> -o custom-columns='NAME:.metadata.name,RESTARTS:.status.containerStatuses[0].restartCount,LAST_STATE:.status.containerStatuses[0].lastState.terminated.reason'
```

**Falsification approach:**

For each hypothesis, actively seek evidence that contradicts it. A hypothesis that survives multiple falsification attempts is more likely to be correct than one that simply has supporting evidence. Document both confirming AND contradicting evidence in the tracking table.

### Phase 4: Root Cause Identification

Distinguish between three levels of causation:

| Level | Definition | Example |
|-------|-----------|---------|
| **Proximate cause** | What triggered the incident | New deployment with memory leak |
| **Root cause** | Why it was possible | No memory limit set on the container |
| **Contributing factors** | What made it worse | No canary deployment, no memory alerts |

**Five Whys technique (infrastructure example):**

1. **Why did the service go down?** -- Pods were OOM-killed
2. **Why were pods OOM-killed?** -- Memory usage exceeded node capacity
3. **Why did memory usage spike?** -- New deployment had a memory leak in the connection pool
4. **Why was the leak deployed?** -- Load testing did not cover long-running connection scenarios
5. **Why was there no safety net?** -- No memory limits were set, and no memory usage alerts existed

Root cause: Missing container memory limits and absence of memory usage alerting allowed a leak to reach production without any safety net.

**Causal chain documentation format:**

```markdown
## Causal Chain

### Proximate Cause
[What directly triggered the incident]

### Root Cause
[The underlying systemic issue that made the incident possible]

### Contributing Factors
1. [Factor 1 -- how it contributed]
2. [Factor 2 -- how it contributed]
3. [Factor 3 -- how it contributed]

### Causal Sequence
[Trigger] -> [Proximate cause] -> [Escalation factor] -> [User impact]
```

## Contributing Factor Analysis

Contributing factors are conditions that did not directly cause the incident but influenced its severity, detection time, or blast radius.

### Change Correlation

Correlate recent changes with incident onset to identify deployment-related causes.

```bash
# Recent deployments in the namespace
kubectl get events -n <namespace> --field-selector reason=ScalingReplicaSet \
  --sort-by='.lastTimestamp'

# Deployment image history
kubectl get rs -n <namespace> -l app=<label> \
  -o custom-columns='NAME:.metadata.name,IMAGE:.spec.template.spec.containers[0].image,CREATED:.metadata.creationTimestamp' \
  --sort-by='.metadata.creationTimestamp'

# Compare current vs previous deployment spec
kubectl rollout history deployment/<name> -n <namespace> --revision=<prev>
```

**Time-window analysis:** Any change within the 30 minutes before incident onset is a candidate cause. Changes within 24 hours are potential slow-burn contributors.

### Environmental Factors

Check for environmental conditions that may have contributed.

```bash
# Node resource pressure
kubectl top nodes
kubectl describe nodes | rg -A2 "Conditions:"

# Pod scheduling constraints
kubectl get pods -n <namespace> -o wide --field-selector status.phase!=Running

# PVC usage (storage pressure)
kubectl get pvc -n <namespace>
kubectl describe pvc -n <namespace> | rg -A1 "Capacity"

# Resource quotas and limits
kubectl describe resourcequota -n <namespace>
kubectl get limitrange -n <namespace> -o yaml
```

What environmental pressures might have contributed?

- Node resource exhaustion (CPU, memory, disk)
- Cluster capacity at or near limits
- Network partition or DNS issues
- Storage IOPS throttling
- Cloud provider service degradation

### Process Factors

These are organizational and process gaps that contributed to the incident. They inform action items rather than requiring commands.

**Process factor checklist:**

- [ ] **Alerting gaps:** Were there alerts that should have fired but did not?
- [ ] **Alert fatigue:** Were relevant alerts firing but ignored due to noise?
- [ ] **Testing gaps:** Was the failure scenario covered by tests? Load tests? Integration tests?
- [ ] **Deployment process:** Was there a canary phase? Automated rollback? Health checks?
- [ ] **Runbook gaps:** Did a runbook exist for this failure mode? Was it accurate?
- [ ] **On-call response:** Was the right person paged? Was the response time acceptable?
- [ ] **Documentation:** Were the affected systems documented? Were dependencies mapped?
- [ ] **Change management:** Was the change reviewed? Was rollback planned?

## Blameless Postmortem Template

The postmortem documents findings and drives systemic improvements. Use this template after completing the RCA investigation.

> **NOTE:** Blameless means focusing on systemic improvements. Replace "Person X did Y wrong" with "The system allowed Y to happen because Z was missing." Humans make mistakes; systems should catch them.

```markdown
# Postmortem: [Incident Title]

**Date:** [YYYY-MM-DD] | **Severity:** [SEV-1/2/3/4] | **Duration:** [total]
**Author:** [Name] | **Status:** [Draft / Review / Final]

## Summary
[2-3 sentences: what happened, impact, resolution]

## Impact
- **User-facing:** [What users experienced]
- **Data:** [Any data loss or corruption]
- **SLA:** [Any violations]

## Timeline
| Time (UTC) | Event |
|------------|-------|
| HH:MM | [Event description] |

## Root Cause
[Description referencing the causal chain analysis]

## Contributing Factors
1. [Factor 1]
2. [Factor 2]

## Detection
- **Detected by:** [Alert / User report / Monitoring]
- **Time to detect:** [Minutes from onset]

## Response
- **Time to respond:** [Minutes from detection to first action]
- **What worked:** [Effective actions]
- **What did not work:** [Dead ends]

## Action Items
| Priority | Action | Owner | Due Date | Status |
|----------|--------|-------|----------|--------|
| P0 | [Immediate fix] | [Name] | [Date] | [Open/Done] |
| P1 | [Prevent recurrence] | [Name] | [Date] | [Open/Done] |
| P2 | [Improve detection] | [Name] | [Date] | [Open/Done] |

## Lessons Learned
- **What went well:** [Positive aspects]
- **What could improve:** [Areas for improvement]
- **Where we got lucky:** [Things that could have been worse]
```

## Common RCA Patterns

These patterns cover the most frequent root causes encountered in production Kubernetes environments. Each pattern includes the investigation steps to confirm or reject it.

### Pattern: Recent Deployment Caused Regression

**Indicators:** Errors began shortly after a deployment. Error type is new or matches changed code path.

**Investigation steps:**

```bash
# Step 1: Confirm deployment timing aligns with incident onset
kubectl get events -n <namespace> --field-selector reason=ScalingReplicaSet \
  --sort-by='.lastTimestamp'

# Step 2: Get the deployment diff
kubectl rollout history deployment/<name> -n <namespace> --revision=<current>
kubectl rollout history deployment/<name> -n <namespace> --revision=<previous>

# Step 3: Check if rollback resolves the issue
# (check rollback history if already performed)
kubectl rollout history deployment/<name> -n <namespace>

# Step 4: Verify canary metrics (if canary was used)
# Use observability-rca skill for metrics comparison between canary and stable
```

**Confirmation criteria:** Errors start within minutes of deployment, are absent in previous version, and disappear after rollback.

### Pattern: Resource Exhaustion (Slow Burn)

**Indicators:** Gradual degradation over hours or days. No recent changes correlated. Resource metrics show upward trend.

**Investigation steps:**

```bash
# Step 1: Current resource state
kubectl top pods -n <namespace> --sort-by=memory
kubectl top nodes

# Step 2: Check for OOM kills
kubectl get events -n <namespace> --field-selector reason=OOMKilling

# Step 3: Check resource limits vs actual usage
kubectl get pods -n <namespace> -o custom-columns='NAME:.metadata.name,MEM_REQ:.spec.containers[0].resources.requests.memory,MEM_LIM:.spec.containers[0].resources.limits.memory'

# Step 4: HPA history (was it scaling up to compensate?)
kubectl describe hpa -n <namespace>
kubectl get events -n <namespace> --field-selector reason=SuccessfulRescale
```

**Confirmation criteria:** Resource usage trending upward over extended period, crossing limits, with no corresponding increase in traffic or workload.

### Pattern: Dependency Failure (External)

**Indicators:** Multiple services affected simultaneously. Errors reference upstream service or external endpoint. Internal metrics show healthy compute but failing requests.

**Investigation steps:**

```bash
# Step 1: Check dependency endpoint health
kubectl get endpoints <dependency-service> -n <namespace>
curl -s -o /dev/null -w "%{http_code}" http://<dependency-endpoint>/health

# Step 2: Check for network connectivity
kubectl exec -it <pod> -n <namespace> -- nslookup <dependency-host>
kubectl exec -it <pod> -n <namespace> -- wget -qO- --timeout=5 http://<dependency>/health

# Step 3: Review circuit breaker state (if applicable)
kubectl logs -l app=<service> -n <namespace> --since=30m | rg -i "circuit\|breaker\|fallback"

# Step 4: Check upstream changelogs and status pages
# Manual: Review dependency team's status page or changelog
```

**Confirmation criteria:** Dependency health checks fail during the incident window, internal services are healthy but unable to complete requests that depend on the external service.

### Pattern: Configuration Drift

**Indicators:** Running state does not match expected state. Issue appears without any deployment. Works in one environment but not another.

**Investigation steps:**

```bash
# Step 1: Compare running vs desired state
kubectl get deployment <name> -n <namespace> -o yaml > running-state.yaml
# Compare against git source of truth

# Step 2: Check ConfigMap and Secret versions
kubectl get configmap -n <namespace> -o custom-columns='NAME:.metadata.name,VERSION:.metadata.resourceVersion'
kubectl get secrets -n <namespace> -o custom-columns='NAME:.metadata.name,VERSION:.metadata.resourceVersion'

# Step 3: Check for manual edits (annotations, patches)
kubectl get deployment <name> -n <namespace> \
  -o jsonpath='{.metadata.annotations.kubectl\.kubernetes\.io/last-applied-configuration}' | jq '.'

# Step 4: Check for mutating webhooks that may alter resources
kubectl get mutatingwebhookconfigurations -o custom-columns='NAME:.metadata.name,RULES:.webhooks[*].rules[*].resources'
```

**Confirmation criteria:** Difference found between running state and source-of-truth (git), with the drift explaining the observed behavior.

## Safety Mode Behavior

This skill respects the configured xops.bot safety mode:

| Operation Type | Safe Mode | Standard Mode | Full Mode |
|---------------|-----------|---------------|-----------|
| Read-only (get, describe, logs, events, top) | Allowed | Auto-execute | Auto-execute |
| Diagnostic (exec, port-forward, debug) | Blocked | Requires approval | Auto-execute |
| Mutations (apply, patch for postmortem annotations) | Blocked | Requires approval + confirmation | Requires awareness |

All core investigation commands in this workflow are read-only. Diagnostic commands (exec into pods, port-forward) may be needed to validate hypotheses. Mutations are only used for attaching postmortem annotations to resources, not for remediation -- remediation belongs in the **incident-response** skill.

## Related Skills

- **observability-rca**: For metrics-to-logs-to-traces technical correlation (PromQL, LogQL, Jaeger API)
- **incident-analysis**: For active incident investigation and evidence gathering before deep RCA
- **incident-response**: For mitigation actions taken during the incident (rollback, scaling, traffic shifting)
- **k8s-debug**: For deep Kubernetes debugging during investigation (pod states, networking, storage)
