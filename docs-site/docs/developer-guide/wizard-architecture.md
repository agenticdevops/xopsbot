---
sidebar_position: 2
title: Wizard Architecture
---

# Wizard Architecture

The setup wizard is an interactive CLI built with [`@clack/prompts`](https://github.com/natemoo-re/clack) that guides users through configuring xops.bot. It follows a sequential step flow where each step collects one category of input, and a final generation step produces the OpenClaw configuration file.

## Overview

The wizard runs as a linear pipeline:

```
printBanner()
  -> intro()
  -> runWelcome()
  -> selectWorkspaces()
  -> selectChannels()
  -> selectTools()
  -> selectSafetyMode()
  -> connectProvider()
  -> generateConfig(results)
  -> outro()
```

Each step function is independent and returns its result or a cancel symbol. The orchestrator (`index.ts`) checks for cancellation after each step and exits gracefully if the user presses `Ctrl+C`.

## File Structure

| File | Purpose |
|------|---------|
| `wizard/index.ts` | Orchestrator -- runs steps sequentially, assembles `WizardResults`, handles cancellation |
| `wizard/types.ts` | Shared types -- `WizardResults` and `ProviderChoice` interfaces |
| `wizard/banner.ts` | ASCII art banner using `picocolors` for per-line cyan coloring |
| `wizard/utils/first-run.ts` | First-run detection -- checks for `~/.openclaw/openclaw.json` |
| `wizard/steps/welcome.ts` | Welcome note describing the 5 selections |
| `wizard/steps/workspaces.ts` | Multiselect for agent workspaces (required, 5 options) |
| `wizard/steps/channels.ts` | Multiselect for communication channels (optional, 4 options) |
| `wizard/steps/tools.ts` | Multiselect for DevOps tools (required, 5 options, kubectl pre-selected) |
| `wizard/steps/safety.ts` | Single select for safety mode (3 options, standard default) |
| `wizard/steps/provider.ts` | Single select for LLM provider with env var detection |
| `wizard/steps/generate.ts` | Config generation -- copies workspaces, writes `openclaw.json`, shows summary |
| `wizard/templates/openclaw.json5.ts` | Config template -- transforms `WizardResults` into JSON5 config string |

## WizardResults Type

All wizard outputs are bundled into a single typed object that is passed to config generation:

```typescript
interface ProviderChoice {
  /** Provider identifier (e.g., 'anthropic', 'openai', 'google') */
  provider: string;
  /** Model string in OpenClaw format (e.g., 'anthropic/claude-sonnet-4-5') */
  model: string;
  /** Whether the API key was detected in environment */
  apiKeySet: boolean;
}

interface WizardResults {
  /** Selected agent workspaces (e.g., ['k8s-agent', 'rca-agent']) */
  workspaces: string[];
  /** Selected communication channels (e.g., ['telegram', 'slack']) */
  channels: string[];
  /** Selected DevOps tools (e.g., ['kubectl', 'docker']) */
  tools: string[];
  /** Selected safety mode ('safe' | 'standard' | 'full') */
  safetyMode: SafetyMode;
  /** Selected LLM provider and model */
  provider: ProviderChoice;
}
```

`SafetyMode` is imported from the profile schema (`schemas/profile.schema.ts`) to ensure type alignment between the wizard and the validation layer.

## Step Pattern

Each wizard step follows a consistent pattern:

1. **Export a constants array** with the available options (label, value, hint)
2. **Export an async function** that calls a `@clack/prompts` method and returns `Promise<T | symbol>`
3. The return type includes `symbol` because `@clack/prompts` returns a cancel symbol when the user presses `Ctrl+C`

### Example Step

```typescript
import * as p from '@clack/prompts';

export const AVAILABLE_ITEMS = [
  { value: 'item-a', label: 'Item A', hint: 'Description of A' },
  { value: 'item-b', label: 'Item B', hint: 'Description of B' },
];

export async function selectItems(): Promise<string[] | symbol> {
  return p.multiselect({
    message: 'Select items',
    options: AVAILABLE_ITEMS,
    required: true,
  });
}
```

### Cancellation Handling

The orchestrator in `index.ts` checks `p.isCancel(result)` after each step. If true, it calls `p.cancel('Setup cancelled.')` and exits the process. This means no partial configuration is ever written to disk.

### Prompt Types Used

| Prompt | Used By | Behavior |
|--------|---------|----------|
| `p.multiselect` | workspaces, channels, tools | Multiple selection with space to toggle, enter to confirm |
| `p.select` | safety, provider | Single selection with arrow keys |
| `p.note` | welcome, provider (API key instructions) | Informational display, no input |
| `p.spinner` | generate | Progress indicator during file I/O |
| `p.log.success` | provider (key detected) | Green success message |

## Config Generation

The `generateConfig()` function in `steps/generate.ts` takes a `WizardResults` object and:

1. **Creates directories** -- `~/.xopsbot/workspaces/`, `~/.xopsbot/skills/`, `~/.openclaw/`
2. **Copies workspace templates** -- For each selected workspace, recursively copies from `xopsbot/workspaces/<name>/` to `~/.xopsbot/workspaces/<name>/`
3. **Generates OpenClaw config** -- Calls `generateOpenClawConfig()` from the template module
4. **Writes config** -- Saves JSON5 output to `~/.openclaw/openclaw.json`
5. **Displays summary** -- Shows selections and next-step instructions

### Config Template

The `templates/openclaw.json5.ts` file transforms `WizardResults` into a JSON5 config string:

- **Agents** -- Built from workspaces array. Each agent gets an ID (`xops-<name>`), a workspace path, and tool deny lists based on safety mode (safe mode denies `exec`, `write`, `edit`).
- **Channels** -- Built from channels array. Each channel gets `enabled: true` and a placeholder token (`<CHANNEL_BOT_TOKEN>`).
- **Environment** -- Built from tools array. Each tool maps to its conventional environment variables (e.g., kubectl maps to `KUBECONFIG=~/.kube/config`).
- **Model** -- Uses the selected provider's model string as `agents.defaults.model.primary`.

The config uses JSON5 format for readability, serialized with `JSON5.stringify()`.

## Adding a New Step

To add a new step to the wizard:

### 1. Create the step file

Create `wizard/steps/your-step.ts` following the step pattern:

```typescript
import * as p from '@clack/prompts';

export const YOUR_OPTIONS = [
  { value: 'opt-a', label: 'Option A', hint: 'Description' },
];

export async function selectYourThing(): Promise<string | symbol> {
  return p.select({
    message: 'Select your thing',
    options: YOUR_OPTIONS,
  });
}
```

### 2. Update the WizardResults type

Add the new field to `wizard/types.ts`:

```typescript
export interface WizardResults {
  // ... existing fields
  yourThing: string;
}
```

### 3. Wire it into the orchestrator

In `wizard/index.ts`, import the step function and add it to the sequential flow:

```typescript
import { selectYourThing } from './steps/your-step';

// In runWizard():
const yourThing = await selectYourThing();
if (p.isCancel(yourThing)) {
  p.cancel('Setup cancelled.');
  process.exit(0);
}

// Add to results:
const results: WizardResults = {
  // ... existing fields
  yourThing: yourThing as string,
};
```

### 4. Update config generation

In `wizard/steps/generate.ts` and `wizard/templates/openclaw.json5.ts`, use `results.yourThing` to incorporate the new selection into the generated config.

### 5. Update the welcome note

In `wizard/steps/welcome.ts`, update the numbered list to include your new selection.

## First-Run Detection

The `isFirstRun()` function in `wizard/utils/first-run.ts` checks whether `~/.openclaw/openclaw.json` exists:

```typescript
export function isFirstRun(): boolean {
  return !fs.existsSync(OPENCLAW_CONFIG);
}
```

- Returns `true` when no config exists (wizard should auto-launch)
- Returns `false` when config exists (wizard should be skipped)

The function is re-exported from `wizard/index.ts` so callers import from a single entry point:

```typescript
import { isFirstRun } from './wizard';
```

This is used by the main entry point to decide whether to launch the wizard automatically on startup. Users can always bypass this by running `bun run wizard` directly.
