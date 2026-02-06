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

## docker

Docker container runtime

### Read-Only Operations (LOW risk)

| Command | Risk | Description |
|---------|------|-------------|
| `docker ps` | LOW | List containers |
| `docker images` | LOW | List images |
| `docker inspect` | LOW | Return low-level information on Docker objects |
| `docker logs` | LOW | Fetch the logs of a container |
| `docker stats` | LOW | Display a live stream of container resource usage |
| `docker top` | LOW | Display the running processes of a container |
| `docker version` | LOW | Show Docker version information |
| `docker info` | LOW | Display system-wide information |
| `docker history` | LOW | Show the history of an image |
| `docker search` | LOW | Search Docker Hub for images |
| `docker events` | LOW | Get real-time events from the server |
| `docker diff` | LOW | Inspect changes to files on a container filesystem |
| `docker port` | LOW | List port mappings for a container |

### Diagnostic Operations (MEDIUM risk)

| Command | Risk | Description |
|---------|------|-------------|
| `docker build` | MEDIUM | Build an image from a Dockerfile |
| `docker pull` | MEDIUM | Download an image from a registry |
| `docker tag` | MEDIUM | Create a tag that refers to a source image |
| `docker save` | MEDIUM | Save one or more images to a tar archive |
| `docker load` | MEDIUM | Load an image from a tar archive |
| `docker export` | MEDIUM | Export a container filesystem as a tar archive |
| `docker import` | MEDIUM | Import contents from a tarball to create a filesystem image |
| `docker commit` | MEDIUM | Create a new image from a container changes |
| `docker exec` | MEDIUM | Execute a command in a running container |
| `docker attach` | MEDIUM | Attach local standard I/O streams to a running container |
| `docker cp` | MEDIUM | Copy files between a container and the local filesystem |

### Mutations (HIGH risk)

| Command | Risk | Description |
|---------|------|-------------|
| `docker run` | HIGH | Create and start a new container |
| `docker start` | HIGH | Start one or more stopped containers |
| `docker stop` | HIGH | Stop one or more running containers |
| `docker restart` | HIGH | Restart one or more containers |
| `docker pause` | HIGH | Pause all processes within one or more containers |
| `docker unpause` | HIGH | Unpause all processes within one or more containers |
| `docker kill` | HIGH | Kill one or more running containers |
| `docker push` | HIGH | Upload an image to a registry |

### Destructive Operations (CRITICAL risk)

| Command | Risk | Description |
|---------|------|-------------|
| `docker rm` | CRITICAL | Remove one or more containers |
| `docker rmi` | CRITICAL | Remove one or more images |
| `docker prune` | CRITICAL | Remove unused data |
| `docker system prune` | CRITICAL | Remove all unused containers, networks, images, and optionally volumes |
| `docker volume rm` | CRITICAL | Remove one or more volumes |
| `docker network rm` | CRITICAL | Remove one or more networks |

<!-- END GENERATED -->

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
