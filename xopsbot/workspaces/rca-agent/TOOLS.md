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

## Read-Only Investigation Tools

During active investigation, prefer read-only operations to preserve evidence.

### Log Analysis

**kubectl logs**

```bash
# Recent logs
kubectl logs <pod> -n <namespace> --since=1h

# Previous container logs
kubectl logs <pod> -n <namespace> --previous

# Logs with timestamps
kubectl logs <pod> -n <namespace> --timestamps

# Follow logs (real-time)
kubectl logs <pod> -n <namespace> -f

# All containers in pod
kubectl logs <pod> -n <namespace> --all-containers

# Logs from all pods matching label
kubectl logs -l app=<label> -n <namespace>
```

**journalctl** (for node-level logs)

```bash
# Service logs
journalctl -u kubelet --since "1 hour ago"

# Kernel logs
journalctl -k --since "1 hour ago"

# Specific time window
journalctl --since "2024-01-15 10:00:00" --until "2024-01-15 11:00:00"
```

### Metric Queries

**kubectl top**

```bash
# Pod resource usage
kubectl top pods -n <namespace>

# Node resource usage
kubectl top nodes

# Sorted by CPU
kubectl top pods -n <namespace> --sort-by=cpu

# Sorted by memory
kubectl top pods -n <namespace> --sort-by=memory
```

**Prometheus queries** (when available)

```promql
# Error rate
rate(http_requests_total{status=~"5.."}[5m])

# Latency percentiles
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))

# Resource utilization
container_memory_usage_bytes{namespace="<namespace>"}
```

### Timeline Correlation

**Kubernetes events**

```bash
# All events, sorted by time
kubectl get events -n <namespace> --sort-by='.lastTimestamp'

# Events for specific resource
kubectl get events -n <namespace> --field-selector involvedObject.name=<pod-name>

# Warning events only
kubectl get events -n <namespace> --field-selector type=Warning
```

**Resource history**

```bash
# Deployment history
kubectl rollout history deployment/<name> -n <namespace>

# ReplicaSet history
kubectl get rs -n <namespace> -l app=<label>

# Describe for recent events
kubectl describe pod <pod> -n <namespace>
```

## When to Request Write Access

Write operations require explicit approval and are typically for:

### Safe Diagnostic Commands

```bash
# DNS debugging (creates temporary pod)
kubectl run dns-test --rm -it --image=busybox -n <namespace> -- nslookup <service>

# Network debugging (creates temporary pod)
kubectl run net-test --rm -it --image=nicolaka/netshoot -n <namespace> -- curl <endpoint>
```

### Evidence Preservation

```bash
# Capture logs before pod deletion
kubectl logs <pod> -n <namespace> > evidence/pod-logs.txt

# Capture describe output
kubectl describe pod <pod> -n <namespace> > evidence/pod-describe.txt

# Capture current state
kubectl get <resource> -n <namespace> -o yaml > evidence/resource-state.yaml
```

## Analysis Patterns

### Error Pattern Search

```bash
# Search for errors in logs
kubectl logs <pod> -n <namespace> | grep -i error

# Count error occurrences
kubectl logs <pod> -n <namespace> | grep -ci error

# Extract unique error messages
kubectl logs <pod> -n <namespace> | grep -i error | sort -u
```

### Timing Analysis

```bash
# Extract timestamps from logs
kubectl logs <pod> -n <namespace> --timestamps | head -20

# Find gaps in logs
kubectl logs <pod> -n <namespace> --timestamps | awk '{print $1}' | sort
```

### Comparison Analysis

```bash
# Compare healthy vs unhealthy pod
kubectl describe pod <healthy-pod> -n <namespace> > healthy.txt
kubectl describe pod <unhealthy-pod> -n <namespace> > unhealthy.txt
diff healthy.txt unhealthy.txt
```

## Evidence Documentation

All tool outputs should be captured and referenced:

```markdown
### Evidence Log

| ID | Type | Source | Command | Key Findings |
|----|------|--------|---------|--------------|
| E1 | Logs | pod-abc | `kubectl logs...` | OOM at 10:45 |
| E2 | Metrics | prometheus | `rate(...)` | Error spike |
| E3 | Events | k8s | `kubectl get events` | Restart at 10:44 |
```

## Risk Classification

| Operation | Risk Level | Mode Required |
|-----------|------------|---------------|
| kubectl logs | Low | Any |
| kubectl describe | Low | Any |
| kubectl get events | Low | Any |
| kubectl top | Low | Any |
| kubectl run (debug pod) | Medium | Standard+ |
| kubectl exec (read) | Medium | Standard+ |
| kubectl exec (write) | High | Full only |
| Log file writes | Medium | Standard+ |
