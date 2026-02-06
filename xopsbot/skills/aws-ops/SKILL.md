---
name: aws-ops
description: "AWS operations, resource queries, and cloud infrastructure management using the AWS CLI. Use when managing EC2 instances, querying S3 storage, working with EKS clusters, searching CloudWatch logs, checking IAM permissions, invoking Lambda functions, managing RDS databases, or investigating AWS costs and billing."
metadata:
  {
    "openclaw":
      {
        "emoji": "cloud",
        "requires": { "bins": ["aws"] },
      },
  }
---

# AWS Operations

Common AWS CLI operations for infrastructure management.

## Setup & Authentication

### Check Current Identity

```bash
# Who am I?
aws sts get-caller-identity

# Current region
aws configure get region
```

### Switch Profile/Region

```bash
# Use specific profile
export AWS_PROFILE=production

# Or per-command
aws s3 ls --profile production

# Switch region
export AWS_DEFAULT_REGION=us-west-2
```

### List Profiles

```bash
aws configure list-profiles
```

## EC2 Instances

### List Instances

```bash
# All instances with key info
aws ec2 describe-instances \
  --query 'Reservations[].Instances[].[InstanceId,State.Name,InstanceType,PrivateIpAddress,Tags[?Key==`Name`].Value|[0]]' \
  --output table

# Running only
aws ec2 describe-instances \
  --filters "Name=instance-state-name,Values=running" \
  --query 'Reservations[].Instances[].[InstanceId,InstanceType,PrivateIpAddress,Tags[?Key==`Name`].Value|[0]]' \
  --output table

# By tag
aws ec2 describe-instances \
  --filters "Name=tag:Environment,Values=production"
```

### Instance Actions

```bash
# Start instance
aws ec2 start-instances --instance-ids i-1234567890abcdef0

# Stop instance
aws ec2 stop-instances --instance-ids i-1234567890abcdef0

# Reboot instance
aws ec2 reboot-instances --instance-ids i-1234567890abcdef0

# Get console output (for debugging)
aws ec2 get-console-output --instance-id i-1234567890abcdef0
```

### Instance Details

```bash
# Full details
aws ec2 describe-instances --instance-ids i-1234567890abcdef0

# Security groups
aws ec2 describe-instances --instance-ids i-1234567890abcdef0 \
  --query 'Reservations[].Instances[].SecurityGroups'
```

## S3 Storage

### List Buckets & Objects

```bash
# List buckets
aws s3 ls

# List objects in bucket
aws s3 ls s3://bucket-name/

# With sizes (human readable)
aws s3 ls s3://bucket-name/ --human-readable --summarize

# Recursive
aws s3 ls s3://bucket-name/ --recursive
```

### Copy Files

```bash
# Upload
aws s3 cp file.txt s3://bucket-name/

# Download
aws s3 cp s3://bucket-name/file.txt ./

# Sync directory
aws s3 sync ./local-dir s3://bucket-name/prefix/

# Sync with delete
aws s3 sync ./local-dir s3://bucket-name/prefix/ --delete
```

### Bucket Info

```bash
# Bucket location
aws s3api get-bucket-location --bucket bucket-name

# Bucket size (can be slow for large buckets)
aws s3 ls s3://bucket-name --recursive --summarize | tail -2
```

## EKS (Kubernetes)

### List Clusters

```bash
aws eks list-clusters
```

### Update Kubeconfig

```bash
# Add cluster to kubeconfig
aws eks update-kubeconfig --name cluster-name --region us-east-1

# With specific profile
aws eks update-kubeconfig --name cluster-name --profile production
```

### Cluster Info

```bash
aws eks describe-cluster --name cluster-name
```

## CloudWatch Logs

### List Log Groups

```bash
aws logs describe-log-groups \
  --query 'logGroups[].logGroupName'
```

### Tail Logs

```bash
# Tail logs (requires awslogs or use CloudWatch Insights)
aws logs tail /aws/lambda/function-name --follow

# Get recent logs
aws logs get-log-events \
  --log-group-name /aws/lambda/function-name \
  --log-stream-name 'stream-name' \
  --limit 50
```

### Search Logs (Insights)

```bash
# Start query
aws logs start-query \
  --log-group-name /aws/lambda/function-name \
  --start-time $(date -d '1 hour ago' +%s) \
  --end-time $(date +%s) \
  --query-string 'fields @timestamp, @message | filter @message like /ERROR/ | limit 20'

# Get results (use query-id from above)
aws logs get-query-results --query-id "query-id-here"
```

## IAM

### Current User/Role

```bash
aws sts get-caller-identity
```

### List Users/Roles

```bash
# Users
aws iam list-users --query 'Users[].[UserName,CreateDate]' --output table

# Roles
aws iam list-roles --query 'Roles[].[RoleName,CreateDate]' --output table
```

### Check Permissions

```bash
# Simulate policy
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::123456789:user/myuser \
  --action-names s3:GetObject \
  --resource-arns arn:aws:s3:::bucket-name/*
```

## Lambda

### List Functions

```bash
aws lambda list-functions \
  --query 'Functions[].[FunctionName,Runtime,LastModified]' \
  --output table
```

### Invoke Function

```bash
# Invoke
aws lambda invoke \
  --function-name my-function \
  --payload '{"key": "value"}' \
  response.json

# View response
cat response.json
```

### View Logs

```bash
aws logs tail /aws/lambda/my-function --follow
```

## RDS

### List Databases

```bash
aws rds describe-db-instances \
  --query 'DBInstances[].[DBInstanceIdentifier,DBInstanceStatus,Engine,DBInstanceClass]' \
  --output table
```

### Database Status

```bash
aws rds describe-db-instances \
  --db-instance-identifier my-database
```

## Cost & Billing

### Quick Cost Check

```bash
# Month-to-date costs
aws ce get-cost-and-usage \
  --time-period Start=$(date -d "$(date +%Y-%m-01)" +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --query 'ResultsByTime[].Total.BlendedCost'
```

### Cost by Service

```bash
aws ce get-cost-and-usage \
  --time-period Start=$(date -d "$(date +%Y-%m-01)" +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE \
  --query 'ResultsByTime[].Groups[].[Keys[0],Metrics.BlendedCost.Amount]' \
  --output table
```

## Troubleshooting

### Common Issues

| Issue | Check | Command |
|-------|-------|---------|
| Access Denied | IAM permissions | `aws sts get-caller-identity` |
| Resource not found | Region mismatch | `aws configure get region` |
| Rate limiting | API throttling | Add `--debug` flag |
| Credential issues | Profile/env vars | `aws configure list` |

### Debug Mode

```bash
# Verbose output
aws s3 ls --debug 2>&1 | head -50
```

## Quick Reference

```bash
# EC2: List running instances
aws ec2 describe-instances --filters "Name=instance-state-name,Values=running" --query 'Reservations[].Instances[].[InstanceId,Tags[?Key==`Name`].Value|[0]]' --output table

# S3: Bucket sizes
aws s3api list-buckets --query 'Buckets[].Name' --output text | xargs -I {} sh -c 'echo -n "{}: "; aws s3 ls s3://{} --recursive --summarize 2>/dev/null | tail -1'

# Lambda: Recent errors
aws logs tail /aws/lambda/FUNCTION --since 1h --filter-pattern "ERROR"

# Costs: This month
aws ce get-cost-and-usage --time-period Start=$(date +%Y-%m-01),End=$(date +%Y-%m-%d) --granularity MONTHLY --metrics BlendedCost
```

## Safety Mode Behavior

This skill respects the configured xops.bot safety mode:

| Operation Type | Safe Mode | Standard Mode | Full Mode |
|---------------|-----------|---------------|-----------|
| Read-only (describe, list, get, ls) | Allowed | Auto-execute | Auto-execute |
| Mutations (start, stop, create, invoke) | Blocked | Requires approval | Executes with awareness |
| Destructive (terminate, delete, sync --delete) | Blocked | Requires approval + confirmation | Requires awareness |
| Cost queries (ce get-cost-and-usage) | Allowed | Auto-execute | Auto-execute |

Always check the current safety mode before executing mutations. When in doubt, prefer read-only queries first.

## Related Skills

- **terraform-workflow**: For IaC management
- **incident-response**: For AWS-related incidents
