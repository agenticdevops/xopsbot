---
sidebar_position: 2
title: Setup Wizard
---

# Setup Wizard

The setup wizard configures xops.bot on first run. It walks you through selecting a role preset, agent workspaces, communication channels, DevOps tools, a safety mode, and your LLM provider, then generates all the configuration files you need.

## First Run

The wizard launches automatically when no configuration exists at `~/.openclaw/openclaw.json`. If you already have a config file, you can re-run the wizard manually (see [Re-running the Wizard](#re-running-the-wizard) below).

```bash
bun run wizard
```

## Step 1: Welcome

The wizard opens with the xops.bot ASCII art banner followed by a welcome screen. The welcome note describes the 6 selections you will make and shows where configuration files will be saved:

- `~/.openclaw/openclaw.json` -- OpenClaw main config
- `~/.xopsbot/workspaces/` -- Agent workspace files

## Step 2: Role Preset

Choose a role preset to pre-populate your configuration, or select Custom for full manual control.

| Preset | Tools | Safety |
|--------|-------|--------|
| **DevOps Starter** | kubectl, docker, aws | Standard |
| **SRE** | kubectl, promtool, logcli, jaeger | Standard |
| **Platform Engineer** | terraform, ansible, aws, kubectl | Standard |
| **Custom** | (choose manually) | (choose manually) |

Selecting a preset pre-populates workspaces, tools, and safety mode in the following steps. You can modify any of these defaults -- presets suggest, they do not lock.

Selecting **Custom** gives the manual wizard flow where you choose everything yourself.

:::tip
If you are unsure which preset to choose, start with **DevOps Starter**. It covers the most common tools and you can install additional plugins later.
:::

For more details on what each preset includes, see [Presets](/user-guide/presets).

## Step 3: Agent Workspaces

Choose which specialized DevOps agents to enable. Use arrow keys to navigate and space to toggle. At least one workspace is required.

| Workspace | Agent | Description |
|-----------|-------|-------------|
| `k8s-agent` | K8s Bot | Kubernetes operations specialist |
| `rca-agent` | RCA Bot | Root cause analysis specialist |
| `incident-agent` | Incident Bot | Incident response specialist |
| `finops-agent` | FinOps Bot | Cost optimization specialist |
| `platform-agent` | Platform Bot | Platform engineering (IaC) |

By default, `k8s-agent` and `rca-agent` are pre-selected.

:::tip
Start with K8s Bot and RCA Bot if you are primarily doing Kubernetes operations. Add more agents as your needs grow.
:::

## Step 4: Communication Channels

Select which messaging platforms xops.bot should connect to. Channels are **optional** -- the terminal UI (TUI) works without any channels enabled.

| Channel | Description |
|---------|-------------|
| Telegram | Popular for personal bots |
| Discord | Great for team servers |
| Slack | Enterprise team communication |
| Microsoft Teams | Microsoft 365 integration |

Channel tokens are **not collected** during the wizard. After the wizard completes, you configure each channel's bot token as an environment variable. The generated config includes placeholder values (e.g., `<TELEGRAM_BOT_TOKEN>`) to remind you which tokens to set.

## Step 5: DevOps Tools

Select the DevOps tools you will use with xops.bot. At least one tool is required. `kubectl` is pre-selected by default.

| Tool | Description |
|------|-------------|
| kubectl | Kubernetes CLI |
| Docker | Container management |
| AWS CLI | Amazon Web Services |
| Terraform | Infrastructure as Code |
| Ansible | Configuration management |
| Promtool | Prometheus metrics queries |
| LogCLI | Loki log analysis |
| Jaeger | Distributed tracing |

The generated config includes sensible environment variable defaults for each tool:

| Tool | Environment Variables |
|------|----------------------|
| kubectl | `KUBECONFIG=~/.kube/config` |
| Docker | `DOCKER_HOST=unix:///var/run/docker.sock` |
| AWS CLI | `AWS_PROFILE=default`, `AWS_REGION=us-east-1` |
| Terraform | `TF_WORKSPACE=default` |
| Ansible | `ANSIBLE_CONFIG=~/.ansible.cfg` |

## Step 6: Safety Mode

Select a safety mode that controls how infrastructure mutations are handled.

| Mode | Behavior | When to Use |
|------|----------|-------------|
| **Safe** | Read-only operations only. All mutations blocked. | Monitoring and investigation |
| **Standard** (Recommended) | Mutations require explicit approval before execution. | Most environments |
| **Full** | All operations allowed without prompts. | Development only |

Standard mode is selected by default.

:::caution
Never use Full mode in staging or production environments. Standard mode ensures every mutation is reviewed before execution.
:::

## Step 7: LLM Provider

Select which LLM provider to use for agent conversations.

| Provider | Default Model | API Key Env Var |
|----------|--------------|-----------------|
| Anthropic (Claude) | `anthropic/claude-sonnet-4-5` | `ANTHROPIC_API_KEY` |
| OpenAI (ChatGPT) | `openai/gpt-4o` | `OPENAI_API_KEY` |
| Google (Gemini) | `google/gemini-2.5-pro` | `GOOGLE_API_KEY` |

Anthropic is selected by default.

The wizard **does not collect credentials**. It detects whether the corresponding API key environment variable is already set. If the key is detected, you will see a success message. If not, the wizard shows instructions for setting it:

```bash
export ANTHROPIC_API_KEY="your-key-here"
# or
openclaw login
```

## Generated Configuration

After all selections are made, the wizard automatically generates your configuration:

1. **Installs preset plugins** -- If you selected a preset, its plugins are installed before config generation
2. **Creates directories** -- `~/.xopsbot/workspaces/`, `~/.xopsbot/skills/`, `~/.openclaw/`
3. **Copies workspace templates** -- Selected agent workspaces are copied to `~/.xopsbot/workspaces/`
4. **Writes active-preset marker** -- If a preset was selected, the preset name is saved to `~/.xopsbot/active-preset`
5. **Generates OpenClaw config** -- `~/.openclaw/openclaw.json` is written with:
   - Agent list from selected workspaces
   - Channel configuration with placeholder tokens
   - Tool environment variables
   - Selected provider model as the default
   - Safety mode applied to tool deny lists

A summary is displayed showing all your selections and the files created.

### Example Generated Config Structure

```json5
{
  agents: {
    defaults: {
      model: { primary: "anthropic/claude-sonnet-4-5" },
      sandbox: { mode: "off" }
    },
    list: [
      { id: "xops-k8s", name: "K8s Agent", default: true, workspace: "~/.xopsbot/workspaces/k8s-agent", tools: { profile: "coding", deny: [] } },
      // ... more agents
    ]
  },
  channels: {
    telegram: { enabled: true, token: "<TELEGRAM_BOT_TOKEN>" }
  },
  env: {
    KUBECONFIG: "~/.kube/config"
  }
}
```

## Next Steps

After the wizard completes:

1. **Set channel tokens** (if you selected any channels):
   ```bash
   export TELEGRAM_BOT_TOKEN="your-telegram-token"
   export SLACK_BOT_TOKEN="your-slack-token"
   ```

2. **Set your API key** (if not already in environment):
   ```bash
   export ANTHROPIC_API_KEY="your-key-here"
   ```

3. **Start OpenClaw**:
   ```bash
   openclaw
   ```

Your agents will be available based on the workspaces you selected.

## Re-running the Wizard

You can re-run the wizard at any time to change your configuration:

```bash
bun run wizard
```

Alternatively, delete the config file to trigger first-run detection:

```bash
rm ~/.openclaw/openclaw.json
```

Existing workspace files and configuration will be overwritten with the new selections.

## Cancellation

Press `Ctrl+C` at any step to cancel the wizard. No files will be created or modified.
