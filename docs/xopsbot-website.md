# xops.bot — Full Website Content

> Ready to paste into builder.io. Each section maps to a page section/block.
> Dark theme, cyan/blue accents, terminal-inspired aesthetic.

---

## META

| Property | Value |
|----------|-------|
| Domain | xops.bot |
| Tagline | DevOps agents powered by OpenClaw |
| Tone | Developer-focused product marketing. Confident, direct, technically grounded. |
| Audience | DevOps engineers, SREs, platform teams, infrastructure leads |
| Visual | Dark background (#0a0a0a), cyan accents (#06b6d4), monospace code blocks |

---

## SECTION 1: HERO

**Layout:** Full-width dark background. Large headline centered. Subheadline below. Two CTAs side by side. Terminal mockup underneath showing the wizard preset selection.

### Headline

Your infrastructure, one conversation away.

### Subheadline

DevOps agents powered by OpenClaw

### Body

Five specialized AI agents for Kubernetes, incident response, root cause analysis, cloud costs, and infrastructure-as-code. Ten skills. Eight tools. Three safety modes. All configured in under five minutes.

### Primary CTA

**Button:** Get Started
**Link:** #quickstart

### Secondary CTA

**Link:** Read the Docs
**URL:** https://opsflow-sh.github.io/xopsbot/

### Terminal Mockup

```
  ╔═══════════════════════════════════════╗
  ║            x o p s . b o t            ║
  ╚═══════════════════════════════════════╝
    DevOps agents powered by OpenClaw

  ? Choose a role preset
  > DevOps Starter     (kubectl, docker, aws | Standard safety)
    SRE                (kubectl, promtool, logcli, jaeger | Standard safety)
    Platform Engineer  (terraform, ansible, aws, kubectl | Standard safety)
    Custom             (Choose everything manually)
```

---

## SECTION 2: WHAT IS XOPS.BOT

**Layout:** Two columns. Left: text. Right: architecture diagram or layered visual.

### Heading

A DevOps brain for your infrastructure.

### Body

xops.bot is a configuration layer for OpenClaw that turns a general-purpose AI agent into a DevOps specialist. It adds domain expertise, safety guardrails, and operational workflows -- so you can talk to your infrastructure the way you think about it.

You ask. The agent investigates, plans, and executes -- with your approval on every mutation.

### Key Points (icon list or badges)

- **Not a chatbot.** Specialized agents with real DevOps knowledge.
- **Not autonomous.** You approve every mutation before it runs.
- **Not locked in.** Works with Claude, ChatGPT, or Gemini via OpenClaw.
- **Not monolithic.** Install only the plugins you need.

### Architecture Visual (text representation)

```
┌─────────────────────────────────────────┐
│              Your Terminal               │
├─────────────────────────────────────────┤
│           OpenClaw (Runtime)             │
│   Provider Auth · TUI · Channels · AI   │
├─────────────────────────────────────────┤
│           xops.bot (DevOps Layer)        │
│  Agents · Skills · Safety · Plugins      │
├─────────────────────────────────────────┤
│         Your Infrastructure              │
│  Kubernetes · AWS · Terraform · Docker   │
└─────────────────────────────────────────┘
```

---

## SECTION 3: AGENTS

**Layout:** Section heading + intro, then 5 cards in a responsive grid (3+2 or stacked on mobile). Dark cards with subtle cyan border on hover. Each card has emoji, name, one-liner, and 3 capability bullets.

### Heading

Five agents. Five domains. One platform.

### Intro

Each agent is a specialist with its own personality, knowledge, and safety constraints tuned to its domain. They don't guess -- they follow structured workflows built from real operational experience.

### K8s Bot

**Icon:** :wheel_of_dharma:
**One-liner:** Your hands-on Kubernetes companion.

- Diagnose pod failures, CrashLoopBackOff, OOMKilled, and scheduling issues
- Deploy with dry-run validation, rollout monitoring, and instant rollback
- Debug systematically: describe, logs, exec -- in that order, every time

**Tools:** kubectl
**Skills:** k8s-deploy, k8s-debug

### RCA Bot

**Icon:** :mag:
**One-liner:** Finds what others miss.

- Correlate metrics, logs, and traces across Prometheus, Loki, and Jaeger
- Build incident timelines from multiple data sources
- Produce structured root cause analysis with evidence and hypotheses

**Tools:** promtool, logcli, jaeger
**Skills:** observability-rca, incident-rca

### Incident Bot

**Icon:** :rotating_light:
**One-liner:** The calm voice when systems are on fire.

- Triage alerts, classify severity, and assess blast radius
- Coordinate mitigation: stabilize first, investigate after
- Hand off to RCA Bot with structured context for post-incident analysis

**Tools:** kubectl
**Skills:** incident-analysis, incident-response

### FinOps Bot

**Icon:** :chart_with_downwards_trend:
**One-liner:** Your cloud cost conscience.

- Surface idle resources, oversized instances, and underused reservations
- Quantify savings in dollars -- not abstractions
- Recommend right-sizing without sacrificing reliability

**Tools:** aws
**Skills:** aws-ops

### Platform Bot

**Icon:** :building_construction:
**One-liner:** The builder behind your infrastructure.

- Manage Terraform workflows with safe init → plan → review → apply
- Run Ansible playbooks with dry-run checks and vault management
- Ensure changes are reproducible, auditable, and drift-free

**Tools:** terraform, ansible, aws
**Skills:** terraform-workflow, ansible-ops, aws-ops

---

## SECTION 4: SAFETY

**Layout:** Section heading + intro paragraph. Three columns for the three modes. Standard column visually emphasized with a "Default" badge.

### Heading

Built for trust. Configured for your comfort.

### Intro

Every command xops.bot executes has a risk classification. Your safety mode decides what runs automatically, what needs your approval, and what gets blocked entirely. Standard mode ships as the default because your production cluster is not a playground.

### Safe Mode

**Badge:** Read-Only
**Icon:** Shield

Agents observe but never touch. They query cluster state, read logs, analyze metrics, and generate reports. All mutations are blocked. Even read commands prompt for confirmation.

**Best for:** Production monitoring, on-call investigation, onboarding new team members.

### Standard Mode

**Badge:** Default (recommended)
**Icon:** Checkmark

Read-only commands run freely. Mutations require your explicit approval before execution. You see exactly what will run, confirm it, and watch it execute. Critical operations ask twice.

**Best for:** Daily operations, most environments, most teams.

### Full Mode

**Badge:** Trusted
**Icon:** Lightning bolt

All operations execute without prompts. The agent notes risk levels but does not block. Only for trusted development environments with well-understood blast radius.

**Best for:** Local dev environments, sandbox clusters.

### Risk Classification Table

| Risk | Meaning | Standard Mode |
|------|---------|--------------|
| **LOW** | Read-only, no side effects | Auto-execute |
| **MEDIUM** | Diagnostic, local operations | Auto-execute |
| **HIGH** | Mutations that modify state | Requires approval |
| **CRITICAL** | Destructive, hard to undo | Requires approval + confirmation |

### Example Callout

> **Standard mode in action:** You ask K8s Bot to scale a deployment. It prepares `kubectl scale deployment/api --replicas=5`. The command is HIGH risk. The agent shows you exactly what it will run and waits for your "yes" before executing. Read-only commands like `kubectl get pods` run instantly -- no interruptions.

---

## SECTION 5: TOOLS & SKILLS

**Layout:** Two subsections side by side or stacked. Left: Tools grid (8 items). Right: Skills list grouped by domain.

### Heading

10 skills. 8 tools. Every command classified.

### Intro

xops.bot ships with deep knowledge of the DevOps toolchain. Every tool command has a risk classification that drives safety behavior. Skills give agents structured workflows -- not just command knowledge, but the operational judgment to use them correctly.

### Tools (8 cards or badges)

| Tool | Domain | Commands Classified |
|------|--------|-------------------|
| **kubectl** | Kubernetes | 35 commands |
| **docker** | Containers | 38 commands |
| **aws** | Cloud (AWS) | 36 commands |
| **terraform** | Infrastructure as Code | 26 commands |
| **ansible** | Configuration Management | 18 commands |
| **promtool** | Metrics (Prometheus) | 22 commands |
| **logcli** | Logs (Loki) | 6 commands |
| **jaeger** | Traces (Jaeger) | 5 commands |

**Total: 186 commands classified by risk level.**

### Skills by Domain

**Kubernetes**
- k8s-deploy — Safe deployment practices, rollouts, rollback, scaling
- k8s-debug — Systematic troubleshooting: CrashLoopBackOff, OOM, networking

**Containers**
- docker-ops — Container lifecycle, log analysis, resource monitoring, cleanup

**Cloud**
- aws-ops — EC2, S3, IAM, Lambda, RDS, CloudWatch, cost analysis

**Infrastructure as Code**
- terraform-workflow — init, plan, apply, state management, workspaces
- ansible-ops — Playbooks, inventory, roles, vault, ad-hoc commands

**Observability**
- observability-rca — Metrics → logs → traces correlation workflow

**Incident Response**
- incident-analysis — Systematic investigation, evidence gathering, severity classification
- incident-response — Stabilization playbook, mitigation decision trees, recovery
- incident-rca — Post-incident timeline reconstruction, blameless postmortems

---

## SECTION 6: PRESETS

**Layout:** Section heading + intro. Three preset cards side by side, each showing what's included. A "How it works" flow below.

### Heading

Choose your role. Get a curated setup.

### Intro

Presets bundle the right plugins, tools, and safety settings for your role. Select one during setup and you are ready in under a minute. Presets are a starting point -- customize anything afterward.

### DevOps Starter

**Subtitle:** For general DevOps engineers
**Recommended badge:** Most Popular

| | |
|---|---|
| **Plugins** | kubernetes, docker, aws |
| **Agents** | K8s Bot, RCA Bot, FinOps Bot |
| **Tools** | kubectl, docker, aws |
| **Safety** | Standard |

Covers Kubernetes operations, Docker container management, and AWS cloud operations. The recommended starting point for most users.

### SRE

**Subtitle:** For site reliability engineers

| | |
|---|---|
| **Plugins** | kubernetes, observability |
| **Agents** | K8s Bot, RCA Bot, Incident Bot |
| **Tools** | kubectl, promtool, logcli, jaeger |
| **Safety** | Standard |

Focused on observability and incident response. Query Prometheus metrics, search Loki logs, trace requests through Jaeger, and run structured incident investigations.

### Platform Engineer

**Subtitle:** For infrastructure and platform teams

| | |
|---|---|
| **Plugins** | terraform, aws, kubernetes |
| **Agents** | Platform Bot, K8s Bot, FinOps Bot |
| **Tools** | terraform, ansible, aws, kubectl |
| **Safety** | Standard |

Centered on infrastructure as code. Terraform workflows, Ansible configuration management, AWS cloud operations, and cost optimization.

### How Presets Work (visual flow)

```
Choose Preset → Installs Plugins → Pre-selects Tools → Sets Safety Mode → Done
       ↓
  Customize anything afterward
```

---

## SECTION 7: PLUGINS

**Layout:** Section heading + intro. Plugin cards or an expandable accordion.

### Heading

Install what you need. Nothing more.

### Intro

Plugins bundle skills and tools into installable packages. Install a plugin and get everything for a domain -- skills copied to the right workspaces, tool permissions configured, exec-approvals regenerated. One command.

### Plugin List

**kubernetes**
Skills: k8s-deploy, k8s-debug | Tools: kubectl
Kubernetes operations: deployments, debugging, and container management.

**docker**
Skills: docker-ops | Tools: docker
Docker container lifecycle, log analysis, resource monitoring, and cleanup.

**aws**
Skills: aws-ops | Tools: aws
AWS operations: EC2, S3, IAM, Lambda, cost management.

**terraform**
Skills: terraform-workflow, ansible-ops | Tools: terraform, ansible
Infrastructure as Code: Terraform workflows and Ansible configuration management.

**observability**
Skills: observability-rca, incident-analysis, incident-response, incident-rca | Tools: promtool, logcli, jaeger
The full observability and incident response stack. Metrics, logs, traces, and structured investigation workflows.

### Install Example

```bash
bun run xopsbot/cli/plugin.ts install kubernetes
# Installed kubernetes plugin (2 skills, 1 tools)

bun run xopsbot/cli/plugin.ts list
# * kubernetes        installed, enabled
# - docker            not installed
# - aws               not installed
```

---

## SECTION 8: PROFILES

**Layout:** Section heading + three column comparison.

### Heading

One setup. Three environments.

### Intro

Profiles control how safely your agents operate in each environment. Development gives you full access to experiment. Staging adds approval gates. Production restricts the surface area to only what is needed.

### Comparison Table

| | Development | Staging | Production |
|---|---|---|---|
| **Safety Mode** | Full | Standard | Standard |
| **Audit Logging** | Off | On | On |
| **K8s Bot** | Yes | Yes | Yes |
| **RCA Bot** | Yes | Yes | Yes |
| **Incident Bot** | Yes | Yes | Yes |
| **FinOps Bot** | Yes | No | No |
| **Platform Bot** | Yes | Yes | No |
| **Active Agents** | 5 | 4 | 3 |

### Callout

> **Progressive restriction:** Production runs only K8s Bot, RCA Bot, and Incident Bot. Agents that modify infrastructure (Platform Bot) or analyze costs (FinOps Bot) stay out of production where changes must go through formal pipelines.

---

## SECTION 9: HOW IT WORKS

**Layout:** Numbered steps with terminal mockups or illustrations for each.

### Heading

From zero to deployed agent in 5 minutes.

### Step 1: Install

```bash
git clone https://github.com/opsflow-sh/xopsbot.git
cd xopsbot && bun install
```

Prerequisites: Bun, OpenClaw, and an LLM API key (Claude, ChatGPT, or Gemini).

### Step 2: Set your API key

```bash
export ANTHROPIC_API_KEY="your-key-here"
```

### Step 3: Run the wizard

```bash
bun run setup
```

The wizard walks you through 6 quick selections:

1. Choose a role preset (or customize from scratch)
2. Select agent workspaces to enable
3. Choose communication channels
4. Pick your DevOps tools
5. Set a safety mode
6. Connect your LLM provider

### Step 4: Start OpenClaw

```bash
openclaw
```

Your agents are ready. Talk to them.

### Step 5: Try it

```
You: Show me the pods in the payments namespace

K8s Bot: I'll check the pods for you.

> kubectl get pods -n payments

NAME                        READY   STATUS    RESTARTS   AGE
nginx-deployment-abc123     1/1     Running   0          2d
redis-master-def456         1/1     Running   0          5d
```

---

## SECTION 10: USE CASES

**Layout:** Three horizontal cards or tabs, each showing a real scenario with conversation snippets.

### Heading

Real workflows. Real safety.

### Use Case 1: Deploy to Production

**Scenario:** Deploy payments-service v2.3.1 with approval flow.

```
You: Deploy payments-service v2.3.1 to the payments namespace

K8s Bot: Let me validate with a dry-run first.

> kubectl set image deployment/payments-service \
    payments=payments-service:v2.3.1 -n payments \
    --dry-run=server -o yaml

Dry-run passed. Ready to apply.

> kubectl set image deployment/payments-service \
    payments=payments-service:v2.3.1 -n payments

⚠ This is a HIGH risk mutation. Approve? [y/N]
```

You approve. K8s Bot monitors the rollout and confirms all replicas are healthy.

### Use Case 2: Investigate a Latency Spike

**Scenario:** p99 latency spiked on the checkout service. RCA Bot correlates metrics, logs, and traces.

```
RCA Bot: Starting investigation. Metrics first.

> promtool query instant 'histogram_quantile(0.99, ...)'
Result: 4.2s (baseline: 200ms)

Spike started at 14:32 UTC. Checking logs:

> logcli query '{app="checkout"} |= "error"'
Found: "connection timeout: inventory-db:5432"

Tracing a slow request:
> curl 'http://jaeger:16686/api/v3/traces?...'
Database span: 4.1s (normal: 15ms)

Root Cause: inventory-db connection pool exhaustion.
```

All three tools are LOW risk -- auto-execute in Standard mode. No interruptions during investigation.

### Use Case 3: Analyze Cloud Costs

**Scenario:** Monthly AWS cost breakdown and savings recommendations.

```
FinOps Bot: Pulling cost data for January 2026.

> aws ce get-cost-and-usage ...

Total: $12,847.32
  1. EC2           $5,230 (40.7%)
  2. RDS           $3,102 (24.1%)
  3. S3            $1,847 (14.4%)

Found 4 instances averaging <10% CPU.
6 instances eligible for Reserved pricing.

Estimated savings: $1,200 - $1,800/month
```

All read-only queries. No mutations needed for cost analysis.

---

## SECTION 11: OPEN SOURCE

**Layout:** Centered text with GitHub link and stats badges.

### Heading

Open source. MIT licensed. Built in the open.

### Body

xops.bot is open source software built on OpenClaw. Fork it, extend it, contribute to it. The plugin system makes it easy to add new tools and skills without touching core code.

### Links

- **GitHub:** https://github.com/opsflow-sh/xopsbot
- **Documentation:** https://opsflow-sh.github.io/xopsbot/
- **OpenClaw:** https://github.com/openclaw

### Badges

Stars | Forks | License: MIT | Built on OpenClaw

---

## SECTION 12: FOOTER

**Layout:** Dark footer. Three columns: Product, Resources, Community.

### Column 1: Product

- Features (#agents)
- Safety (#safety)
- Presets (#presets)
- Plugins (#plugins)

### Column 2: Resources

- Documentation (https://opsflow-sh.github.io/xopsbot/)
- Quick Start (#quickstart)
- CLI Reference (docs link)
- Troubleshooting (docs link)

### Column 3: Community

- GitHub (https://github.com/opsflow-sh/xopsbot)
- OpenClaw (https://github.com/openclaw)
- opsflow.sh

### Bottom Bar

xops.bot by opsflow.sh | Built on OpenClaw

---

## COPY STYLE GUIDE

For builder.io implementation:

- **Perspective:** Second person ("you", "your infrastructure")
- **Tone:** Confident, direct, technically grounded. Never hyperbolic.
- **Sentences:** Short. Two to three per paragraph max.
- **Voice:** Active ("Agents investigate" not "Investigations are performed")
- **Avoid:** "Revolutionary", "game-changing", "cutting-edge", "AI-powered" (overused)
- **Numbers:** Use specific numbers. "186 commands classified" not "hundreds of commands". "5 agents" not "multiple agents".
- **Code blocks:** Use real commands, not pseudo-code. Dark background, monospace.
- **Each section stands alone:** A visitor who scrolls past the hero still gets value from any section they land on.
