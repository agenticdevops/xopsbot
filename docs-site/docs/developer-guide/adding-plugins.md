---
sidebar_position: 8
title: Adding Plugins
description: How to create new plugin manifests
---

# Adding Plugins

Plugins are static manifest files (TypeScript data objects) that declare which skills and tools they bundle. They are NOT executable code. The plugin system is a thin packaging layer over existing skills and tools -- it handles installation, registry tracking, and exec-approvals regeneration.

This guide explains how to create a new plugin manifest and integrate it into the xops.bot plugin system.

## Plugin Architecture

A plugin is a TypeScript object that satisfies the `PluginManifest` schema. It declares:

- **Skills** it bundles (by skill directory name)
- **Tools** it bundles (by tool definition name)
- **Workspaces** where skills are placed (agent workspace names)
- **Dependencies** on other plugins (auto-resolved during install)
- **Required binaries** that must be present for tools to function
- **Optional binaries** that enhance functionality but are not mandatory

The CLI uses this manifest to copy skills, update the registry, and regenerate exec-approvals. No dynamic loading or code execution occurs -- plugins are purely declarative.

## Plugin Manifest Schema

The `PluginManifest` type is defined by a Zod schema in `xopsbot/plugins/schema.ts`:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Plugin identifier (e.g., "kubernetes", "docker"). Must be unique. |
| `version` | `string` | Yes | Semantic version (e.g., "1.0.0"). |
| `description` | `string` | Yes | Human-readable summary of what the plugin provides. |
| `skills` | `string[]` | Yes | Skill directory names to bundle (e.g., `["k8s-deploy", "k8s-debug"]`). |
| `tools` | `string[]` | Yes | Tool definition names to bundle (e.g., `["kubectl"]`). |
| `workspaces` | `string[]` | Yes | Workspace names where skills are installed (e.g., `["k8s-agent"]`). |
| `dependencies` | `string[]` | Yes | Other plugin names that must be installed first. Use `[]` for no dependencies. |
| `requiredBins` | `string[]` | Yes | Binary names that must be present for core functionality. |
| `optionalBins` | `string[]` | No | Binary names that enhance the plugin but are not mandatory. Defaults to `[]`. |

## Creating a New Plugin

Follow this checklist to add a plugin:

### Step 1: Create the manifest file

Create `xopsbot/plugins/definitions/{name}.ts`:

```typescript
import type { PluginManifest } from '../schema';

/**
 * My Plugin manifest.
 * Brief description of what it bundles.
 */
export const myPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  description: 'What this plugin provides',
  skills: ['skill-a', 'skill-b'],
  tools: ['tool-a'],
  workspaces: ['my-agent'],
  dependencies: [],
  requiredBins: ['tool-binary'],
  optionalBins: [],
} as const satisfies PluginManifest;
```

Use `as const satisfies PluginManifest` to preserve literal types while ensuring schema compliance. This matches the pattern used by tool definitions.

### Step 2: Add to collections

In `xopsbot/plugins/index.ts`, add the export and include in `ALL_PLUGINS` and `PLUGIN_MAP`:

```typescript
// Export the definition
export { myPlugin } from './definitions/my-plugin';

// Import for collections
import { myPlugin } from './definitions/my-plugin';

// Add to ALL_PLUGINS array
export const ALL_PLUGINS: PluginManifest[] = [
  kubernetesPlugin,
  dockerPlugin,
  awsPlugin,
  terraformPlugin,
  observabilityPlugin,
  myPlugin,  // <-- add here
];
```

`PLUGIN_MAP` is derived automatically from `ALL_PLUGINS` via `Object.fromEntries`, so adding to the array is sufficient.

### Step 3: Verify referenced assets exist

Ensure all skills, tools, and workspaces referenced by the manifest exist:

- **Skills:** Each skill in the `skills` array must have a directory in `xopsbot/skills/{skill-name}/` containing a `SKILL.md` file.
- **Tools:** Each tool in the `tools` array must have a definition in `xopsbot/tools/definitions/{tool}.ts` and be included in the `ALL_TOOLS` array.
- **Workspaces:** Each workspace in the `workspaces` array must exist in `xopsbot/workspaces/{workspace}/`.

### Step 4: Add tests (if plugin has dependencies)

If your plugin declares dependencies, add test coverage for the dependency resolution path:

```typescript
import { resolveDependencies } from '../resolve-dependencies';

test('my-plugin resolves observability dependency', () => {
  const plugins = new Map([
    ['observability', observabilityPlugin],
    ['my-plugin', myPlugin],
  ]);
  const installed = new Set<string>();
  const order = resolveDependencies('my-plugin', plugins, installed);
  expect(order).toEqual(['observability', 'my-plugin']);
});
```

### Step 5: Update documentation

Add the new plugin to the user guide at `docs-site/docs/user-guide/plugins.md`:

- Add a row to the "Available Plugins" table
- Add a description paragraph under the table
- Add a row to the "Required Binaries" table

## Example Plugin

A complete example of a hypothetical "monitoring" plugin that depends on the observability plugin:

```typescript
import type { PluginManifest } from '../schema';

/**
 * Monitoring plugin manifest.
 * Bundles Grafana dashboard operations with observability tools.
 * Depends on the observability plugin for Prometheus and Loki access.
 */
export const monitoringPlugin = {
  name: 'monitoring',
  version: '1.0.0',
  description: 'Monitoring stack: Grafana dashboards and alerting',
  skills: ['grafana-ops'],
  tools: ['grafana'],
  workspaces: ['rca-agent'],
  dependencies: ['observability'],
  requiredBins: ['grafana-cli'],
  optionalBins: [],
} as const satisfies PluginManifest;
```

This plugin:

- Bundles a `grafana-ops` skill and `grafana` tool
- Targets the `rca-agent` workspace (same as observability)
- Depends on `observability` -- installing "monitoring" auto-installs "observability" first
- Requires the `grafana-cli` binary

## Plugin Registry

The plugin registry tracks installation state in `~/.xopsbot/plugins/registry.json`:

```json
{
  "version": 1,
  "plugins": {
    "kubernetes": {
      "installed": "2026-02-06T10:00:00Z",
      "enabled": true,
      "version": "1.0.0",
      "source": "builtin"
    },
    "docker": {
      "installed": "2026-02-06T10:01:00Z",
      "enabled": false,
      "version": "1.0.0",
      "source": "builtin"
    }
  }
}
```

**Registry fields per plugin:**

| Field | Description |
|-------|-------------|
| `installed` | ISO timestamp of installation |
| `enabled` | Whether the plugin's tools are active in exec-approvals |
| `version` | Installed manifest version |
| `source` | Always `"builtin"` for bundled plugins |

**How operations affect the registry:**

| Operation | Effect |
|-----------|--------|
| `install` | Adds entry with `enabled: true` |
| `remove` | Deletes entry entirely |
| `enable` | Sets `enabled: true`, regenerates exec-approvals |
| `disable` | Sets `enabled: false`, regenerates exec-approvals |

The registry file is created automatically on first install. If the file does not exist, operations treat it as an empty registry.

## Existing Plugins Reference

The five built-in plugins and their manifest data:

| Plugin | Skills | Tools | Workspaces | Required Bins | Optional Bins |
|--------|--------|-------|------------|---------------|---------------|
| kubernetes | 2 | 1 | 1 | kubectl | -- |
| docker | 1 | 1 | 1 | docker | -- |
| aws | 1 | 1 | 2 | aws | -- |
| terraform | 2 | 2 | 1 | terraform | ansible, ansible-playbook |
| observability | 4 | 3 | 2 | promtool, logcli | curl |

**Totals:** 10 skills, 8 tools, 5 workspaces across all plugins.

Source files: `xopsbot/plugins/definitions/` (one file per plugin).

## Checklist

Before submitting a new plugin, verify:

- [ ] **Manifest file created** in `xopsbot/plugins/definitions/{name}.ts`
- [ ] **Uses `as const satisfies PluginManifest`** for type safety with literal preservation
- [ ] **All referenced skills exist** in `xopsbot/skills/`
- [ ] **All referenced tools exist** in `xopsbot/tools/definitions/`
- [ ] **All referenced workspaces exist** in `xopsbot/workspaces/`
- [ ] **Added to `ALL_PLUGINS`** array in `xopsbot/plugins/index.ts`
- [ ] **Dependencies are valid** -- all dependency names are existing plugins
- [ ] **Tests added** if plugin has dependencies
- [ ] **User guide updated** at `docs-site/docs/user-guide/plugins.md`
