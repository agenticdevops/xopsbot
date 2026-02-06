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

## terraform

HashiCorp Terraform infrastructure as code

### Read-Only Operations (LOW risk)

| Command | Risk | Description |
|---------|------|-------------|
| `terraform version` | LOW | Print Terraform version |
| `terraform validate` | LOW | Validate the configuration files |
| `terraform fmt` | LOW | Rewrite configuration files to canonical format |
| `terraform show` | LOW | Show the current state or a saved plan |
| `terraform state list` | LOW | List resources in the state |
| `terraform state show` | LOW | Show a resource in the state |
| `terraform output` | LOW | Read an output variable from the state |
| `terraform providers` | LOW | Show the providers required for this configuration |
| `terraform graph` | LOW | Generate a visual representation of the dependency graph |
| `terraform console` | LOW | Open an interactive console for Terraform interpolations |
| `terraform state pull` | LOW | Pull current state and output to stdout |
| `terraform workspace select` | LOW | Select a workspace |

### Diagnostic Operations (MEDIUM risk)

| Command | Risk | Description |
|---------|------|-------------|
| `terraform init` | MEDIUM | Initialize a Terraform working directory |
| `terraform plan` | MEDIUM | Generate and show an execution plan |
| `terraform refresh` | MEDIUM | Update the state to match real-world resources |
| `terraform workspace new` | MEDIUM | Create a new workspace |

### Mutations (HIGH risk)

| Command | Risk | Description |
|---------|------|-------------|
| `terraform import` | HIGH | Import existing infrastructure into Terraform state |
| `terraform state mv` | HIGH | Move an item in the state |
| `terraform state rm` | HIGH | Remove items from the state |
| `terraform state push` | HIGH | Update remote state from a local state file |
| `terraform taint` | HIGH | Mark a resource for recreation |
| `terraform untaint` | HIGH | Remove the taint marker from a resource |
| `terraform apply` | HIGH | Apply the changes required to reach the desired state |
| `terraform force-unlock` | HIGH | Manually unlock the state for the current configuration |

### Destructive Operations (CRITICAL risk)

| Command | Risk | Description |
|---------|------|-------------|
| `terraform destroy` | CRITICAL | Destroy all managed infrastructure |
| `terraform workspace delete` | CRITICAL | Delete an existing workspace |

## ansible

Ansible automation platform

### Read-Only Operations (LOW risk)

| Command | Risk | Description |
|---------|------|-------------|
| `ansible ansible --version` | LOW | Print Ansible version information |
| `ansible ansible --list-hosts` | LOW | List hosts that match a pattern |
| `ansible ansible-inventory --list` | LOW | List inventory hosts in JSON format |
| `ansible ansible-inventory --graph` | LOW | Show inventory group hierarchy as a graph |
| `ansible ansible-doc` | LOW | Show documentation for Ansible modules and plugins |
| `ansible ansible-config` | LOW | View and manage Ansible configuration |
| `ansible ansible-vault view` | LOW | View encrypted vault file contents |
| `ansible ansible-galaxy list` | LOW | List installed roles and collections |
| `ansible ansible-galaxy search` | LOW | Search Galaxy for roles |

### Diagnostic Operations (MEDIUM risk)

| Command | Risk | Description |
|---------|------|-------------|
| `ansible ansible-vault edit` | MEDIUM | Edit an encrypted vault file in place |
| `ansible ansible-vault encrypt` | MEDIUM | Encrypt a file with Ansible Vault |
| `ansible ansible-vault decrypt` | MEDIUM | Decrypt a file encrypted with Ansible Vault |
| `ansible ansible-galaxy install` | MEDIUM | Install roles or collections from Galaxy |
| `ansible ansible-galaxy remove` | MEDIUM | Remove installed roles or collections |
| `ansible ansible-playbook --check` | MEDIUM | Run playbook in check mode (dry run, no changes) |

### Mutations (HIGH risk)

| Command | Risk | Description |
|---------|------|-------------|
| `ansible ansible` | HIGH | Run ad-hoc commands on managed hosts |
| `ansible ansible-playbook` | HIGH | Run Ansible playbooks against managed hosts |
| `ansible ansible-pull` | HIGH | Pull playbooks from VCS and run them locally |

<!-- END GENERATED -->

# Tool Usage Guidelines

## Terraform Conventions

### Always Plan Before Apply

```bash
# Standard workflow
terraform init          # Initialize (first time or after backend change)
terraform validate      # Syntax check
terraform plan -out=plan.tfplan   # Create plan
terraform apply plan.tfplan       # Apply saved plan
```

### Use -out for Plans

```bash
# Save plan to file for review and exact replay
terraform plan -out=plan.tfplan

# Review plan details
terraform show plan.tfplan

# Apply exact plan
terraform apply plan.tfplan
```

### Targeting Specific Resources

```bash
# Plan for specific resource only
terraform plan -target=aws_instance.web

# Apply to specific resource (use sparingly)
terraform apply -target=aws_instance.web

# Note: Targeting can leave state inconsistent
# Always run full plan after targeted apply
```

### Variable Management

```bash
# Use variable files
terraform apply -var-file=production.tfvars

# Override specific variable
terraform apply -var="instance_type=t3.large"

# Environment variables
export TF_VAR_region=us-west-2
```

## Ansible Patterns

### Always Check First

```bash
# Dry run (check mode)
ansible-playbook site.yml --check

# Dry run with diff
ansible-playbook site.yml --check --diff

# Limit to specific hosts
ansible-playbook site.yml --check --limit=webservers
```

### Idempotent Plays

All Ansible tasks should be idempotent (safe to run multiple times):

```yaml
# Good: Idempotent
- name: Ensure nginx is installed
  apt:
    name: nginx
    state: present

# Good: Idempotent
- name: Ensure config file exists
  template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
  notify: reload nginx

# Bad: Not idempotent
- name: Append to config
  shell: echo "new line" >> /etc/app/config
```

### Progressive Deployment

```bash
# Run on one host first
ansible-playbook site.yml --limit=web01

# Then expand
ansible-playbook site.yml --limit=webservers

# Or use serial in playbook
# serial: 1  # One host at a time
```

## State File Safety

### Never Manual Edits

```bash
# NEVER do this
# vim terraform.tfstate  # NO!

# Use state commands instead
terraform state mv source target
terraform state rm resource
terraform import resource id
```

### State Backup Before Risky Operations

```bash
# Pull and backup state
terraform state pull > backup-$(date +%Y%m%d-%H%M%S).tfstate

# Keep backups versioned
# Remote backends (S3, GCS) handle versioning automatically
```

### State Locking

```bash
# Locking is automatic with supported backends
# If lock acquisition fails:
terraform force-unlock LOCK_ID  # Use carefully!

# Check who holds the lock
# Lock info is usually in the lock file/table
```

## Module Versioning Practices

### Pin Versions Explicitly

```hcl
# Good: Pinned version
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.1.2"  # Exact version
}

# Good: Git ref
module "vpc" {
  source = "git::https://github.com/org/modules.git//vpc?ref=v1.2.3"
}

# Bad: Unpinned
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  # No version = latest = unpredictable
}
```

### Upgrade Carefully

```bash
# Check for available updates
terraform init -upgrade

# Review changes in upgrade
terraform plan  # Check for unexpected changes
```

## Secret Management

### Never Commit Secrets

```bash
# .gitignore essentials
*.tfvars           # May contain secrets
*.tfstate          # Contains sensitive data
*.tfstate.backup
.terraform/
```

### Secrets in Terraform

```hcl
# Good: Reference external secret
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = "prod/db/password"
}

resource "aws_db_instance" "main" {
  password = data.aws_secretsmanager_secret_version.db_password.secret_string
}

# Good: Mark sensitive
variable "db_password" {
  type      = string
  sensitive = true  # Won't show in plan/logs
}

# Bad: Hardcoded secret
resource "aws_db_instance" "main" {
  password = "hardcoded-password"  # NEVER!
}
```

### Sensitive Output Protection

```hcl
output "db_connection_string" {
  value     = "postgresql://user:${var.password}@${aws_db_instance.main.endpoint}"
  sensitive = true
}
```

## Common Operation Patterns

### Resource Import

```bash
# 1. Write the resource block first
# resource "aws_instance" "imported" { ... }

# 2. Import the existing resource
terraform import aws_instance.imported i-1234567890abcdef0

# 3. Verify with plan
terraform plan  # Should show minimal changes

# 4. Adjust config until plan is clean
```

### Resource Replacement

```bash
# Force replacement of specific resource
terraform apply -replace=aws_instance.web

# Note: This destroys and recreates
# Use for resources that can't be updated in-place
```

### Workspace Operations

```bash
# List available workspaces
terraform workspace list

# Create and switch to new workspace
terraform workspace new staging

# Switch workspace
terraform workspace select production

# Current workspace in configs
# terraform.workspace variable
```

## Safety Checklist

Before any production change:

- [ ] Plan reviewed and understood
- [ ] No unexpected destroys or replaces
- [ ] State backup taken (for risky operations)
- [ ] Change approved by team/process
- [ ] Rollback plan documented
- [ ] Monitoring in place
- [ ] Off-hours timing (if appropriate)
