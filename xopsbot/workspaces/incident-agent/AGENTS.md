# Agent Operating Instructions

## Triage Workflow

When an incident is reported, follow this sequence:

### 1. Assess Impact (First 2 minutes)

```
Questions to answer:
- What's affected? (service, region, users)
- How severe? (SEV-1/2/3/4)
- Is it getting worse?
- What changed recently?
```

**Quick assessment commands:**
```bash
# Check cluster state
kubectl get pods -A | grep -v Running

# Check recent deployments
kubectl get events --sort-by='.lastTimestamp' -A | tail -20

# Check service health
kubectl get endpoints -A | grep "<none>"
```

### 2. Stabilize (Next 5-10 minutes)

- **Stop the bleeding:** Isolate affected components
- **Rollback if safe:** Use known-good state if available
- **Scale if needed:** Add capacity to healthy components

**Rollback pattern:**
```bash
# Check rollout history
kubectl rollout history deployment/<name> -n <namespace>

# Rollback to previous version
kubectl rollout undo deployment/<name> -n <namespace>

# Verify rollback
kubectl rollout status deployment/<name> -n <namespace>
```

### 3. Mitigate (Ongoing)

- Implement temporary fixes
- Route traffic away from affected components
- Maintain service degradation over complete outage

### 4. Communicate (Throughout)

- Post initial status within 5 minutes
- Update every 15 minutes minimum
- Notify stakeholders of severity changes

## Escalation Criteria

Escalate immediately when:

| Trigger | Action |
|---------|--------|
| SEV-1 (service down) | Page on-call, notify leadership |
| Data integrity risk | Page data team, pause writes |
| Security concern | Page security team |
| Blast radius growing | Request additional responders |
| Stuck > 30 minutes | Request senior help |

## Handoff Protocol

When stabilized and entering investigation:

1. **Document current state:**
   - What was the impact?
   - What actions were taken?
   - What is the current status?

2. **Transfer to RCA Agent:**
   - Provide timeline of events
   - Share all executed commands
   - Note any hypotheses formed

3. **Clear ownership:**
   - Explicitly state handoff
   - Confirm RCA Agent accepts

## Rollback Decision Framework

```
Should I rollback?

1. Is there a known-good version?
   NO  -> Cannot rollback, continue mitigation
   YES -> Continue

2. Is the issue definitely from the recent change?
   NO  -> Rollback unlikely to help
   YES -> Continue

3. Is rollback safe (data compatible, no state issues)?
   NO  -> Evaluate risk vs benefit
   YES -> Proceed with rollback

4. Will rollback restore service?
   UNCERTAIN -> Rollback anyway if low risk
   YES       -> Proceed immediately
```

## Communication Templates

### Initial Alert

```
INCIDENT DECLARED - [SEV-X]
Time: [HH:MM UTC]
Reporter: [name/source]
Initial symptom: [brief description]
Investigating: [your name]
Channel: [where to follow]
```

### Stakeholder Update

```
INCIDENT UPDATE - [SEV-X] - [HH:MM UTC]
Status: [Investigating|Mitigating|Monitoring|Resolved]
Impact: [Current user/service impact]
Actions taken: [What we did]
Next steps: [What we're doing now]
ETA for next update: [time]
```

### Resolution

```
INCIDENT RESOLVED - [HH:MM UTC]
Duration: [X hours Y minutes]
Impact summary: [What was affected]
Resolution: [What fixed it]
Follow-up: [RCA scheduled, ticket number]
```

## Severity Definitions

| Severity | Impact | Response Time |
|----------|--------|---------------|
| SEV-1 | Service down, all users affected | Immediate, all hands |
| SEV-2 | Major feature broken, significant users | 15 minutes, primary on-call |
| SEV-3 | Minor feature broken, some users | 1 hour, normal priority |
| SEV-4 | Cosmetic/minor, workaround exists | Next business day |
