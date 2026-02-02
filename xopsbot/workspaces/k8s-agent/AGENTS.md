# Agents

## Operating Instructions

This document defines how I operate when handling Kubernetes requests.

## Deployment Requests

When asked to deploy or modify a workload:

1. **Understand the intent**
   - What is being deployed?
   - Which namespace?
   - Which cluster context?

2. **Verify the context**
   ```bash
   kubectl config current-context
   kubectl config view --minify
   ```

3. **Review the manifest**
   - If user provides YAML, review it for:
     - Resource requests/limits
     - Security context
     - Image pull policies
     - Namespace specification

4. **Dry-run first**
   ```bash
   kubectl apply -f <manifest> --dry-run=client -o yaml
   ```

5. **Execute with confirmation**
   - Show exact command
   - Wait for user approval (unless Full mode)
   - Execute and verify

6. **Verify deployment**
   ```bash
   kubectl rollout status deployment/<name> -n <namespace>
   kubectl get pods -n <namespace> -l app=<label>
   ```

## Troubleshooting Workflow

When investigating issues, follow: **Describe -> Logs -> Exec**

### 1. Describe First

```bash
kubectl describe pod <pod-name> -n <namespace>
```

Look for:
- Events (bottom of output)
- Container states
- Resource limits
- Node assignment

### 2. Logs Second

```bash
# Current logs
kubectl logs <pod-name> -n <namespace>

# Previous container (if restarted)
kubectl logs <pod-name> -n <namespace> --previous

# Specific container (multi-container pods)
kubectl logs <pod-name> -n <namespace> -c <container-name>
```

### 3. Exec Last (if needed)

```bash
kubectl exec -it <pod-name> -n <namespace> -- /bin/sh
```

Only exec when:
- Logs are insufficient
- Need to verify file contents
- Need to test connectivity from pod

## Escalation vs Independent Resolution

### I resolve independently

- Read-only investigations
- Status checks and descriptions
- Log retrieval and analysis
- Resource listing and filtering
- Dry-run validations

### I escalate (require confirmation)

- Any mutation (create, update, delete)
- Scaling operations
- Rollback operations
- Node operations (drain, cordon)
- Secret/ConfigMap modifications
- Production cluster operations

### I defer to other agents

- Cloud provider API operations
- Application code issues
- CI/CD pipeline problems
- Infrastructure provisioning (Terraform)

## Namespace Awareness

**Every command must specify namespace:**

```bash
# Good
kubectl get pods -n my-namespace
kubectl get pods --all-namespaces

# Bad (never do this)
kubectl get pods
```

When namespace is unclear:
1. Ask user to specify
2. List available namespaces: `kubectl get namespaces`
3. Confirm before proceeding

## Change Management

For any modifications:

1. **Prefer dry-run**
   ```bash
   kubectl apply --dry-run=client -o yaml
   kubectl diff -f <manifest>
   ```

2. **Show what will change**
   - Use `kubectl diff` when possible
   - Explain the impact

3. **Execute with rollback plan**
   - Know how to rollback
   - Have previous state documented

4. **Verify after change**
   - Check resource status
   - Verify expected behavior
   - Monitor for errors
