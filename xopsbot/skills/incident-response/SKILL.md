---
name: incident-response
description: "Incident response and mitigation workflows for active production incidents. Use when a production incident is declared, mitigating an active outage, rolling back a failed deployment during an incident, isolating affected components to reduce blast radius, scaling services to handle load during degradation, or coordinating structured incident response with kubectl."
metadata:
  {
    "openclaw":
      {
        "emoji": "rotating_light",
        "requires": { "bins": ["kubectl"] },
      },
  }
---

# Incident Response

Structured mitigation workflows for active production incidents.

## Stabilization Playbook

### Immediate Actions (First 5 Minutes)

The first 5 minutes determine whether the incident stabilizes or escalates. Choose ONE primary action based on the situation.

**Decision framework -- pick one:**

```
What type of failure are you seeing?

1. Recent deployment caused the issue
   -> ROLLBACK (fastest path to known-good state)

2. Service is overwhelmed by load
   -> SCALE (add capacity to absorb traffic)

3. One component is poisoning others
   -> ISOLATE (contain the blast radius)

4. Unknown cause, service degraded
   -> ROLLBACK if recent deploy exists, otherwise SCALE
```

**Rapid state assessment (run first):**

```bash
# What's broken right now?
kubectl get pods -n <namespace> | grep -v Running

# Was there a recent deployment?
kubectl rollout history deployment/<name> -n <namespace> | tail -3

# Is it load-related?
kubectl top pods -n <namespace> --sort-by=cpu
kubectl get hpa -n <namespace>
```

### Rollback Workflows

#### Kubernetes Deployment Rollback

```bash
# Step 1: Verify there is a previous good revision
kubectl rollout history deployment/<name> -n <namespace>

# Step 2: Check what changed in the current revision
kubectl rollout history deployment/<name> -n <namespace> --revision=<current>

# Step 3: Rollback to previous version
kubectl rollout undo deployment/<name> -n <namespace>

# Step 4: Watch rollback progress
kubectl rollout status deployment/<name> -n <namespace> --timeout=3m

# Step 5: Verify pods are healthy after rollback
kubectl get pods -n <namespace> -l app=<name>

# Step 6: Verify endpoints are registered
kubectl get endpoints <name> -n <namespace>
```

**Rollback to a specific revision (when previous is also bad):**

```bash
# List all revisions with details
kubectl rollout history deployment/<name> -n <namespace>

# Rollback to known-good revision
kubectl rollout undo deployment/<name> -n <namespace> --to-revision=<N>

# Verify
kubectl rollout status deployment/<name> -n <namespace> --timeout=3m
```

#### Helm Release Rollback

```bash
# Check release history
helm history <release> -n <namespace>

# Rollback (previous or specific revision)
helm rollback <release> -n <namespace>
helm rollback <release> <revision> -n <namespace>

# Verify
helm status <release> -n <namespace>
kubectl get pods -n <namespace> -l app.kubernetes.io/instance=<release>
```

#### Pre-Rollback Safety Checks

```
Pre-rollback checklist:
[ ] Previous version exists and is pullable
[ ] No irreversible database migrations in current version
[ ] No stateful changes that would break on older code
[ ] Rollback will not cause data format incompatibility
```

```bash
# Verify previous image is pullable
kubectl rollout history deployment/<name> -n <namespace> --revision=<previous> -o jsonpath='{.spec.template.spec.containers[0].image}'

# Check for stateful dependencies
kubectl get pvc -n <namespace> -l app=<name>
```

### Isolation Patterns

When a component is causing harm to other services, isolate it.

#### Remove Service from Load Balancer

```bash
# Step 1: Check current labels on affected pods
kubectl get pods -n <namespace> -l app=<name> --show-labels

# Step 2: Remove the label that the service selector uses
# This removes pods from the service without deleting them
kubectl label pods -n <namespace> -l app=<name>,version=bad app-

# Step 3: Verify pods are removed from endpoints
kubectl get endpoints <service-name> -n <namespace>

# Restore later by re-adding the label:
kubectl label pods -n <namespace> -l version=bad app=<name>
```

#### Network Policy Isolation

```bash
# Create a deny-all ingress policy for the affected namespace
cat <<'POLICY' | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: incident-isolate
  namespace: <namespace>
spec:
  podSelector:
    matchLabels:
      app: <affected-service>
  policyTypes:
  - Ingress
  ingress: []  # Empty = deny all ingress
POLICY

# Verify isolation
kubectl describe networkpolicy incident-isolate -n <namespace>

# Remove isolation after incident:
kubectl delete networkpolicy incident-isolate -n <namespace>
```

#### Cordon Affected Nodes

```bash
# Step 1: Identify the node with problematic pods
kubectl get pods -n <namespace> -l app=<name> -o wide

# Step 2: Cordon the node (prevent new scheduling)
kubectl cordon <node-name>

# Step 3: Verify node is unschedulable
kubectl get nodes | grep <node-name>

# Uncordon after incident:
kubectl uncordon <node-name>
```

### Scaling for Resilience

Add capacity to absorb traffic while investigating root cause.

```bash
# Scale up healthy deployment replicas
kubectl scale deployment/<name> -n <namespace> --replicas=<desired>

# Verify new pods are running
kubectl get pods -n <namespace> -l app=<name> -w

# Check resource availability on nodes before scaling
kubectl top nodes
kubectl describe nodes | grep -A 5 "Allocated resources"
```

#### HPA Emergency Overrides

```bash
# Override min/max replicas for emergency capacity
kubectl patch hpa <name> -n <namespace> -p '{"spec":{"minReplicas":<new-min>,"maxReplicas":<new-max>}}'
kubectl describe hpa <name> -n <namespace>

# Restore original settings after incident:
kubectl patch hpa <name> -n <namespace> -p '{"spec":{"minReplicas":<original-min>,"maxReplicas":<original-max>}}'
```

#### Vertical Scaling (OOMKilled Pods)

```bash
# If pods are OOMKilled, increase memory limit (triggers rolling restart)
kubectl patch deployment <name> -n <namespace> -p '{"spec":{"template":{"spec":{"containers":[{"name":"<container>","resources":{"limits":{"memory":"<new-limit>"}}}]}}}}'
kubectl rollout status deployment/<name> -n <namespace>
```

## Mitigation Decision Trees

### Should I Rollback?

```
Recent deployment (last 2 hours)?  NO -> Try SCALE or ISOLATE
Previous version known-good?       NO -> Check older revisions
Database migrations in current?    YES, forward-only -> DO NOT rollback
Stateful changes (data formats)?   YES, uncertain -> DO NOT rollback
All clear?                         -> PROCEED WITH ROLLBACK
```

```bash
kubectl rollout undo deployment/<name> -n <namespace>
kubectl rollout status deployment/<name> -n <namespace> --timeout=3m
kubectl get endpoints <name> -n <namespace>
```

### Should I Scale?

```
Load-related? (kubectl top pods)   NO -> Try ROLLBACK or ISOLATE
Current pods healthy?              NO -> Fix unhealthy first
Node capacity available?           NO -> Consider vertical scaling
All clear?                         -> PROCEED WITH SCALE
```

```bash
kubectl scale deployment/<name> -n <namespace> --replicas=<target>
kubectl get pods -n <namespace> -l app=<name> -w
kubectl top pods -n <namespace> -l app=<name>
```

### Should I Isolate?

```
Spreading to other services?       NO -> Try ROLLBACK or SCALE
Affecting data integrity?          YES -> ISOLATE IMMEDIATELY
Can service go offline safely?     NO -> Partial isolation (remove bad pods only)
All clear?                         -> PROCEED WITH FULL ISOLATION
```

```bash
kubectl label pods -n <namespace> -l app=<name>,version=<bad> app-
kubectl get endpoints <service-name> -n <namespace>
```

## Traffic Management

### Route Away from Affected Components

```bash
# Option 1: Manipulate service selector to exclude bad pods
kubectl patch service <name> -n <namespace> -p '{"spec":{"selector":{"version":"stable"}}}'

# Option 2: Scale down affected deployment, scale up healthy alternative
kubectl scale deployment/<name>-broken -n <namespace> --replicas=0
kubectl scale deployment/<name>-stable -n <namespace> --replicas=<desired>

# Option 3: Update ingress to point to healthy backend
kubectl patch ingress <name> -n <namespace> --type='json' \
  -p='[{"op":"replace","path":"/spec/rules/0/http/paths/0/backend/service/name","value":"<healthy-service>"}]'

# Verify traffic routing
kubectl get endpoints <name> -n <namespace>
kubectl get ingress <name> -n <namespace> -o jsonpath='{.spec.rules[*].http.paths[*].backend}'
```

### Canary Rollback

If using canary deployments and the canary is the problem.

```bash
# Step 1: Check canary vs stable traffic split
kubectl get pods -n <namespace> -l app=<name> -L version

# Step 2: Scale canary to zero
kubectl scale deployment/<name>-canary -n <namespace> --replicas=0

# Step 3: Ensure stable has enough capacity
kubectl scale deployment/<name>-stable -n <namespace> --replicas=<full-capacity>

# Step 4: Verify all traffic goes to stable
kubectl get endpoints <name> -n <namespace>
```

## Monitoring Recovery

### Verification After Mitigation

After any mitigation action, verify that the service is recovering.

```bash
# Check 1: Pod health (all pods running and ready?)
kubectl get pods -n <namespace> -l app=<name>
kubectl get deployment <name> -n <namespace>

# Check 2: Endpoints registered (service has healthy backends?)
kubectl get endpoints <name> -n <namespace>

# Check 3: No new error events
kubectl get events -n <namespace> --field-selector involvedObject.name=<name>,type=Warning --sort-by='.lastTimestamp' | tail -5

# Check 4: Resource usage normalized
kubectl top pods -n <namespace> -l app=<name>

# Check 5: No pod restarts increasing
kubectl get pods -n <namespace> -l app=<name> -o custom-columns=NAME:.metadata.name,RESTARTS:.status.containerStatuses[*].restartCount

# Run checks again after 5 minutes to confirm stability
```

**Recovery confirmed when:** Pod count matches desired replicas, all pods Running with Ready condition, endpoints populated, no new Warning events in last 5 minutes, restart count stable, and resource usage within normal range.

**Still degraded if:** Pods cycling (restarts increasing), endpoints flapping, new error events appearing, or resource usage still elevated.

### Handoff to RCA

When the incident is stabilized, create a structured handoff for root cause analysis.

**Handoff format:**

```
INCIDENT HANDOFF TO RCA
========================

Incident ID: [identifier]
Duration: [start time] to [stabilization time]
Severity: [SEV-X]

Timeline Summary:
- [HH:MM] [event 1]
- [HH:MM] [event 2]
- [HH:MM] [mitigation action taken]
- [HH:MM] [service recovered]

Actions Taken:
- [action 1]: [result]
- [action 2]: [result]

Current State:
- Service: [running/degraded/partial]
- Mitigation: [rollback/scale/isolate] applied
- Temporary measures: [list any workarounds in place]

Hypotheses:
- [hypothesis 1]: [evidence for/against]
- [hypothesis 2]: [evidence for/against]

Evidence Collected:
- [logs, metrics, traces gathered during incident]
- [commands that were useful]

Open Questions:
- [what is still unknown]
```

```bash
# Gather data for handoff
kubectl get events -n <namespace> --sort-by='.lastTimestamp' -o custom-columns=TIME:.lastTimestamp,TYPE:.type,REASON:.reason,MESSAGE:.message
kubectl get pods -n <namespace> -l app=<name> -o wide
kubectl logs deployment/<name> -n <namespace> --tail=50 --timestamps
```

This handoff feeds into the **incident-rca** skill for structured post-incident root cause analysis.

## Safety Mode Behavior

This skill respects the configured xops.bot safety mode:

| Operation Type | Safe Mode | Standard Mode | Full Mode |
|---------------|-----------|---------------|-----------|
| Read-only (get, describe, logs, events, top) | Allowed | Auto-execute | Auto-execute |
| Mutations (rollback, scale, apply, patch, label, cordon) | Blocked | Requires approval + confirmation | Requires awareness |
| Destructive (drain, delete pod for force restart) | Blocked | Requires approval + confirmation | Requires awareness |

During active incidents, Standard mode still requires confirmation for mutations. Time pressure is never a reason to bypass safety checks. Show the exact command, get confirmation, then execute.

## Related Skills

- **incident-analysis**: For investigation and evidence gathering before response actions
- **incident-rca**: For structured post-incident root cause analysis and postmortem
- **k8s-deploy**: For deployment rollout patterns and deployment strategy reference
- **k8s-debug**: For deep Kubernetes debugging during incident response
- **observability-rca**: For metrics, logs, and traces correlation during response
