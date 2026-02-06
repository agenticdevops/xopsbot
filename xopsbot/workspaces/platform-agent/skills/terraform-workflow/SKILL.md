---
name: terraform-workflow
description: "Terraform infrastructure as code workflows and best practices. Use when managing infrastructure with Terraform, reviewing and applying plans, debugging state issues, importing existing resources, managing workspaces, handling state locking, or following IaC best practices for safe infrastructure changes."
metadata:
  {
    "openclaw":
      {
        "emoji": "building_construction",
        "requires": { "bins": ["terraform"] },
      },
  }
---

# Terraform Workflow

Infrastructure as Code practices with Terraform.

## Basic Workflow

### Initialize

```bash
# Initialize working directory
terraform init

# Upgrade providers
terraform init -upgrade

# Reconfigure backend
terraform init -reconfigure
```

### Plan

```bash
# Preview changes
terraform plan

# Save plan to file
terraform plan -out=tfplan

# Plan for specific target
terraform plan -target=aws_instance.example

# Plan destroy
terraform plan -destroy
```

### Apply

```bash
# Apply changes (with approval)
terraform apply

# Apply saved plan (no approval needed)
terraform apply tfplan

# Auto-approve (use with caution!)
terraform apply -auto-approve

# Apply specific target
terraform apply -target=aws_instance.example
```

### Destroy

```bash
# Plan destruction first
terraform plan -destroy

# Destroy with approval
terraform destroy

# Destroy specific resource
terraform destroy -target=aws_instance.example
```

## State Management

### View State

```bash
# List resources in state
terraform state list

# Show specific resource
terraform state show aws_instance.example

# Full state (sensitive!)
terraform show
```

### State Operations

```bash
# Move resource (rename)
terraform state mv aws_instance.old aws_instance.new

# Remove from state (resource still exists)
terraform state rm aws_instance.example

# Import existing resource
terraform import aws_instance.example i-1234567890abcdef0

# Pull remote state locally
terraform state pull > terraform.tfstate.backup
```

### State Locking

```bash
# Force unlock (use carefully!)
terraform force-unlock LOCK_ID
```

## Workspaces

```bash
# List workspaces
terraform workspace list

# Create workspace
terraform workspace new staging

# Switch workspace
terraform workspace select production

# Current workspace
terraform workspace show
```

## Validation & Formatting

```bash
# Validate configuration
terraform validate

# Format code
terraform fmt

# Format check (CI/CD)
terraform fmt -check

# Recursive format
terraform fmt -recursive
```

## Output & Variables

### View Outputs

```bash
# All outputs
terraform output

# Specific output
terraform output instance_ip

# JSON format
terraform output -json
```

### Variable Files

```bash
# Use var file
terraform plan -var-file=production.tfvars

# Override variable
terraform plan -var="instance_type=t3.large"
```

## Debugging

### Verbose Logging

```bash
# Enable debug logging
export TF_LOG=DEBUG
terraform plan

# Log to file
export TF_LOG_PATH=terraform.log
terraform plan

# Disable logging
unset TF_LOG TF_LOG_PATH
```

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| State lock | Concurrent access | `terraform force-unlock` |
| Provider error | Version mismatch | `terraform init -upgrade` |
| Resource drift | Manual changes | `terraform refresh` then plan |
| Cycle error | Circular dependency | Break dependency with `depends_on` |

### Refresh State

```bash
# Update state with real infrastructure
terraform refresh

# Or use plan with refresh
terraform plan -refresh-only
```

## Safe Practices

### Plan Review Checklist

1. **Check the summary**: How many add/change/destroy?
2. **Review destroys**: Any unexpected deletions?
3. **Check sensitive changes**: IAM, security groups, encryption
4. **Validate resource names**: Especially for stateful resources
5. **Look for force replacements**: `# forces replacement`

### Safe Apply Workflow

```bash
# 1. Always plan first
terraform plan -out=tfplan

# 2. Review plan carefully
terraform show tfplan

# 3. Apply saved plan
terraform apply tfplan

# 4. Verify changes
terraform show
```

### Prevent Accidental Destroys

```hcl
# In your terraform config
resource "aws_instance" "critical" {
  # ...

  lifecycle {
    prevent_destroy = true
  }
}
```

## Module Management

```bash
# Get modules
terraform get

# Update modules
terraform get -update

# Show module tree
terraform providers
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Terraform Plan
  run: |
    terraform init
    terraform plan -out=tfplan -no-color

- name: Terraform Apply
  if: github.ref == 'refs/heads/main'
  run: terraform apply -auto-approve tfplan
```

### Plan Output for PR

```bash
# Generate plan for PR comment
terraform plan -no-color > plan.txt 2>&1
```

## Security Scanning

```bash
# With tfsec
tfsec .

# With checkov
checkov -d .

# With trivy
trivy config .
```

## Quick Reference

```bash
# Full workflow
terraform init && terraform plan -out=tfplan && terraform apply tfplan

# Check what would be destroyed
terraform plan -destroy | grep "will be destroyed"

# List all resources
terraform state list

# Import resource
terraform import aws_instance.name i-1234567890

# Taint for recreation
terraform taint aws_instance.example
terraform untaint aws_instance.example
```

## Safety Mode Behavior

This skill respects the configured xops.bot safety mode:

| Operation Type | Safe Mode | Standard Mode | Full Mode |
|---------------|-----------|---------------|-----------|
| Read-only (plan, show, state list, validate, output) | Allowed | Auto-execute | Auto-execute |
| Mutations (apply, import, state mv, taint) | Blocked | Requires approval | Executes with awareness |
| Destructive (destroy, state rm, force-unlock) | Blocked | Requires approval + confirmation | Requires awareness |

Always check the current safety mode before executing mutations. When in doubt, prefer `terraform plan` first.

## Related Skills

- **aws-ops**: For AWS resource verification after Terraform changes
- **ansible-ops**: For configuration management after infrastructure provisioning
