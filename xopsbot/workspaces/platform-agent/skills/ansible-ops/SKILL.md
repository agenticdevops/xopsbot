---
name: ansible-ops
description: "Ansible configuration management operations, playbook execution, and server automation. Use when running Ansible playbooks, managing server configurations, performing ad-hoc commands across hosts, debugging Ansible connectivity, checking playbook changes with dry-run, managing inventory, or using Ansible roles and collections."
metadata:
  {
    "openclaw":
      {
        "emoji": "gear",
        "requires": { "bins": ["ansible", "ansible-playbook"] },
      },
  }
---

# Ansible Operations

Configuration management and infrastructure automation with Ansible.

## Pre-Run Checks

### Verify Ansible Setup

```bash
# Check Ansible version
ansible --version

# Test connectivity to all hosts
ansible all -m ping

# Test connectivity to specific group
ansible webservers -m ping
```

## Basic Workflow

### Ad-Hoc Commands

```bash
# Run command on all hosts
ansible all -m shell -a "uptime"

# Run on specific group
ansible webservers -m shell -a "df -h"

# Gather facts from hosts
ansible webservers -m setup

# Copy file to hosts
ansible webservers -m copy -a "src=app.conf dest=/etc/app/app.conf"

# Install package
ansible webservers -m apt -a "name=nginx state=present" --become
```

### Playbook Execution

```bash
# Run playbook
ansible-playbook site.yml

# With specific inventory
ansible-playbook -i inventory/production site.yml

# With extra variables
ansible-playbook site.yml -e "version=1.2.3 env=production"

# With tags
ansible-playbook site.yml --tags=deploy

# Skip tags
ansible-playbook site.yml --skip-tags=monitoring
```

### Dry Run (Check Mode)

```bash
# Check mode: preview changes without applying
ansible-playbook site.yml --check

# Check mode with diff: show what would change
ansible-playbook site.yml --check --diff

# Limit check to specific hosts
ansible-playbook site.yml --check --diff --limit=web01
```

## Inventory Management

### List Hosts

```bash
# List all hosts
ansible-inventory --list

# Graph view of inventory
ansible-inventory --graph

# Show variables for specific host
ansible-inventory --host=web01

# List hosts matching pattern
ansible all --list-hosts
ansible webservers --list-hosts
```

### Host Patterns

```bash
# All hosts
ansible all -m ping

# Specific group
ansible webservers -m ping

# Multiple groups (union)
ansible 'webservers:dbservers' -m ping

# Intersection
ansible 'webservers:&production' -m ping

# Exclude group
ansible 'all:!staging' -m ping

# Regex pattern
ansible '~web[0-9]+' -m ping
```

### Dynamic Inventory

```bash
# Use dynamic inventory script
ansible-playbook -i inventory/aws_ec2.yml site.yml

# Verify dynamic inventory
ansible-inventory -i inventory/aws_ec2.yml --graph
```

## Role and Collection Management

### Galaxy Operations

```bash
# Search for roles
ansible-galaxy search nginx

# Install role
ansible-galaxy install geerlingguy.nginx

# Install role to specific path
ansible-galaxy install geerlingguy.nginx -p roles/

# Install collection
ansible-galaxy collection install community.general

# List installed roles
ansible-galaxy list

# List installed collections
ansible-galaxy collection list
```

### Requirements File

```bash
# Install from requirements.yml
ansible-galaxy install -r requirements.yml
ansible-galaxy collection install -r requirements.yml

# Force reinstall
ansible-galaxy install -r requirements.yml --force
```

## Vault (Secret Management)

### Encrypt and Decrypt

```bash
# Encrypt existing file
ansible-vault encrypt vars/secrets.yml

# Decrypt file
ansible-vault decrypt vars/secrets.yml

# View encrypted file without decrypting
ansible-vault view vars/secrets.yml

# Edit encrypted file in-place
ansible-vault edit vars/secrets.yml

# Re-key (change vault password)
ansible-vault rekey vars/secrets.yml
```

### Using Vault in Playbooks

```bash
# Prompt for vault password
ansible-playbook site.yml --ask-vault-pass

# Use vault password file
ansible-playbook site.yml --vault-password-file=~/.vault_pass

# Use vault ID (multiple vaults)
ansible-playbook site.yml --vault-id dev@~/.vault_pass_dev
ansible-playbook site.yml --vault-id prod@prompt
```

## Debugging

### Verbose Output

```bash
# Increasing verbosity levels
ansible-playbook site.yml -v      # basic
ansible-playbook site.yml -vv     # more detail
ansible-playbook site.yml -vvv    # connection debugging
ansible-playbook site.yml -vvvv   # all debugging including plugins
```

### Syntax Check

```bash
# Validate playbook syntax without executing
ansible-playbook site.yml --syntax-check

# List tasks that would be executed
ansible-playbook site.yml --list-tasks

# List hosts that would be targeted
ansible-playbook site.yml --list-hosts

# List tags available in playbook
ansible-playbook site.yml --list-tags
```

### Common Issues

| Symptom | Check | Fix |
|---------|-------|-----|
| Connection refused | SSH config, host reachability | Verify SSH access: `ansible host -m ping` |
| Permission denied | Become/sudo configuration | Add `--become --ask-become-pass` |
| Module not found | Collection installed? | `ansible-galaxy collection install <name>` |
| Variable undefined | Variable precedence, typos | Check vars files, defaults, host_vars, group_vars |
| Vault decrypt error | Wrong vault password | Verify with `ansible-vault view` |
| Timeout on host | Network, host load | Increase timeout: `-e ansible_timeout=60` |
| Python not found | Remote Python path | Set `ansible_python_interpreter=/usr/bin/python3` |

## Safe Practices

### Progressive Deployment

```bash
# 1. Check mode on single host
ansible-playbook site.yml --check --diff --limit=web01

# 2. Apply to single host
ansible-playbook site.yml --limit=web01

# 3. Verify single host
ansible web01 -m shell -a "systemctl status myapp"

# 4. Expand to group
ansible-playbook site.yml --limit=webservers

# 5. Full run
ansible-playbook site.yml
```

### Idempotent Task Patterns

```yaml
# Good: Idempotent (safe to repeat)
- name: Ensure nginx is installed
  apt:
    name: nginx
    state: present

- name: Ensure config is deployed
  template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
  notify: reload nginx

# Bad: Not idempotent (appends every run)
- name: Append to config
  shell: echo "new line" >> /etc/app/config
```

### Backup Before Changes

```yaml
# In playbook: backup files before modifying
- name: Deploy config with backup
  template:
    src: app.conf.j2
    dest: /etc/app/app.conf
    backup: yes
```

## Quick Reference

```bash
# Test connectivity
ansible all -m ping

# Run ad-hoc command
ansible webservers -m shell -a "uptime"

# Dry run with diff
ansible-playbook site.yml --check --diff

# Run playbook on single host
ansible-playbook site.yml --limit=web01

# Run with vault password
ansible-playbook site.yml --ask-vault-pass

# Install role from Galaxy
ansible-galaxy install geerlingguy.nginx

# Encrypt secrets file
ansible-vault encrypt vars/secrets.yml

# Syntax check
ansible-playbook site.yml --syntax-check
```

## Safety Mode Behavior

This skill respects the configured xops.bot safety mode:

| Operation Type | Safe Mode | Standard Mode | Full Mode |
|---------------|-----------|---------------|-----------|
| Read-only (--check, --diff, --list-hosts, ping, setup) | Allowed | Auto-execute | Auto-execute |
| Playbook execution (ansible-playbook without --check) | Blocked | Requires approval | Executes with awareness |
| Vault operations (encrypt, decrypt, edit, rekey) | Blocked | Requires approval | Executes with awareness |
| Ad-hoc mutations (shell, command, apt, yum modules) | Blocked | Requires approval | Executes with awareness |

Always use `--check --diff` before actual execution in Standard mode.

## Related Skills

- **terraform-workflow**: For infrastructure provisioning (Terraform manages resources, Ansible configures them)
- **aws-ops**: For AWS resource verification alongside Ansible-managed infrastructure
