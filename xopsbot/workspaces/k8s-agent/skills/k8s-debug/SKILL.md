---
name: k8s-debug
description: "Kubernetes debugging and troubleshooting workflows for diagnosing cluster issues. Use when pods are crashing or restarting, services are not responding, deployments are stuck, investigating resource constraints, diagnosing network connectivity problems, or analyzing container logs with kubectl."
metadata:
  {
    "openclaw":
      {
        "emoji": "mag",
        "requires": { "bins": ["kubectl"] },
      },
  }
---

# Kubernetes Debugging

Expert guidance for diagnosing and resolving Kubernetes issues.

## Quick Diagnosis Commands

### Check Pod Status

```bash
# All pods not in Running state
kubectl get pods -A | grep -v Running | grep -v Completed

# Pods in specific namespace
kubectl get pods -n <namespace> -o wide

# Detailed pod info
kubectl describe pod <pod-name> -n <namespace>
```

### Check Events

```bash
# Recent cluster events (sorted by time)
kubectl get events -A --sort-by='.lastTimestamp' | tail -20

# Events for specific pod
kubectl get events --field-selector involvedObject.name=<pod-name>
```

### Check Logs

```bash
# Current logs
kubectl logs <pod-name> -n <namespace>

# Previous container logs (after crash)
kubectl logs <pod-name> -n <namespace> --previous

# Logs with timestamps
kubectl logs <pod-name> --timestamps

# Follow logs
kubectl logs <pod-name> -f

# Logs from specific container in multi-container pod
kubectl logs <pod-name> -c <container-name>
```

## Common Pod States and Solutions

### CrashLoopBackOff

**Symptoms:** Pod repeatedly crashes and restarts.

**Diagnosis:**
```bash
# Check previous logs
kubectl logs <pod-name> --previous

# Check events
kubectl describe pod <pod-name> | grep -A 10 Events

# Check exit code
kubectl get pod <pod-name> -o jsonpath='{.status.containerStatuses[0].lastState.terminated.exitCode}'
```

**Common Causes:**
1. **Application error** - Check logs for stack traces
2. **Missing config/secrets** - Verify ConfigMaps and Secrets exist
3. **Resource limits too low** - Check if OOMKilled
4. **Liveness probe failing** - Review probe configuration
5. **Missing dependencies** - Database, external service not reachable

### ImagePullBackOff

**Symptoms:** Container image cannot be pulled.

**Diagnosis:**
```bash
# Check image name and events
kubectl describe pod <pod-name> | grep -E "(Image|Events)" -A 5
```

**Common Causes:**
1. **Wrong image name/tag** - Verify image exists in registry
2. **Private registry auth** - Check imagePullSecrets
3. **Network issues** - Registry not reachable
4. **Rate limiting** - Docker Hub rate limits

**Fix:**
```bash
# Create/update pull secret
kubectl create secret docker-registry regcred \
  --docker-server=<registry> \
  --docker-username=<user> \
  --docker-password=<password>
```

### Pending

**Symptoms:** Pod stays in Pending state.

**Diagnosis:**
```bash
# Check why pod is pending
kubectl describe pod <pod-name> | grep -A 5 "Events"

# Check node resources
kubectl describe nodes | grep -A 5 "Allocated resources"

# Check for taints
kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints
```

**Common Causes:**
1. **Insufficient resources** - Not enough CPU/memory on nodes
2. **Node selector mismatch** - No nodes match selector
3. **Taints/tolerations** - Pod doesn't tolerate node taints
4. **PVC not bound** - Persistent volume not available

### OOMKilled

**Symptoms:** Container killed due to memory limit.

**Diagnosis:**
```bash
# Check termination reason
kubectl get pod <pod-name> -o jsonpath='{.status.containerStatuses[0].lastState.terminated.reason}'

# Check memory limits vs requests
kubectl get pod <pod-name> -o jsonpath='{.spec.containers[0].resources}'
```

**Fix:**
- Increase memory limits in deployment
- Optimize application memory usage
- Add memory monitoring

## Resource Debugging

### Check Resource Usage

```bash
# Node resource usage
kubectl top nodes

# Pod resource usage
kubectl top pods -A --sort-by=memory

# Pod resource usage in namespace
kubectl top pods -n <namespace>
```

### Check Resource Requests/Limits

```bash
# All pods with resources
kubectl get pods -A -o custom-columns=\
'NAMESPACE:.metadata.namespace,NAME:.metadata.name,CPU_REQ:.spec.containers[*].resources.requests.cpu,MEM_REQ:.spec.containers[*].resources.requests.memory,CPU_LIM:.spec.containers[*].resources.limits.cpu,MEM_LIM:.spec.containers[*].resources.limits.memory'
```

## Network Debugging

### Check Service Connectivity

```bash
# Get service endpoints
kubectl get endpoints <service-name>

# Check if service has pods
kubectl get pods -l <service-selector>

# Test from inside cluster
kubectl run debug --rm -it --image=busybox -- wget -qO- http://<service>:<port>
```

### DNS Issues

```bash
# Test DNS resolution
kubectl run debug --rm -it --image=busybox -- nslookup <service-name>

# Check CoreDNS pods
kubectl get pods -n kube-system -l k8s-app=kube-dns
```

## Quick Fixes

### Restart Deployment

```bash
# Rolling restart (zero downtime)
kubectl rollout restart deployment/<name> -n <namespace>

# Check rollout status
kubectl rollout status deployment/<name> -n <namespace>
```

### Scale Deployment

```bash
# Scale up/down
kubectl scale deployment/<name> --replicas=3 -n <namespace>
```

### Delete Stuck Pod

```bash
# Force delete (use with caution)
kubectl delete pod <pod-name> --grace-period=0 --force
```

## Debugging Checklist

1. **Check pod status**: `kubectl get pods`
2. **Check events**: `kubectl get events --sort-by='.lastTimestamp'`
3. **Check logs**: `kubectl logs <pod>`
4. **Check describe**: `kubectl describe pod <pod>`
5. **Check resources**: `kubectl top pods`
6. **Check network**: Test service connectivity
7. **Check config**: Verify ConfigMaps/Secrets

## Safety Mode Behavior

This skill respects the configured xops.bot safety mode:

| Operation Type | Safe Mode | Standard Mode | Full Mode |
|---------------|-----------|---------------|-----------|
| Read-only (get, describe, logs, events, top) | Allowed | Auto-execute | Auto-execute |
| Diagnostic exec (exec into pod, run debug pod) | Blocked | Requires approval | Executes with awareness |
| Mutations (restart, scale, delete pod) | Blocked | Requires approval + confirmation | Requires awareness |

Always check the current safety mode before executing mutations. When in doubt, prefer read-only diagnostic commands first.

## Related Skills

- **k8s-deploy**: For deployment issues
- **incident-response**: For structured incident handling
