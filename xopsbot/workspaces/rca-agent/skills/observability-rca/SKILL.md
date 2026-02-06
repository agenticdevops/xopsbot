---
name: observability-rca
description: "Observability-driven root cause analysis correlating metrics, logs, and traces. Use when investigating service degradation, correlating Prometheus metrics with Loki logs, tracing request flows through Jaeger, performing RCA with observability data, diagnosing latency spikes across distributed services, or following the metrics-to-logs-to-traces investigation workflow with promtool, logcli, and curl."
metadata:
  {
    "openclaw":
      {
        "emoji": "telescope",
        "requires": { "bins": ["promtool", "logcli", "curl"] },
      },
  }
---

# Observability Root Cause Analysis

Correlating metrics, logs, and traces for systematic incident investigation.

## Investigation Workflow

The **metrics-to-logs-to-traces** methodology provides a structured approach to root cause analysis across distributed systems. Each signal type answers a different question:

| Signal | Question | Tool | When to Use |
|--------|----------|------|-------------|
| Metrics | What changed? | promtool | Start here. Identify anomalies in error rates, latency, resource usage |
| Logs | What happened? | logcli | After metrics narrow the time window and affected service |
| Traces | Where did it break? | curl (Jaeger API) | After logs identify the request path or trace ID |

**General approach:**

1. **Start with metrics** to identify WHAT changed and WHEN
2. **Pivot to logs** to understand WHY it changed
3. **Drill into traces** to see WHERE the failure propagated

This order is intentional: metrics are cheap to query and give broad coverage, logs provide detail for a narrowed scope, and traces reveal the exact failure path.

## Step 1: Metrics (What changed?)

Use `promtool` to query Prometheus for quantitative signals. Metrics reveal anomalies, trends, and the precise time window of incidents.

### Key PromQL Patterns

**Error rate (the first thing to check):**

```promql
# HTTP 5xx error rate over 5 minutes
rate(http_requests_total{status=~"5.."}[5m])

# Error ratio (errors / total)
sum(rate(http_requests_total{status=~"5.."}[5m])) /
sum(rate(http_requests_total[5m]))
```

**Latency percentiles:**

```promql
# P99 latency
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))

# P50 vs P99 comparison (large gap = tail latency issue)
histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))
```

**Resource utilization:**

```promql
# Container memory usage
container_memory_usage_bytes{namespace="prod", container!=""}

# Container CPU usage rate
rate(container_cpu_usage_seconds_total{namespace="prod"}[5m])

# Memory vs limits (approaching 1.0 = risk of OOM)
container_memory_usage_bytes / container_spec_memory_limit_bytes
```

**Saturation signals:**

```promql
# CPU throttling rate (high = containers hitting CPU limits)
rate(container_cpu_cfs_throttled_periods_total[5m]) /
rate(container_cpu_cfs_periods_total[5m])

# Disk I/O saturation
rate(node_disk_io_time_seconds_total[5m])
```

### Example promtool Commands

```bash
# Instant query (current value)
promtool query instant --server.url=http://prometheus:9090 \
  'rate(http_requests_total{status=~"5.."}[5m])'

# Range query (time series over window)
promtool query range --server.url=http://prometheus:9090 \
  --start='2024-01-15T10:00:00Z' --end='2024-01-15T11:00:00Z' --step=30s \
  'rate(http_requests_total{status=~"5.."}[5m])'

# Series metadata (what labels exist)
promtool query series --server.url=http://prometheus:9090 \
  --match='http_requests_total'

# Label values (enumerate services, namespaces)
promtool query labels --server.url=http://prometheus:9090 \
  'namespace'
```

### Metrics Investigation Checklist

1. Check error rate -- is it elevated?
2. Check latency percentiles -- has P99 spiked?
3. Check resource utilization -- CPU, memory near limits?
4. Check saturation -- throttling, disk I/O?
5. Note the exact time window of the anomaly for log queries

## Step 2: Logs (What happened?)

Use `logcli` to query Loki for qualitative context. After metrics narrow the time window and affected services, logs reveal error messages, stack traces, and behavioral details.

### Key LogQL Patterns

**Error filtering:**

```logql
# Errors in a specific namespace
{namespace="prod"} |= "error" | logfmt

# Errors from a specific service with structured parsing
{app="payments"} |= "error" | json | level="ERROR"

# Exclude noisy known errors
{app="payments"} |= "error" |~ "timeout|connection refused" != "health check"
```

**Rate calculation (log-based metrics):**

```logql
# Error rate from logs (useful when Prometheus metrics are missing)
rate({app="payments"} |= "error" [5m])

# Compare error rates across services
sum by (app)(rate({namespace="prod"} |= "error" [5m]))
```

**Pattern matching:**

```logql
# Parse structured logs
{app="payments"} | pattern "<timestamp> <level> <logger> <msg>" | level = "ERROR"

# Extract specific fields from JSON logs
{app="payments"} | json | status >= 500
```

**Volume analysis:**

```logql
# Log volume by application (sudden drop = service down)
sum by (app)(bytes_rate({namespace="prod"}[1h]))

# Log line count rate (spike = error storm)
sum by (app)(rate({namespace="prod"}[5m]))
```

### Example logcli Commands

```bash
# Query logs for errors in the last hour
logcli query --addr=http://loki:3100 \
  --since=1h --limit=100 \
  '{app="payments"} |= "error"'

# Query with output format
logcli query --addr=http://loki:3100 \
  --since=30m --output=jsonl \
  '{namespace="prod"} |= "timeout"'

# Stream logs in real-time (tail mode)
logcli query --addr=http://loki:3100 \
  --tail \
  '{app="payments"} |= "error"'

# Label values (discover available labels)
logcli labels --addr=http://loki:3100

# Series (discover available log streams)
logcli series --addr=http://loki:3100 \
  '{namespace="prod"}'
```

### Log Investigation Checklist

1. Query errors in the affected service during the metric anomaly window
2. Look for stack traces or error messages that explain the root cause
3. Check for upstream service errors (dependency failures)
4. Look for configuration change logs (deploys, config reloads)
5. Extract trace IDs from log lines for trace correlation

## Step 3: Traces (Where did it break?)

Use `curl` against the Jaeger HTTP API v3 to trace request flows across services. After logs identify the request path or specific trace IDs, traces reveal the exact span where failures or latency occur.

### Key Query Patterns

**List available services:**

```bash
# Discover all traced services
curl -s "$JAEGER_URL/api/v3/services" | jq '.services[]'
```

**Find slow or failing traces:**

```bash
# Traces slower than 1 second from the payments service
curl -s "$JAEGER_URL/api/v3/traces?query.service_name=payments&query.duration_min=1s" \
  | jq '.result.resourceSpans'

# Traces in a specific time window
curl -s "$JAEGER_URL/api/v3/traces?query.service_name=payments&query.start_time_min=$(date -u -d '1 hour ago' +%s)000000&query.start_time_max=$(date -u +%s)000000" \
  | jq '.result.resourceSpans'
```

**Get a specific trace by ID:**

```bash
# Full trace detail (from trace ID found in logs)
curl -s "$JAEGER_URL/api/v3/traces/{trace_id}" \
  | jq '.result.resourceSpans'
```

**Service dependency graph:**

```bash
# Dependencies between services (what calls what)
curl -s "$JAEGER_URL/api/v3/dependencies?end_time=$(date -u +%s)000000&lookback=3600000000" \
  | jq '.dependencies'
```

**Get operations for a service:**

```bash
# Available operations (endpoints) for a service
curl -s "$JAEGER_URL/api/v3/operations?service=payments" \
  | jq '.operations[]'
```

### Reading Trace Data

Traces consist of **spans** organized in parent-child relationships:

- **Root span**: The entry point (e.g., HTTP request from gateway)
- **Child spans**: Downstream calls (database queries, service-to-service RPCs)
- **Span duration**: Time spent in each operation
- **Span tags**: Metadata like HTTP status, error flags, component names

**What to look for:**

| Pattern | Indicates |
|---------|-----------|
| Single slow span | Bottleneck in one service/operation |
| Many slow child spans | Downstream dependency is slow |
| Missing child spans | Service call failed or timed out |
| Error tag on span | Explicit error in that service |
| Large gap between spans | Network latency or queuing |

### Trace Investigation Checklist

1. Get the trace ID from log entries or error reports
2. Retrieve the full trace and examine the span tree
3. Identify the slowest or errored span
4. Check the service and operation of the problematic span
5. Cross-reference back to that service's metrics and logs

## Step 4: Correlation

The power of observability-driven RCA comes from cross-referencing findings across all three signal types.

### Timeline Alignment

Use the **same time window** across all queries to ensure correlation:

```bash
# Define the investigation window
START="2024-01-15T10:00:00Z"
END="2024-01-15T11:00:00Z"

# Metrics: error rate during window
promtool query range --server.url=http://prometheus:9090 \
  --start="$START" --end="$END" --step=30s \
  'rate(http_requests_total{status=~"5.."}[5m])'

# Logs: errors during same window
logcli query --addr=http://loki:3100 \
  --from="$START" --to="$END" --limit=200 \
  '{namespace="prod"} |= "error"'

# Traces: slow requests during same window
curl -s "$JAEGER_URL/api/v3/traces?query.service_name=payments&query.start_time_min=${START_EPOCH}000000&query.start_time_max=${END_EPOCH}000000&query.duration_min=1s"
```

### Common Correlation Patterns

**Pattern 1: Metric anomaly to root cause**

1. Metric: error rate spike at 10:45
2. Log: `connection refused` errors from database client at 10:44
3. Trace: spans to database service show timeouts starting 10:44
4. Root cause: database failover caused brief connection loss

**Pattern 2: Latency investigation**

1. Metric: P99 latency jumped from 200ms to 2s at 14:00
2. Log: `slow query` warnings from ORM at 14:00
3. Trace: database query spans grew from 50ms to 1.5s
4. Root cause: missing index on new query path deployed at 13:55

**Pattern 3: Cascading failure**

1. Metric: multiple services show error rate increase
2. Dependency graph: service A calls B calls C
3. Trace: service C spans show errors, A and B propagate
4. Log: service C shows `out of memory` errors
5. Root cause: memory leak in service C caused cascading failures

## Troubleshooting Decision Tree

Use this to choose your starting point based on symptoms:

**High error rate?**
- Check logs for error patterns and stack traces
- Trace failing requests to identify the failing service
- Check if errors correlate with a recent deployment

**High latency?**
- Check resource metrics (CPU throttling, memory pressure)
- Trace slow requests to find the bottleneck span
- Check upstream dependencies for added latency

**Service unreachable?**
- Check the dependency graph for the service topology
- Check logs for connection errors and DNS resolution failures
- Verify the service is running with Kubernetes pod status

**Resource exhaustion?**
- Check CPU and memory metrics against limits
- Check logs for memory leak indicators (growing heap, GC pressure)
- Compare resource usage trend over hours/days

**Intermittent failures?**
- Check if errors correlate with specific pods (pod-level issue vs service-level)
- Look for patterns in timing (cron jobs, traffic spikes)
- Check for retry storms in traces (exponential backoff misconfigured)

## Safety Mode Behavior

This skill respects the configured xops.bot safety mode:

| Operation Type | Safe Mode | Standard Mode | Full Mode |
|---------------|-----------|---------------|-----------|
| Read-only queries (promtool query, logcli query, curl GET) | Allowed | Auto-execute | Auto-execute |
| Push metrics (promtool push) | Blocked | Requires approval | Executes with awareness |
| TSDB mutations (tsdb bench write, create-blocks-from) | Blocked | Requires approval + confirmation | Requires awareness |

All investigation commands in this workflow are read-only. Push and TSDB mutation operations are not part of the standard investigation workflow but are included for completeness.

## Related Skills

- **k8s-debug**: For Kubernetes-specific troubleshooting (pod states, events, resource debugging)
- **incident-analysis**: For systematic incident investigation and evidence gathering before deep RCA
- **incident-response**: For structured mitigation workflows during active incidents
- **incident-rca**: For process-level RCA methodology (timeline, hypotheses, blameless postmortem) that wraps this technical investigation
