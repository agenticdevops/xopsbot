import { z } from 'zod';

/**
 * Schema for a plugin manifest declaration.
 * Defines which skills, tools, workspaces, and binaries a plugin bundles.
 * Plugins are static data objects -- no dynamic loading or code execution.
 */
export const PluginManifestSchema = z.object({
  /** Plugin identifier (e.g., "kubernetes", "docker") */
  name: z.string(),
  /** Semantic version (e.g., "1.0.0") */
  version: z.string(),
  /** Human-readable description of what this plugin provides */
  description: z.string(),
  /** Skill directory names this plugin bundles (e.g., ["k8s-deploy", "k8s-debug"]) */
  skills: z.array(z.string()),
  /** Tool definition names this plugin bundles (e.g., ["kubectl"]) */
  tools: z.array(z.string()),
  /** Workspace names where this plugin's skills are placed (e.g., ["k8s-agent"]) */
  workspaces: z.array(z.string()),
  /** Other plugin names that must be installed first */
  dependencies: z.array(z.string()),
  /** Binary names that MUST be present for the plugin to function */
  requiredBins: z.array(z.string()),
  /** Binary names that enhance the plugin but are not mandatory */
  optionalBins: z.array(z.string()).default([]),
});

/** Inferred type for a plugin manifest declaration */
export type PluginManifest = z.infer<typeof PluginManifestSchema>;

/**
 * Schema for a single entry in the plugin registry file.
 * Tracks installation state and metadata for one plugin.
 */
export const PluginRegistryEntrySchema = z.object({
  /** ISO timestamp of when the plugin was installed */
  installed: z.string(),
  /** Whether the plugin is currently active */
  enabled: z.boolean(),
  /** Installed version of the plugin */
  version: z.string(),
  /** Installation source -- builtin for bundled plugins */
  source: z.literal('builtin'),
});

/** Inferred type for a plugin registry entry */
export type PluginRegistryEntry = z.infer<typeof PluginRegistryEntrySchema>;

/**
 * Schema for the plugin registry file (~/.xopsbot/plugins/registry.json).
 * Tracks all installed plugins and their lifecycle state.
 */
export const PluginRegistryFileSchema = z.object({
  /** Registry file format version */
  version: z.literal(1),
  /** Map of plugin name to registry entry */
  plugins: z.record(z.string(), PluginRegistryEntrySchema),
});

/** Inferred type for the plugin registry file */
export type PluginRegistryFile = z.infer<typeof PluginRegistryFileSchema>;
