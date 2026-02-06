---
name: k8s-deploy
description: "Safe Kubernetes deployment practices, rollout strategies, and rollback procedures. Use when deploying new application versions, rolling back failed deployments, scaling applications, managing deployment strategies, or performing pre-deployment health checks with kubectl."
metadata:
  {
    "openclaw":
      {
        "emoji": "rocket",
        "requires": { "bins": ["kubectl"] },
      },
  }
---

# Kubernetes Deployment

Safe deployment practices, rollout strategies, and rollback procedures.

## Pre-Deployment Checklist

### 1. Cluster Health Check

```bash
# Nodes ready?
kubectl get nodes

# Any problematic pods?
kubectl get pods -A | grep -v Running | grep -v Completed

# Resource availability
kubectl top nodes
```

### 2. Image Verification

```bash
# Verify image exists (example with Docker Hub)
docker manifest inspect <image>:<tag>

# Check current image
kubectl get deployment <name> -o jsonpath='{.spec.template.spec.containers[0].image}'
```

### 3. Current State Backup

```bash
# Save current deployment spec
kubectl get deployment <name> -o yaml > deployment-backup.yaml

# Note current revision
kubectl rollout history deployment/<name>
```

## Deployment Methods

### Update Image (Most Common)

```bash
# Update container image
kubectl set image deployment/<name> <container>=<image>:<tag>

# Example
kubectl set image deployment/nginx nginx=nginx:1.25

# Watch rollout
kubectl rollout status deployment/<name>
```

### Apply Manifest

```bash
# Dry-run first (ALWAYS)
kubectl apply -f deployment.yaml --dry-run=client

# Show diff
kubectl diff -f deployment.yaml

# Apply
kubectl apply -f deployment.yaml

# Watch
kubectl rollout status deployment/<name>
```

### Patch Deployment

```bash
# Strategic merge patch
kubectl patch deployment <name> -p '{"spec":{"replicas":5}}'

# JSON patch
kubectl patch deployment <name> --type='json' \
  -p='[{"op":"replace","path":"/spec/replicas","value":5}]'
```

## Rollout Management

### Check Rollout Status

```bash
# Status
kubectl rollout status deployment/<name>

# History
kubectl rollout history deployment/<name>

# Specific revision details
kubectl rollout history deployment/<name> --revision=2
```

### Pause/Resume Rollout

```bash
# Pause (for canary-style manual control)
kubectl rollout pause deployment/<name>

# Resume
kubectl rollout resume deployment/<name>
```

### Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/<name>

# Rollback to specific revision
kubectl rollout undo deployment/<name> --to-revision=2

# Verify rollback
kubectl rollout status deployment/<name>
```

## Scaling

### Manual Scaling

```bash
# Scale replicas
kubectl scale deployment/<name> --replicas=5

# Scale multiple
kubectl scale deployment/<name1> deployment/<name2> --replicas=3
```

### Autoscaling (HPA)

```bash
# Create HPA
kubectl autoscale deployment/<name> --min=2 --max=10 --cpu-percent=80

# Check HPA status
kubectl get hpa

# Describe HPA
kubectl describe hpa <name>
```

## Deployment Strategies

### Rolling Update (Default)

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%        # Max pods over desired
      maxUnavailable: 25%  # Max pods unavailable
```

```bash
# Check current strategy
kubectl get deployment <name> -o jsonpath='{.spec.strategy}'
```

### Recreate

```yaml
spec:
  strategy:
    type: Recreate  # Kill all, then create new
```

### Blue-Green (Manual)

```bash
# Deploy new version with different label
kubectl apply -f deployment-v2.yaml

# Verify v2 is healthy
kubectl get pods -l version=v2

# Switch service to v2
kubectl patch service <name> -p '{"spec":{"selector":{"version":"v2"}}}'

# Rollback: switch back to v1
kubectl patch service <name> -p '{"spec":{"selector":{"version":"v1"}}}'
```

### Canary (Manual)

```bash
# Scale down main, scale up canary
kubectl scale deployment/<name>-main --replicas=9
kubectl scale deployment/<name>-canary --replicas=1

# Monitor canary metrics, then promote or rollback
```

## Post-Deployment Verification

### Health Checks

```bash
# Pods running?
kubectl get pods -l app=<name>

# Ready and healthy?
kubectl get deployment <name>

# Events (errors?)
kubectl get events --field-selector involvedObject.name=<deployment> --sort-by='.lastTimestamp'
```

### Smoke Tests

```bash
# Port-forward and test
kubectl port-forward deployment/<name> 8080:80 &
curl localhost:8080/health

# Or exec into pod
kubectl exec -it deployment/<name> -- curl localhost/health
```

### Compare Metrics

```bash
# Check resource usage
kubectl top pods -l app=<name>

# Compare with previous
# (Use your monitoring: Prometheus, Datadog, etc.)
```

## Troubleshooting Failed Deployments

### Deployment Stuck

```bash
# Check rollout status
kubectl rollout status deployment/<name>

# Check events
kubectl describe deployment <name>

# Check pod issues
kubectl get pods -l app=<name>
kubectl describe pod <problematic-pod>
```

### Common Issues

| Symptom | Check | Fix |
|---------|-------|-----|
| ImagePullBackOff | Image name/tag, registry auth | Fix image reference |
| CrashLoopBackOff | Pod logs | Fix application error |
| Pending pods | Node resources, PVC | Scale cluster or fix storage |
| Readiness probe failing | App startup time | Adjust probe timing |

### Emergency Rollback

```bash
# Immediate rollback
kubectl rollout undo deployment/<name>

# If that fails, scale to zero then restore from backup
kubectl scale deployment/<name> --replicas=0
kubectl apply -f deployment-backup.yaml
```

## Safe Deployment Workflow

```bash
# 1. Pre-flight
kubectl get nodes && kubectl top nodes

# 2. Backup current state
kubectl get deployment <name> -o yaml > backup.yaml

# 3. Dry-run
kubectl apply -f new-deployment.yaml --dry-run=client

# 4. Show diff
kubectl diff -f new-deployment.yaml

# 5. Apply with record
kubectl apply -f new-deployment.yaml

# 6. Watch rollout
kubectl rollout status deployment/<name> --timeout=5m

# 7. Verify health
kubectl get pods -l app=<name>
kubectl logs -l app=<name> --tail=20

# 8. If issues: rollback
kubectl rollout undo deployment/<name>
```

## Safety Mode Behavior

This skill respects the configured xops.bot safety mode:

| Operation Type | Safe Mode | Standard Mode | Full Mode |
|---------------|-----------|---------------|-----------|
| Read-only (get, describe, rollout status) | Allowed | Auto-execute | Auto-execute |
| Mutations (apply, set image, scale, patch) | Blocked | Requires approval | Executes with awareness |
| Destructive (rollback, delete, scale to zero) | Blocked | Requires approval + confirmation | Requires awareness |

Always check the current safety mode before executing mutations. When in doubt, prefer dry-run first.

## Related Skills

- **k8s-debug**: For troubleshooting deployment issues
- **incident-response**: When deployments cause incidents
