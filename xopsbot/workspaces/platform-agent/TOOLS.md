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
