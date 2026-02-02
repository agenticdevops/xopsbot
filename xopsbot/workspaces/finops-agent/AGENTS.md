# Agent Operating Instructions

## Cost Analysis Workflow

Follow this systematic approach for cost optimization:

### 1. Inventory (What do we have?)

```
Build a complete picture:
- What resources exist?
- What are their configurations?
- What are their stated purposes?
- When were they created?
```

**Inventory commands:**
```bash
# AWS resources
aws resourcegroupstaggingapi get-resources --output table

# EC2 instances
aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,InstanceType,State.Name,Tags[?Key==`Name`].Value|[0]]' --output table

# EKS clusters
aws eks list-clusters
aws eks describe-cluster --name <cluster>
```

### 2. Usage (How much is used?)

```
Gather utilization metrics:
- CPU, memory, storage usage
- Network throughput
- Request counts
- Access patterns
```

**Usage analysis:**
```bash
# CloudWatch metrics for EC2
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=<instance-id> \
  --start-time $(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%SZ) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --period 3600 \
  --statistics Average Maximum
```

### 3. Waste (What's not needed?)

```
Identify optimization opportunities:
- Unused resources (0 connections, 0 requests)
- Oversized resources (low utilization)
- Redundant resources (duplicates)
- Orphaned resources (no dependencies)
```

**Waste detection patterns:**
| Resource Type | Waste Indicator | Threshold |
|---------------|-----------------|-----------|
| EC2 Instance | CPU < 5% avg | 7 days |
| EBS Volume | No attachments | 30 days |
| Elastic IP | Not associated | Any |
| Load Balancer | 0 requests | 7 days |
| RDS Instance | 0 connections | 7 days |
| NAT Gateway | 0 bytes processed | 7 days |

### 4. Recommendations (What should change?)

Present findings with actionable recommendations:

```markdown
## Recommendation: [Title]

**Current State:**
[Resource/configuration details]

**Proposed Change:**
[Specific action to take]

**Savings Impact:**
- Monthly savings: $X
- Annual savings: $Y
- Percentage reduction: Z%

**Risk Assessment:**
- Performance impact: None/Low/Medium
- Availability impact: None/Low/Medium
- Reversibility: Easy/Moderate/Difficult

**Implementation:**
[Steps or commands to execute]
```

## Identifying Unused Resources

### EC2 Instances

```bash
# Low CPU instances (candidates for downsizing/termination)
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --group-by Type=DIMENSION,Key=INSTANCE_TYPE
```

### EBS Volumes

```bash
# Unattached volumes
aws ec2 describe-volumes \
  --filters Name=status,Values=available \
  --query 'Volumes[*].[VolumeId,Size,CreateTime]' \
  --output table
```

### Elastic IPs

```bash
# Unused Elastic IPs
aws ec2 describe-addresses \
  --query 'Addresses[?AssociationId==`null`].[PublicIp,AllocationId]' \
  --output table
```

### Load Balancers

```bash
# Check for ALBs with no targets
aws elbv2 describe-target-groups \
  --query 'TargetGroups[*].[TargetGroupArn,TargetType]' \
  --output table
```

## Reserved Instance vs On-Demand Analysis

### When to Recommend RIs

| Workload Pattern | Recommendation |
|------------------|----------------|
| Steady 24/7 usage | 1-year or 3-year RI |
| Predictable business hours | Scheduled scaling + Savings Plans |
| Variable/spiky | On-demand or Spot |
| New/experimental | On-demand until stable |

### Coverage Analysis

```bash
# RI utilization
aws ce get-reservation-utilization \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY
```

## Cost Allocation and Tagging

### Required Tags

Recommend these minimum tags for cost allocation:

| Tag Key | Purpose | Example |
|---------|---------|---------|
| `Environment` | Cost by environment | dev, staging, prod |
| `Team` | Cost by team | platform, backend, data |
| `Service` | Cost by service | api, web, worker |
| `CostCenter` | Financial allocation | CC-1234 |
| `Owner` | Accountability | email@company.com |

### Tag Compliance Check

```bash
# Find untagged resources
aws resourcegroupstaggingapi get-resources \
  --tags-per-page 100 \
  --query 'ResourceTagMappingList[?length(Tags)==`0`].ResourceARN'
```

## Reporting Format

### Executive Summary

```
MONTHLY COST REPORT - [Month Year]
==================================

Total Spend: $XX,XXX
vs Last Month: +/-$X,XXX (X%)
vs Budget: +/-$X,XXX (X%)

Top 3 Cost Drivers:
1. [Service] - $X,XXX (X%)
2. [Service] - $X,XXX (X%)
3. [Service] - $X,XXX (X%)

Identified Savings: $X,XXX/month
Quick Wins: [count] opportunities
```

### Detailed Analysis

For each significant finding, include:
- What: Resource/service/pattern identified
- Why: Root cause of cost
- Impact: Dollar amount and percentage
- Action: Specific recommendation
- Owner: Who should implement

## Change Approval Workflow

### Low Risk (Execute with Notification)

- Delete unattached EBS volumes (with snapshot backup)
- Release unused Elastic IPs
- Remove empty security groups

### Medium Risk (Require Team Approval)

- Rightsize EC2 instances
- Modify RDS configurations
- Change instance families

### High Risk (Require Leadership Approval)

- Terminate EC2 instances
- Purchase reserved instances
- Commit to savings plans
- Delete RDS instances
