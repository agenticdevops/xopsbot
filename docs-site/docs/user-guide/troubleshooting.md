---
sidebar_position: 11
title: Troubleshooting
description: Common issues, solutions, and frequently asked questions
---

# Troubleshooting

Common issues and solutions for xops.bot, plus frequently asked questions.

## Common Issues

### OpenClaw not finding configuration

**Symptom:** OpenClaw starts but no agents are available, or it shows a default configuration.

**Cause:** The config file at `~/.openclaw/openclaw.json` is missing or not generated correctly.

**Solution:**

1. Verify the config file exists:
   ```bash
   ls -la ~/.openclaw/openclaw.json
   ```

2. If missing, run the setup wizard:
   ```bash
   bun run setup
   ```

3. If the file exists but seems wrong, re-run the wizard to regenerate it:
   ```bash
   rm ~/.openclaw/openclaw.json
   bun run setup
   ```

---

### Agent not responding to messages

**Symptom:** You send a message but the agent does not reply or says it does not understand the domain.

**Cause:** The agent's workspace is not in the active profile's `active_workspaces` list, or the workspace files were not copied.

**Solution:**

1. Check which workspaces are active:
   ```bash
   cat ~/.xopsbot/profiles/dev/profile.json | jq '.active_workspaces'
   ```

2. Verify workspace files exist:
   ```bash
   ls ~/.xopsbot/workspaces/
   ```

3. If workspaces are missing, re-run the wizard and select the workspaces you need.

---

### Tool command blocked unexpectedly

**Symptom:** The agent says a command is blocked or not permitted, even though you expect it to work.

**Cause:** Your safety mode may be too restrictive, or the tool's binary is not in exec-approvals.

**Solution:**

1. Check your current safety mode:
   ```bash
   cat ~/.xopsbot/profiles/dev/profile.json | jq '.safety.mode'
   ```

2. If you are in `safe` mode, switch to `standard`:
   ```bash
   bun run xopsbot/cli/safety-switch.ts standard
   ```

3. Check that the tool's plugin is installed and enabled:
   ```bash
   bun run xopsbot/cli/plugin.ts list
   ```

4. If the plugin is disabled, enable it:
   ```bash
   bun run xopsbot/cli/plugin.ts enable kubernetes
   ```

5. Verify exec-approvals includes the tool:
   ```bash
   cat ~/.openclaw/exec-approvals.json | jq '.tools'
   ```

---

### API key not detected during wizard

**Symptom:** The wizard says your API key is not found, even though you set it.

**Cause:** The environment variable is not set in the current shell session, or the variable name is wrong.

**Solution:**

1. Verify the variable is set in your current shell:
   ```bash
   echo $ANTHROPIC_API_KEY
   # or
   echo $OPENAI_API_KEY
   # or
   echo $GOOGLE_API_KEY
   ```

2. If empty, set it:
   ```bash
   export ANTHROPIC_API_KEY="your-key-here"
   ```

3. To persist across sessions, add the export to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.)

4. Re-run the wizard after setting the variable.

---

### Plugin install fails

**Symptom:** Running `bun run xopsbot/cli/plugin.ts install <name>` prints an error.

**Cause:** The plugin name is misspelled, or required binary is not on PATH.

**Solution:**

1. Check available plugin names:
   ```bash
   bun run xopsbot/cli/plugin.ts list
   ```
   Valid names: `kubernetes`, `docker`, `aws`, `terraform`, `observability`

2. Verify the required binary is installed:
   ```bash
   which kubectl    # for kubernetes plugin
   which docker     # for docker plugin
   which aws        # for aws plugin
   which terraform  # for terraform plugin
   which promtool   # for observability plugin
   ```

3. If the binary is missing, install it first. The plugin will still install without the binary, but tool commands will fail at runtime.

---

### Channel not connecting

**Symptom:** You configured a channel (Slack, Telegram, etc.) in the wizard but it does not work.

**Cause:** Channel bot tokens are not collected during the wizard. You need to set them as environment variables.

**Solution:**

1. Check the generated config for placeholder tokens:
   ```bash
   cat ~/.openclaw/openclaw.json | jq '.channels'
   ```

2. Set the appropriate environment variable:
   ```bash
   export TELEGRAM_BOT_TOKEN="your-telegram-token"
   export SLACK_BOT_TOKEN="your-slack-token"
   export DISCORD_BOT_TOKEN="your-discord-token"
   export TEAMS_BOT_TOKEN="your-teams-token"
   ```

3. Restart OpenClaw after setting the tokens.

---

### Safety mode changes not taking effect

**Symptom:** You switched safety mode but the agent still behaves as if the old mode is active.

**Cause:** OpenClaw needs to be restarted to pick up `openclaw.json` changes.

**Solution:**

1. After switching modes, restart the OpenClaw gateway:
   ```bash
   # Stop the running instance (Ctrl+C)
   # Restart
   openclaw
   ```

2. Changes to `exec-approvals.json` take effect immediately without a restart. But `openclaw.json` changes (like deny lists) require a restart.

---

## Frequently Asked Questions

### Can I use xops.bot without OpenClaw?

No. xops.bot is a configuration layer for OpenClaw, not a standalone application. OpenClaw provides the runtime -- provider authentication, conversation management, TUI, channels, and the skill system. xops.bot adds the DevOps domain layer on top.

### Which LLM provider should I use?

All three providers (Claude, ChatGPT, Gemini) work with xops.bot. Claude (Anthropic) is selected as the default because it handles tool use and structured workflows well. Choose the provider you already have a subscription for.

### Can I use different safety modes for different environments?

Yes. Each [profile](/user-guide/profiles) has its own safety mode. The default profiles are:
- **Development** -- Full mode (all operations allowed)
- **Staging** -- Standard mode (mutations require approval)
- **Production** -- Standard mode (mutations require approval)

Switch profiles by updating the `~/.xopsbot/active-profile` marker file.

### How do I add a custom skill?

See the [Adding Skills](/developer-guide/adding-skills) developer guide. In short: create a Markdown file with YAML frontmatter (name, description, required tools) and place it in the appropriate workspace's `skills/` directory.

### Can I create my own preset?

Yes. See the [Adding Presets](/developer-guide/adding-presets) developer guide. A preset is a TypeScript data object that declares which plugins, workspaces, tools, and safety mode to use.

### How do I update xops.bot?

Pull the latest changes and reinstall dependencies:

```bash
cd xopsbot
git pull
bun install
```

If the update includes new workspace templates or schema changes, re-run the wizard to regenerate your configuration.

### What happens if I run a dangerous command in Full mode?

In Full mode, all commands execute without approval prompts. The agent notes the risk level in its response (e.g., "This is a CRITICAL operation") but does not block execution. Full mode should only be used in trusted development environments.

### Can multiple agents collaborate on a task?

OpenClaw supports subagent coordination. For example, Incident Bot can hand off to RCA Bot for post-incident analysis. Each agent operates within its own workspace and tool permissions, so the handoff is safe -- RCA Bot cannot accidentally run Incident Bot's mitigation commands.

### Where are logs stored?

OpenClaw writes audit logs in JSONL format to `/tmp/openclaw/openclaw-YYYY-MM-DD.log`. Logging verbosity depends on your profile's audit setting:
- **Enabled** (stage/prod): `info` level -- records all operations
- **Disabled** (dev): `warn` level -- only warnings and errors

### How do I completely reset xops.bot?

Remove the configuration directories and re-run setup:

```bash
rm -rf ~/.xopsbot ~/.openclaw
bun run setup
```

This removes all profiles, workspaces, plugins, and configuration files. You will start fresh with the setup wizard.
