---
name: docker-ops
description: "Docker container operations, debugging, and resource management. Use when managing Docker containers, checking container logs, debugging container startup issues, inspecting container state, cleaning up Docker resources, monitoring container resource usage, or troubleshooting network connectivity between containers."
metadata:
  {
    "openclaw":
      {
        "emoji": "whale",
        "requires": { "bins": ["docker"] },
      },
  }
---

# Docker Operations

Quick reference for Docker container management and debugging.

## Quick Status Commands

### List Containers

```bash
# Running containers
docker ps

# All containers (including stopped)
docker ps -a

# With size info
docker ps -s

# Custom format
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Container Logs

```bash
# View logs
docker logs <container>

# Follow logs (live)
docker logs -f <container>

# Last N lines
docker logs --tail 100 <container>

# With timestamps
docker logs -t <container>

# Since time
docker logs --since 1h <container>
```

### Resource Usage

```bash
# Live stats for all containers
docker stats

# One-time stats (no stream)
docker stats --no-stream

# Specific container
docker stats <container>
```

## Container Management

### Start/Stop/Restart

```bash
# Start stopped container
docker start <container>

# Stop running container
docker stop <container>

# Restart container
docker restart <container>

# Kill (force stop)
docker kill <container>
```

### Execute Commands

```bash
# Run command in container
docker exec <container> <command>

# Interactive shell
docker exec -it <container> /bin/sh
docker exec -it <container> /bin/bash

# As root
docker exec -u root -it <container> /bin/sh
```

### Inspect Container

```bash
# Full inspect output
docker inspect <container>

# Get specific field
docker inspect -f '{{.State.Status}}' <container>
docker inspect -f '{{.NetworkSettings.IPAddress}}' <container>
docker inspect -f '{{json .Config.Env}}' <container>
```

## Image Management

### List Images

```bash
# All images
docker images

# With digests
docker images --digests

# Dangling images only
docker images -f "dangling=true"
```

### Pull/Push

```bash
# Pull image
docker pull <image>:<tag>

# Push image
docker push <image>:<tag>
```

## Cleanup Commands

### Safe Cleanup

```bash
# Remove stopped containers
docker container prune -f

# Remove unused images
docker image prune -f

# Remove unused volumes
docker volume prune -f

# Remove unused networks
docker network prune -f

# Full system cleanup (safe - only unused)
docker system prune -f
```

### Check Disk Usage

```bash
# Docker disk usage summary
docker system df

# Detailed breakdown
docker system df -v
```

## Debugging

### Container Not Starting

```bash
# Check container state
docker inspect -f '{{.State.Status}}' <container>
docker inspect -f '{{.State.Error}}' <container>

# Check logs
docker logs <container>

# Check events
docker events --since 1h --filter container=<container>
```

### Network Issues

```bash
# List networks
docker network ls

# Inspect network
docker network inspect <network>

# Check container network
docker inspect -f '{{json .NetworkSettings.Networks}}' <container>

# Test connectivity from container
docker exec <container> ping -c 3 <host>
docker exec <container> curl -v <url>
```

### Resource Issues

```bash
# Check container resource limits
docker inspect -f '{{.HostConfig.Memory}}' <container>
docker inspect -f '{{.HostConfig.CpuShares}}' <container>

# Live resource usage
docker stats <container> --no-stream
```

## Common Patterns

### Run One-Off Command

```bash
# Run and remove after
docker run --rm <image> <command>

# Example: check version
docker run --rm alpine cat /etc/alpine-release
```

### Copy Files

```bash
# Copy from container to host
docker cp <container>:/path/to/file ./local/path

# Copy from host to container
docker cp ./local/file <container>:/path/in/container
```

### View Container Processes

```bash
# Processes in container
docker top <container>
```

## Quick Troubleshooting

| Symptom | Check | Fix |
|---------|-------|-----|
| Container exits immediately | `docker logs <container>` | Fix application error |
| Can't connect to container | `docker inspect` network | Check port mapping |
| Container slow | `docker stats` | Increase resources |
| Disk full | `docker system df` | `docker system prune` |
| Image pull fails | Network/auth | Check registry access |

## Safety Mode Behavior

This skill respects the configured xops.bot safety mode:

| Operation Type | Safe Mode | Standard Mode | Full Mode |
|---------------|-----------|---------------|-----------|
| Read-only (ps, logs, inspect, stats) | Allowed | Auto-execute | Auto-execute |
| Mutations (start, stop, restart, exec) | Blocked | Requires approval | Executes with awareness |
| Destructive (kill, prune, system prune) | Blocked | Requires approval + confirmation | Requires awareness |

Always check the current safety mode before executing mutations. When in doubt, prefer read-only inspection first.

## Related Skills

- **k8s-debug**: For Kubernetes container debugging
