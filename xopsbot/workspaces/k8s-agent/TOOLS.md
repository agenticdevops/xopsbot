# Tools

## Primary Tool: kubectl

### Namespace Convention

**Always specify namespace explicitly:**

```bash
# Required format
kubectl <verb> <resource> -n <namespace>

# Or for cluster-wide
kubectl <verb> <resource> --all-namespaces
kubectl <verb> <resource> -A
```

### Verb Selection

| Intent | Verb | Example |
|--------|------|---------|
| View resource details | `describe` | `kubectl describe pod nginx -n default` |
| View logs | `logs` | `kubectl logs nginx -n default` |
| List resources | `get` | `kubectl get pods -n default` |
| Interactive shell | `exec` | `kubectl exec -it nginx -n default -- sh` |
| Apply changes | `apply` | `kubectl apply -f manifest.yaml -n default` |
| Delete resource | `delete` | `kubectl delete pod nginx -n default` |
| Scale workload | `scale` | `kubectl scale deploy nginx --replicas=3 -n default` |

### When to Use Each

**describe** - First choice for troubleshooting
- Shows events (recent issues)
- Shows configuration
- Shows status and conditions

**logs** - Second choice for troubleshooting
- Application errors
- Startup failures
- Runtime issues

**exec** - Last resort
- When logs are insufficient
- Network debugging from inside pod
- File verification

### Dry-Run Preference

For any mutation, prefer dry-run first:

```bash
# Client-side validation
kubectl apply -f manifest.yaml --dry-run=client -o yaml

# Server-side validation (more accurate)
kubectl apply -f manifest.yaml --dry-run=server -o yaml

# Show diff against current state
kubectl diff -f manifest.yaml
```

### Output Formats

```bash
# Human readable (default)
kubectl get pods -n default

# Wide format (more columns)
kubectl get pods -n default -o wide

# YAML output
kubectl get pod nginx -n default -o yaml

# JSON output
kubectl get pod nginx -n default -o json

# Custom columns
kubectl get pods -n default -o custom-columns=NAME:.metadata.name,STATUS:.status.phase

# JSONPath
kubectl get pods -n default -o jsonpath='{.items[*].metadata.name}'
```

## Common Debugging Patterns

### Pod Not Starting

```bash
# 1. Check pod status
kubectl get pod <name> -n <namespace>

# 2. Describe for events
kubectl describe pod <name> -n <namespace>

# 3. Check node resources
kubectl describe node <node-name>

# 4. Check resource quotas
kubectl get resourcequota -n <namespace>
```

### Pod CrashLoopBackOff

```bash
# 1. Get current logs
kubectl logs <pod> -n <namespace>

# 2. Get previous container logs
kubectl logs <pod> -n <namespace> --previous

# 3. Check exit code
kubectl get pod <pod> -n <namespace> -o jsonpath='{.status.containerStatuses[0].lastState.terminated.exitCode}'
```

### Service Not Reachable

```bash
# 1. Check service endpoints
kubectl get endpoints <service> -n <namespace>

# 2. Check pod labels match service selector
kubectl get pods -n <namespace> --show-labels

# 3. Test from within cluster
kubectl run debug --rm -it --image=busybox -n <namespace> -- wget -qO- <service>:<port>
```

### Deployment Not Rolling Out

```bash
# 1. Check rollout status
kubectl rollout status deployment/<name> -n <namespace>

# 2. Check rollout history
kubectl rollout history deployment/<name> -n <namespace>

# 3. Check ReplicaSets
kubectl get rs -n <namespace> -l app=<label>
```

## Secondary Tool: Helm

### Common Operations

```bash
# List releases
helm list -n <namespace>

# Get release status
helm status <release> -n <namespace>

# Get release values
helm get values <release> -n <namespace>

# Dry-run install/upgrade
helm upgrade --install <release> <chart> -n <namespace> --dry-run

# Rollback
helm rollback <release> <revision> -n <namespace>
```

### Best Practices

- Always use `-n <namespace>`
- Use `--dry-run` before actual operations
- Store values in version-controlled files
- Use `helm diff` plugin for change preview

## Risk Classification

| Operation | Risk Level | Confirmation Required |
|-----------|------------|----------------------|
| get, describe, logs | Low | No |
| exec (read-only) | Low | No |
| exec (write) | Medium | Standard mode+ |
| apply, create | Medium | Standard mode+ |
| scale | Medium | Standard mode+ |
| delete pod | Medium | Standard mode+ |
| delete deployment | High | Always |
| delete namespace | Critical | Always + extra confirmation |
| drain node | Critical | Always + extra confirmation |
