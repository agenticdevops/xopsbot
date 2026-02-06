# Tools

<!-- GENERATED: Safety annotations from tool definitions -->

## Risk Classification Summary

| Risk Level | Behavior |
|------------|----------|
| LOW | Auto-execute without prompting |
| MEDIUM | Execute with awareness notification |
| HIGH | Require explicit approval before execution |
| CRITICAL | Require approval with confirmation prompt |

## aws

AWS Command Line Interface

### Read-Only Operations (LOW risk)

| Command | Risk | Description |
|---------|------|-------------|
| `aws describe` | LOW | Describe AWS resources (generic prefix) |
| `aws get` | LOW | Get AWS resource details (generic prefix) |
| `aws list` | LOW | List AWS resources (generic prefix) |
| `aws help` | LOW | Display help information for a service or command |
| `aws configure list` | LOW | List current AWS CLI configuration values |
| `aws sts get-caller-identity` | LOW | Return details about the IAM user or role making the call |
| `aws s3 ls` | LOW | List S3 buckets or objects in a bucket |

### Mutations (HIGH risk)

| Command | Risk | Description |
|---------|------|-------------|
| `aws s3 cp` | HIGH | Copy files to/from S3 |
| `aws s3 sync` | HIGH | Sync directories with S3 |
| `aws s3 mv` | HIGH | Move files to/from S3 |
| `aws ec2 run-instances` | HIGH | Launch new EC2 instances |
| `aws ec2 start-instances` | HIGH | Start stopped EC2 instances |
| `aws ec2 stop-instances` | HIGH | Stop running EC2 instances |
| `aws ec2 reboot-instances` | HIGH | Reboot EC2 instances |
| `aws ec2 modify` | HIGH | Modify EC2 resource attributes |
| `aws ec2 create` | HIGH | Create EC2 resources (security groups, key pairs, etc.) |
| `aws iam create` | HIGH | Create IAM resources (users, roles, policies) |
| `aws iam attach` | HIGH | Attach IAM policies to users, groups, or roles |
| `aws iam detach` | HIGH | Detach IAM policies from users, groups, or roles |
| `aws iam put` | HIGH | Put inline IAM policies |
| `aws rds create` | HIGH | Create RDS database instances or clusters |
| `aws rds modify` | HIGH | Modify RDS database instances or clusters |
| `aws rds reboot` | HIGH | Reboot RDS database instances |
| `aws lambda create` | HIGH | Create Lambda functions |
| `aws lambda update` | HIGH | Update Lambda function code or configuration |
| `aws lambda invoke` | HIGH | Invoke a Lambda function |
| `aws cloudformation create-stack` | HIGH | Create a CloudFormation stack |
| `aws cloudformation update-stack` | HIGH | Update an existing CloudFormation stack |

### Destructive Operations (CRITICAL risk)

| Command | Risk | Description |
|---------|------|-------------|
| `aws s3 rm` | CRITICAL | Delete S3 objects |
| `aws s3 rb` | CRITICAL | Remove an S3 bucket |
| `aws ec2 terminate-instances` | CRITICAL | Terminate EC2 instances (permanently destroys them) |
| `aws ec2 delete` | CRITICAL | Delete EC2 resources (security groups, snapshots, etc.) |
| `aws iam delete` | CRITICAL | Delete IAM resources (users, roles, policies) |
| `aws rds delete` | CRITICAL | Delete RDS database instances or clusters |
| `aws lambda delete` | CRITICAL | Delete Lambda functions |
| `aws cloudformation delete-stack` | CRITICAL | Delete a CloudFormation stack and its resources |

<!-- END GENERATED -->

# Tool Usage Guidelines

## AWS Cost Explorer Queries

### Basic Cost Breakdown

```bash
# Monthly cost by service
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-02-01 \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE

# Daily cost trend
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity DAILY \
  --metrics "UnblendedCost"
```

### Cost by Tag

```bash
# Cost by environment tag
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-02-01 \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --group-by Type=TAG,Key=Environment

# Cost by team
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-02-01 \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --group-by Type=TAG,Key=Team
```

### Anomaly Detection

```bash
# Get cost anomalies
aws ce get-anomalies \
  --date-interval Start=2024-01-01,End=2024-01-31 \
  --anomaly-detection-type SERVICE_COST
```

## Resource Utilization Checks

### EC2 CPU Utilization

```bash
# Average CPU over last 7 days
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=<instance-id> \
  --start-time $(date -u -v-7d +%Y-%m-%dT%H:%M:%SZ) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --period 86400 \
  --statistics Average Maximum
```

### RDS Utilization

```bash
# Database connections
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name DatabaseConnections \
  --dimensions Name=DBInstanceIdentifier,Value=<db-instance> \
  --start-time $(date -u -v-7d +%Y-%m-%dT%H:%M:%SZ) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --period 3600 \
  --statistics Average Maximum
```

### EBS Volume IOPS

```bash
# Volume read/write operations
aws cloudwatch get-metric-statistics \
  --namespace AWS/EBS \
  --metric-name VolumeReadOps \
  --dimensions Name=VolumeId,Value=<volume-id> \
  --start-time $(date -u -v-7d +%Y-%m-%dT%H:%M:%SZ) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --period 3600 \
  --statistics Sum
```

## Tag Compliance Audits

### Find Untagged Resources

```bash
# All untagged resources
aws resourcegroupstaggingapi get-resources \
  --query 'ResourceTagMappingList[?length(Tags)==`0`].[ResourceARN]' \
  --output text

# Resources missing specific tag
aws resourcegroupstaggingapi get-resources \
  --tag-filters Key=Environment \
  --query 'ResourceTagMappingList[].ResourceARN' \
  --output text > tagged.txt

aws resourcegroupstaggingapi get-resources \
  --query 'ResourceTagMappingList[].ResourceARN' \
  --output text > all.txt

# Compare to find missing
comm -23 <(sort all.txt) <(sort tagged.txt)
```

### Tag Compliance Report

```bash
# Count resources by tag presence
aws resourcegroupstaggingapi get-tag-values --key Environment
aws resourcegroupstaggingapi get-tag-values --key Team
aws resourcegroupstaggingapi get-tag-values --key CostCenter
```

## Savings Plan Analysis

### Current Coverage

```bash
# Savings Plans utilization
aws ce get-savings-plans-utilization \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY

# Savings Plans coverage
aws ce get-savings-plans-coverage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY
```

### Purchase Recommendations

```bash
# Savings Plan recommendations
aws ce get-savings-plans-purchase-recommendation \
  --savings-plans-type COMPUTE_SP \
  --term-in-years ONE_YEAR \
  --payment-option NO_UPFRONT \
  --lookback-period-in-days THIRTY_DAYS
```

## When to Recommend vs Execute Changes

### Recommend Only (Provide Commands, Don't Execute)

- Instance type changes
- Reserved instance purchases
- Savings plan commitments
- Resource deletion
- Any production changes

### Safe to Execute (After Confirmation)

- Generate cost reports
- Create tag compliance reports
- Run utilization queries
- Calculate savings estimates
- Export data for analysis

### Never Execute Without Explicit Approval

- Delete any resource
- Modify instance types
- Stop/terminate instances
- Make purchases or commitments

## Cost Calculation Helpers

### Estimate Monthly Cost

```bash
# EC2 on-demand pricing (use pricing API or calculator)
aws pricing get-products \
  --service-code AmazonEC2 \
  --filters "Type=TERM_MATCH,Field=instanceType,Value=m5.large" \
            "Type=TERM_MATCH,Field=operatingSystem,Value=Linux" \
            "Type=TERM_MATCH,Field=location,Value=US West (Oregon)"
```

### Calculate Rightsizing Savings

```
Current: [instance-type] @ $X/hour
Peak utilization: Y%
Recommended: [smaller-type] @ $Z/hour

Monthly hours: 730
Current monthly: $X * 730 = $A
Proposed monthly: $Z * 730 = $B
Monthly savings: $A - $B = $C
Annual savings: $C * 12 = $D
```

## Reporting Best Practices

1. **Always show comparisons:** Month-over-month, budget vs actual
2. **Lead with impact:** Dollar amounts before percentages
3. **Prioritize actionability:** Quick wins first
4. **Include confidence levels:** High/Medium/Low for estimates
5. **Provide implementation path:** Clear next steps
