# Tools

<!-- GENERATED: Safety annotations from tool definitions -->

## Risk Classification Summary

| Risk Level | Behavior |
|------------|----------|
| LOW | Auto-execute without prompting |
| MEDIUM | Execute with awareness notification |
| HIGH | Require explicit approval before execution |
| CRITICAL | Require approval with confirmation prompt |

## kubectl

Kubernetes command-line tool

### Read-Only Operations (LOW risk)

| Command | Risk | Description |
|---------|------|-------------|
| `kubectl get` | LOW | List resources in tabular or JSON/YAML format |
| `kubectl describe` | LOW | Show detailed information about a resource |
| `kubectl logs` | LOW | Print container logs |
| `kubectl top` | LOW | Display resource usage (CPU/memory) |
| `kubectl api-resources` | LOW | List available API resources on the server |
| `kubectl api-versions` | LOW | List available API versions on the server |
| `kubectl cluster-info` | LOW | Display cluster endpoint and service information |
| `kubectl config` | LOW | View or modify kubeconfig settings |
| `kubectl version` | LOW | Print client and server version information |
| `kubectl explain` | LOW | Show documentation for a resource field |
| `kubectl auth` | LOW | Inspect authorization settings |
| `kubectl port-forward` | LOW | Forward local ports to a pod |
| `kubectl proxy` | LOW | Run a proxy to the Kubernetes API server |

### Diagnostic Operations (MEDIUM risk)

| Command | Risk | Description |
|---------|------|-------------|
| `kubectl exec` | MEDIUM | Execute a command inside a container |
| `kubectl cp` | MEDIUM | Copy files between containers and the local filesystem |
| `kubectl attach` | MEDIUM | Attach to a running container |
| `kubectl debug` | MEDIUM | Create debugging sessions for troubleshooting workloads |

### Mutations (HIGH risk)

| Command | Risk | Description |
|---------|------|-------------|
| `kubectl apply` | HIGH | Apply a configuration to a resource by file or stdin |
| `kubectl create` | HIGH | Create a resource from a file or stdin |
| `kubectl patch` | HIGH | Update fields of a resource using a strategic merge patch |
| `kubectl replace` | HIGH | Replace a resource by file or stdin |
| `kubectl set` | HIGH | Set specific features on objects (image, resources, etc.) |
| `kubectl label` | HIGH | Add or update labels on a resource |
| `kubectl annotate` | HIGH | Add or update annotations on a resource |
| `kubectl scale` | HIGH | Set a new size for a deployment, replica set, or stateful set |
| `kubectl autoscale` | HIGH | Auto-scale a deployment, replica set, or stateful set |
| `kubectl rollout` | HIGH | Manage the rollout of a resource (status, history, undo, restart) |
| `kubectl expose` | HIGH | Expose a resource as a new Kubernetes service |
| `kubectl run` | HIGH | Run a particular image on the cluster |
| `kubectl edit` | HIGH | Edit a resource on the server in an editor |
| `kubectl cordon` | HIGH | Mark a node as unschedulable |
| `kubectl uncordon` | HIGH | Mark a node as schedulable |
| `kubectl taint` | HIGH | Update taints on one or more nodes |

### Destructive Operations (CRITICAL risk)

| Command | Risk | Description |
|---------|------|-------------|
| `kubectl delete` | CRITICAL | Delete resources by file, stdin, resource, or name |
| `kubectl drain` | CRITICAL | Drain a node in preparation for maintenance |

<!-- END GENERATED -->

# Tool Usage Guidelines

## Quick Diagnosis Commands

Use these for rapid initial assessment:

### Cluster Overview
```bash
# All pods not running
kubectl get pods -A | grep -v Running | grep -v Completed

# Recent events (last 30 minutes)
kubectl get events --sort-by='.lastTimestamp' -A | tail -30

# Node status
kubectl get nodes -o wide

# Resource pressure
kubectl top nodes
kubectl top pods -A --sort-by=memory | head -20
```

### Service Health
```bash
# Check endpoints (empty = no healthy backends)
kubectl get endpoints -A | grep "<none>"

# Check ingress status
kubectl get ingress -A

# Service connectivity test
kubectl run tmp-debug --rm -i --tty --image=busybox -- wget -qO- http://service-name.namespace
```

### Container Status
```bash
# Pods in crash loop
kubectl get pods -A | grep CrashLoopBackOff

# Container restart counts
kubectl get pods -A -o jsonpath='{range .items[*]}{.metadata.namespace}{"\t"}{.metadata.name}{"\t"}{.status.containerStatuses[*].restartCount}{"\n"}{end}' | sort -t$'\t' -k3 -nr | head -10

# Recent container exits
kubectl get pods -A -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.containerStatuses[*].lastState.terminated.reason}{"\n"}{end}' | grep -v "^$"
```

## Rollback Patterns

### Kubernetes Deployments
```bash
# Check rollout history
kubectl rollout history deployment/<name> -n <namespace>

# Rollback to previous
kubectl rollout undo deployment/<name> -n <namespace>

# Rollback to specific revision
kubectl rollout undo deployment/<name> -n <namespace> --to-revision=<N>

# Verify rollback complete
kubectl rollout status deployment/<name> -n <namespace>
```

### Helm Releases
```bash
# Check history
helm history <release> -n <namespace>

# Rollback to previous
helm rollback <release> -n <namespace>

# Rollback to specific revision
helm rollback <release> <revision> -n <namespace>
```

## Log Aggregation for Timeline

### Kubernetes Logs
```bash
# Logs from crashed container
kubectl logs <pod> -n <namespace> --previous

# Logs with timestamps
kubectl logs <pod> -n <namespace> --timestamps

# Logs since specific time
kubectl logs <pod> -n <namespace> --since=30m

# All container logs in deployment
kubectl logs -l app=<name> -n <namespace> --all-containers
```

### Multi-pod Log Aggregation
```bash
# Stream logs from multiple pods
kubectl logs -l app=<name> -n <namespace> -f --max-log-requests=10

# Logs from all pods with timestamps for correlation
for pod in $(kubectl get pods -l app=<name> -n <namespace> -o name); do
  echo "=== $pod ===" && kubectl logs $pod -n <namespace> --timestamps --since=1h
done
```

## When to Page vs When to Fix

### Fix Immediately (No Page Required)

- Single pod restart in healthy deployment
- Known issue with documented runbook
- Transient error that self-resolves
- Non-production environment

### Page On-Call

- Production service degradation
- Multiple component failures
- Unknown or novel failure mode
- Data integrity concern
- Blast radius expanding

### Page Leadership

- SEV-1 declared
- Customer-facing outage > 30 minutes
- Security incident suspected
- Regulatory/compliance concern

## Tool Priority During Incidents

| Phase | Priority Tools | Avoid |
|-------|---------------|-------|
| Assessment | kubectl get, describe | Making changes |
| Stabilization | kubectl rollout, scale | Deep debugging |
| Mitigation | kubectl apply (known fixes) | Experiments |
| Monitoring | kubectl get, logs | Unnecessary changes |

## Safety During Incidents

Even during emergencies:

1. **Show commands before executing**
2. **Prefer rollback over hotfix**
3. **Document every action taken**
4. **Use --dry-run when testing changes**
5. **Never delete without explicit approval**
