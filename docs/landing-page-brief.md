# xops.bot Landing Page Brief

> Builder.io content brief -- complete copy ready for implementation.

## Meta

| Property         | Value                                                     |
| ---------------- | --------------------------------------------------------- |
| Domain           | xops.bot                                                  |
| Tone             | Product marketing, developer-focused                      |
| Target audience  | DevOps engineers, SREs, platform engineering teams         |
| Visual direction | Dark theme, cyan/blue accents, terminal-inspired elements  |
| Tagline          | DevOps agents powered by OpenClaw                         |

---

## Section 1: Hero

**Layout:** Full-width dark background with centered text. Terminal mockup below the CTA showing the xops.bot ASCII banner and a sample agent interaction.

### Headline

Your infrastructure, one conversation away.

### Subheadline

DevOps agents powered by OpenClaw

### Body

Five specialized agents that understand Kubernetes, incidents, root cause analysis, cloud costs, and infrastructure-as-code. Each one built for your workflow, with safety controls you can trust.

### Primary CTA

**Button text:** Get Started
**Action:** Scrolls to Quick Start section

### Secondary CTA

**Link text:** Read the Docs
**Action:** Links to documentation site

### Visual

Terminal mockup showing the xops.bot ASCII banner with cyan coloring, followed by the setup wizard's workspace selection prompt. Dark terminal background, monospace font, realistic shell chrome.

---

## Section 2: Agent Showcase

**Layout:** Section heading, short intro paragraph, then a 5-card grid (3+2 or responsive single column on mobile). Each card has a dark background with subtle cyan border on hover.

### Section Heading

Five agents. Five domains. One platform.

### Section Intro

Each xops.bot agent is a specialist -- not a generic chatbot with a DevOps prompt taped on. They carry their own knowledge, personality, and safety constraints tuned to their domain.

### Agent Cards

#### K8s Bot

- **Emoji:** :wheel_of_dharma:
- **One-liner:** Your hands-on Kubernetes companion.
- **Capabilities:**
  - Diagnose pod failures, CrashLoopBackOff, and scheduling issues
  - Inspect deployments, services, ingress, and cluster state
  - Execute rollouts, scaling, and resource adjustments with dry-run first

#### RCA Bot

- **Emoji:** :mag:
- **One-liner:** Finds what others miss.
- **Capabilities:**
  - Build incident timelines from logs, metrics, and deployment history
  - Form hypotheses with confidence levels and supporting evidence
  - Produce structured post-mortem reports ready for review

#### Incident Bot

- **Emoji:** :rotating_light:
- **One-liner:** The calm voice when systems are on fire.
- **Capabilities:**
  - Triage alerts, assess blast radius, and classify severity
  - Coordinate mitigation steps -- stabilize first, investigate after
  - Maintain structured incident updates for stakeholder communication

#### FinOps Bot

- **Emoji:** :chart_with_downwards_trend:
- **One-liner:** Your cloud cost conscience.
- **Capabilities:**
  - Surface idle resources, oversized instances, and underused reservations
  - Quantify savings opportunities in dollars, not abstractions
  - Recommend right-sizing and scheduling without sacrificing reliability

#### Platform Bot

- **Emoji:** :building_construction:
- **One-liner:** The builder behind your infrastructure.
- **Capabilities:**
  - Manage Terraform, Pulumi, and CloudFormation workflows
  - Ensure changes are reproducible, auditable, and drift-free
  - Explain trade-offs before touching anything in production

---

## Section 3: Safety Modes

**Layout:** Section heading, intro paragraph, then three equal-width columns. Each column has a mode name, icon/badge, and description. The Standard column should be visually emphasized (default badge).

### Section Heading

Built for trust. Configured for your comfort.

### Section Intro

Every xops.bot agent respects your safety boundaries. Choose how much autonomy your agents get -- per environment, per team, per agent. Standard mode ships as the default because your production cluster is not a playground.

### Safe Mode

**Badge:** Read-only
**Icon suggestion:** Shield or lock icon

Agents observe but never touch. They can query cluster state, read logs, analyze metrics, and generate reports. No mutations, no side effects. Ideal for onboarding new team members, auditing infrastructure, or running xops.bot in environments you are still learning.

### Standard Mode

**Badge:** Default
**Icon suggestion:** Checkmark with approval indicator

Agents can suggest and prepare changes, but every mutation requires your explicit approval before execution. You see exactly what will happen, confirm it, and watch it run. This is the balance most teams want -- automation that respects the human in the loop.

### Full Mode

**Badge:** Trusted
**Icon suggestion:** Lightning bolt or automation icon

Agents execute approved action patterns without asking each time. Built for experienced teams with mature CI/CD pipelines and well-understood environments. You set the boundaries once; agents operate within them. Recommended for dev environments and automated workflows.

---

## Section 4: Quick Start

**Layout:** Section heading, install command in a styled code block, then a numbered 3-step flow with brief descriptions. Optional terminal mockup showing wizard output.

### Section Heading

Up and running in under a minute.

### Install Command

```bash
npx xopsbot
```

### Steps

**Step 1: Install**

Run the command above. No global install required -- npx handles everything.

**Step 2: Run the setup wizard**

The interactive wizard walks you through selecting your agents, choosing a safety profile (dev, stage, or prod), and connecting to your OpenClaw provider. It generates your configuration automatically.

**Step 3: Start chatting with your agents**

Open your preferred channel -- terminal, Slack, Discord, or Telegram -- and your agents are ready. Ask K8s Bot about that failing pod. Let FinOps Bot find your wasted spend. Put Incident Bot on alert duty.

### Visual

Terminal mockup showing the setup wizard output: the ASCII banner, workspace selection with all five agents checked, and the "Configuration saved" confirmation message.

---

## Section 5: Footer

**Layout:** Dark footer with links in a single row or grouped columns. "Built on OpenClaw" badge/attribution prominently placed.

### Links

| Label         | URL                                        |
| ------------- | ------------------------------------------ |
| GitHub        | https://github.com/agenticdevops/xopsbot     |
| Documentation | Link to docs site                          |
| OpenClaw      | https://openclaw.dev                       |

### Attribution

**Text:** Built on OpenClaw -- the open source agent platform.
**Link:** https://openclaw.dev

### Copyright

xops.bot by opsflow.sh

---

## Writing Style Reference

These guidelines were followed throughout this brief and should carry into the builder.io implementation:

- **Perspective:** Second person ("you", "your infrastructure", "your agents")
- **Tone:** Confident and direct, technically grounded, never hyperbolic
- **Paragraphs:** Two to three sentences maximum
- **Voice:** Active ("Agents observe" not "Observations are made by agents")
- **Avoided:** "Revolutionary", "game-changing", "cutting-edge", "next-generation"
- **Each section stands alone:** A visitor who scrolls past the hero still gets value from any section they land on
