# Agent Operating Instructions

## IaC Workflow

Follow this standard workflow for infrastructure changes:

### 1. Plan (Understand the Change)

```
Before any change:
- What is the current state?
- What is the desired state?
- What resources will be affected?
- What is the rollback strategy?
```

**Initial assessment:**
```bash
# Check current state
terraform show

# Validate configuration
terraform validate

# Create and review plan
terraform plan -out=change.tfplan
```

### 2. Review (Validate the Plan)

Analyze terraform plan output carefully:

| Symbol | Meaning | Risk Level |
|--------|---------|------------|
| `+` | Create | Low (usually) |
| `~` | Modify in-place | Medium |
| `-/+` | Replace (destroy & create) | High |
| `-` | Destroy | High |

**Red flags in plan:**
- Unexpected destroys (especially `-/+` replaces)
- Changes to resources you didn't touch
- Destruction of stateful resources (databases, volumes)
- Changes to IAM policies or security groups

### 3. Apply (Execute the Change)

```bash
# Apply saved plan (preferred)
terraform apply change.tfplan

# Or apply with auto-approve for dev only
# terraform apply -auto-approve  # NEVER in production
```

**Post-apply verification:**
```bash
# Verify state
terraform show

# Check for drift
terraform plan  # Should show no changes
```

## Terraform State Management Best Practices

### State File Safety

```bash
# Always use remote state with locking
terraform {
  backend "s3" {
    bucket         = "terraform-state"
    key            = "env/component/terraform.tfstate"
    region         = "us-west-2"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
```

### State Operations (Use Carefully)

```bash
# List resources in state
terraform state list

# Show specific resource
terraform state show aws_instance.example

# Move resource (refactoring)
terraform state mv aws_instance.old aws_instance.new

# Remove from state (without destroying)
terraform state rm aws_instance.orphan

# Import existing resource
terraform import aws_instance.example i-1234567890abcdef0
```

### State Recovery

```bash
# Pull remote state locally
terraform state pull > backup.tfstate

# Push local state to remote (dangerous!)
# terraform state push backup.tfstate  # ONLY for recovery
```

## Module Development Guidelines

### Module Structure

```
modules/
  example-module/
    main.tf         # Primary resources
    variables.tf    # Input variables
    outputs.tf      # Output values
    versions.tf     # Provider requirements
    README.md       # Usage documentation
```

### Module Best Practices

1. **Version everything:** Pin module versions in source
2. **Document inputs/outputs:** Clear variable descriptions
3. **Sensible defaults:** Provide defaults where reasonable
4. **Validate inputs:** Use validation blocks
5. **Output useful data:** IDs, ARNs, endpoints

### Example Module Call

```hcl
module "vpc" {
  source  = "git::https://github.com/org/modules.git//vpc?ref=v1.2.3"

  name               = "production"
  cidr               = "10.0.0.0/16"
  availability_zones = ["us-west-2a", "us-west-2b", "us-west-2c"]

  tags = {
    Environment = "production"
    ManagedBy   = "terraform"
  }
}
```

## Drift Detection and Remediation

### Detecting Drift

```bash
# Plan will show drift
terraform plan

# Detailed refresh (read-only)
terraform refresh  # Updates state from infrastructure

# Compare state to config
terraform plan -detailed-exitcode
# Exit 0 = no changes
# Exit 1 = error
# Exit 2 = changes detected
```

### Remediating Drift

| Drift Type | Resolution |
|------------|------------|
| Manual change to match desired | `terraform apply` to restore |
| Intentional manual change | Update code to match, or `terraform import` |
| Resource deleted externally | `terraform state rm` then `terraform apply` |
| Attribute drift | Review and apply, or update code |

## Environment Promotion

### Standard Flow

```
dev -> staging -> production
```

### Promotion Checklist

- [ ] Changes tested in dev
- [ ] Plan reviewed in staging
- [ ] Applied successfully in staging
- [ ] Verification tests passed in staging
- [ ] Change request approved for production
- [ ] Plan reviewed in production
- [ ] Applied with monitoring
- [ ] Post-deployment verification

### Environment-Specific Configurations

```hcl
# Use workspaces or separate variable files
terraform workspace select production
terraform apply -var-file=production.tfvars
```

## When to Refactor vs Extend

### Extend (Add New Resources)

- New capability needed
- Existing resources unchanged
- No state manipulation required

### Refactor (Modify Structure)

- Code becoming unwieldy
- Repeated patterns that should be modules
- Logical grouping needs improvement

**Refactoring considerations:**
- State moves required
- Team coordination needed
- Plan for zero-downtime if production
- Document migration steps

## Workspace Management

### Workspace Commands

```bash
# List workspaces
terraform workspace list

# Create new workspace
terraform workspace new staging

# Select workspace
terraform workspace select production

# Show current workspace
terraform workspace show
```

### Workspace vs Separate State Files

| Approach | Use When |
|----------|----------|
| Workspaces | Same config, different instances (dev/staging/prod) |
| Separate state | Different configs, separate lifecycle |
