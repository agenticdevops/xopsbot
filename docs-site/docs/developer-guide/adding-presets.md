---
sidebar_position: 9
title: Adding Presets
description: How to create new role-based preset definitions
---

# Adding Presets

Presets are static typed data objects that declare a role-based composition of plugins, workspaces, tools, and safety mode. They are NOT executable code. A preset is a factory that produces configuration defaults, consumed by the wizard and CLI. Presets follow the exact same `as const satisfies` pattern used for plugin manifests and tool definitions.

This guide explains how to create a new preset definition and integrate it into the xops.bot preset system.

## Preset Architecture

A preset is a TypeScript object that satisfies the `PresetDefinition` schema. It declares:

- **Plugins** to install (by plugin name from PLUGIN_MAP)
- **Workspaces** to activate (agent workspace names)
- **Tools** enabled by the preset (binary names from plugins)
- **Safety mode** default (safe, standard, or full)
- **Channels** and **provider** (always empty/null -- user picks these)

The wizard uses this data to pre-populate selection steps. The CLI uses it to batch-install plugins and write the active-preset marker. No dynamic loading or code execution occurs -- presets are purely declarative.

## Preset Schema

The `PresetDefinition` type is defined by a Zod schema in `xopsbot/presets/schema.ts`:

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Unique identifier (e.g., "security-engineer"). Used as CLI argument and marker value. |
| `label` | `string` | Display name (e.g., "Security Engineer"). Shown in wizard and CLI output. |
| `description` | `string` | One-line description of what this preset configures and who it is for. |
| `plugins` | `string[]` | Plugin names to install. Each must exist in `PLUGIN_MAP`. |
| `workspaces` | `string[]` | Workspace names to activate. Each must exist in `xopsbot/workspaces/`. |
| `safetyMode` | `'safe' \| 'standard' \| 'full'` | Default safety mode for this preset. |
| `tools` | `string[]` | Tool binary names enabled by this preset (derived from plugins). |
| `channels` | `string[]` | Default channels. Always `[]` for built-in presets (user picks). |
| `provider` | `null` | Always `null`. User always picks their provider. |

The `safetyMode` field uses `SafetyModeSchema` imported from the profile schema, ensuring a single source of truth for valid safety mode values.

## Creating a New Preset

Follow this checklist to add a preset:

### Step 1: Create the definition file

Create `xopsbot/presets/definitions/{name}.ts`:

```typescript
import type { PresetDefinition } from '../schema';

/**
 * My preset description.
 * Who it is for and what it enables.
 */
export const myPreset = {
  name: 'my-preset',
  label: 'My Preset',
  description: 'What this preset provides and who it is for',
  plugins: ['kubernetes', 'aws'],
  workspaces: ['k8s-agent', 'platform-agent'],
  safetyMode: 'standard',
  tools: ['kubectl', 'aws'],
  channels: [],
  provider: null,
} as const satisfies PresetDefinition;
```

Use `as const satisfies PresetDefinition` to preserve literal types while ensuring schema compliance. This matches the pattern used by plugin manifests and tool definitions.

### Step 2: Add to collections

In `xopsbot/presets/index.ts`, add the import, export, and include in `ALL_PRESETS`:

```typescript
// Export the definition
export { myPreset } from './definitions/my-preset';

// Import for collections
import { myPreset } from './definitions/my-preset';

// Add to ALL_PRESETS array
export const ALL_PRESETS: PresetDefinition[] = [
  devopsPreset,
  srePreset,
  platformEngineerPreset,
  myPreset,  // <-- add here
];
```

`PRESET_MAP` is derived automatically from `ALL_PRESETS` via `Object.fromEntries`, so adding to the array is sufficient.

### Step 3: Verify referenced plugins exist

Every plugin name in the `plugins` array must exist in `PLUGIN_MAP` (from `xopsbot/plugins/index.ts`). If the preset references a plugin that does not exist, the CLI `apply` command will fail at plugin install time.

### Step 4: Verify referenced workspaces exist

Every workspace name in the `workspaces` array must exist in `xopsbot/workspaces/{workspace}/`. The wizard uses these names to pre-select workspace options.

### Step 5: Verify tools alignment

Every tool name in the `tools` array should be a binary provided by one of the preset's plugins. Check each plugin's manifest `tools` field to see what binaries it provides. This ensures the wizard pre-selects the right tools.

### Step 6: Wizard integration (automatic)

The wizard preset step (`xopsbot/wizard/steps/preset.ts`) generates its options from `ALL_PRESETS` dynamically:

```typescript
export const PRESET_OPTIONS = [
  ...ALL_PRESETS.map((preset) => ({
    value: preset.name,
    label: preset.label,
    hint: `${preset.tools.join(', ')} | ${...} safety`,
  })),
  { value: 'custom', label: 'Custom', hint: 'Choose everything manually' },
];
```

Adding your preset to `ALL_PRESETS` in `index.ts` automatically adds it to the wizard. No separate wizard file changes are needed.

### Step 7: Update documentation

Add the new preset to the user guide at `docs-site/docs/user-guide/presets.md`:

- Add a row to the "Available Presets" table
- Add a description paragraph explaining who the preset is for
- Update the wizard flow example to show the new option

## Example Preset

A complete example of a hypothetical "security-engineer" preset:

```typescript
import type { PresetDefinition } from '../schema';

/**
 * Security Engineer preset.
 * Security operations: cloud security, container scanning, and IaC compliance.
 */
export const securityEngineerPreset = {
  name: 'security-engineer',
  label: 'Security Engineer',
  description: 'Security operations: cloud security, container scanning, and IaC compliance',
  plugins: ['kubernetes', 'aws', 'terraform'],
  workspaces: ['k8s-agent', 'platform-agent'],
  safetyMode: 'safe',
  tools: ['kubectl', 'aws', 'terraform', 'ansible'],
  channels: [],
  provider: null,
} as const satisfies PresetDefinition;
```

Note the `safetyMode: 'safe'` -- security engineers default to read-only operations. This is a deliberate choice: security auditing and compliance checking should not mutate infrastructure. Users can switch to standard mode later if needed.

## Tools and Plugins Alignment

The `tools` array should list the tool binaries that the preset's plugins provide. This alignment matters because:

1. **Wizard pre-selection** -- The wizard uses `tools` to pre-check tool checkboxes. Listing a tool not provided by any plugin means the user sees a pre-selected tool with no backing plugin.
2. **CLI display** -- The `show` and `list` commands display the tools array. Users expect these tools to work after applying the preset.
3. **Correctness** -- A mismatch between plugins and tools is a configuration error, not a feature.

To verify alignment, check each plugin's manifest:

```typescript
import { PLUGIN_MAP } from '../plugins';

// For the security-engineer preset with plugins: ['kubernetes', 'aws', 'terraform']
PLUGIN_MAP['kubernetes'].tools  // ['kubectl']
PLUGIN_MAP['aws'].tools         // ['aws']
PLUGIN_MAP['terraform'].tools   // ['terraform', 'ansible']
// Combined: ['kubectl', 'aws', 'terraform', 'ansible'] -- matches the tools array
```

## Existing Presets Reference

The three built-in presets and their complete configuration data:

| Field | DevOps Starter | SRE | Platform Engineer |
|-------|---------------|-----|-------------------|
| `name` | `devops` | `sre` | `platform-engineer` |
| `label` | DevOps Starter | SRE | Platform Engineer |
| `plugins` | kubernetes, docker, aws | kubernetes, observability | terraform, aws, kubernetes |
| `workspaces` | k8s-agent, rca-agent, finops-agent | k8s-agent, rca-agent, incident-agent | platform-agent, k8s-agent, finops-agent |
| `safetyMode` | standard | standard | standard |
| `tools` | kubectl, docker, aws | kubectl, promtool, logcli, jaeger | terraform, ansible, aws, kubectl |
| `channels` | [] | [] | [] |
| `provider` | null | null | null |

Source files: `xopsbot/presets/definitions/` (one file per preset).

## Checklist

Before submitting a new preset, verify:

- [ ] **Definition file created** in `xopsbot/presets/definitions/{name}.ts`
- [ ] **Uses `as const satisfies PresetDefinition`** for type safety with literal preservation
- [ ] **All referenced plugins exist** in `PLUGIN_MAP` (from `xopsbot/plugins/index.ts`)
- [ ] **All referenced workspaces exist** in `xopsbot/workspaces/`
- [ ] **Tools array matches plugins' tool outputs** (no orphaned or missing tools)
- [ ] **Added to `ALL_PRESETS`** array in `xopsbot/presets/index.ts`
- [ ] **Export added** in `xopsbot/presets/index.ts` (both named export and import for collections)
- [ ] **User guide updated** at `docs-site/docs/user-guide/presets.md`
