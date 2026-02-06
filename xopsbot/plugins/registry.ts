import * as fs from 'node:fs';
import * as path from 'node:path';
import { PluginRegistryFileSchema } from './schema';
import type { PluginManifest, PluginRegistryFile } from './schema';

/**
 * Registry file name within the registry directory.
 */
const REGISTRY_FILENAME = 'registry.json';

/**
 * Returns the full path to the registry JSON file.
 */
function registryPath(registryDir: string): string {
  return path.join(registryDir, REGISTRY_FILENAME);
}

/**
 * Loads the plugin registry from disk.
 * Returns an empty registry ({version: 1, plugins: {}}) if the file does not exist.
 *
 * @param registryDir - Directory containing registry.json
 * @returns Parsed and validated PluginRegistryFile
 */
export function loadRegistry(registryDir: string): PluginRegistryFile {
  const filePath = registryPath(registryDir);

  if (!fs.existsSync(filePath)) {
    return { version: 1, plugins: {} };
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(raw);
  return PluginRegistryFileSchema.parse(parsed);
}

/**
 * Saves the plugin registry to disk.
 * Creates the directory tree if it does not exist.
 *
 * @param registryDir - Directory to write registry.json into
 * @param registry - The registry data to persist
 */
export function saveRegistry(
  registryDir: string,
  registry: PluginRegistryFile
): void {
  fs.mkdirSync(registryDir, { recursive: true });
  fs.writeFileSync(
    registryPath(registryDir),
    JSON.stringify(registry, null, 2)
  );
}

/**
 * Installs a plugin into the registry.
 * Sets enabled=true and records the current ISO timestamp.
 * Idempotent: returns false if the plugin is already installed.
 *
 * @param registryDir - Directory containing registry.json
 * @param manifest - The plugin manifest to install
 * @returns true if installed, false if already present (no-op)
 */
export function installPlugin(
  registryDir: string,
  manifest: PluginManifest
): boolean {
  const registry = loadRegistry(registryDir);

  if (registry.plugins[manifest.name]) {
    return false;
  }

  registry.plugins[manifest.name] = {
    installed: new Date().toISOString(),
    enabled: true,
    version: manifest.version,
    source: 'builtin',
  };

  saveRegistry(registryDir, registry);
  return true;
}

/**
 * Removes a plugin from the registry.
 * Returns false if the plugin was not installed (no-op).
 *
 * @param registryDir - Directory containing registry.json
 * @param name - Plugin name to remove
 * @returns true if removed, false if not found
 */
export function removePlugin(registryDir: string, name: string): boolean {
  const registry = loadRegistry(registryDir);

  if (!registry.plugins[name]) {
    return false;
  }

  delete registry.plugins[name];
  saveRegistry(registryDir, registry);
  return true;
}

/**
 * Enables a previously disabled plugin.
 * Throws if the plugin is not installed.
 *
 * @param registryDir - Directory containing registry.json
 * @param name - Plugin name to enable
 * @returns true when enabled
 * @throws Error if plugin not installed
 */
export function enablePlugin(registryDir: string, name: string): boolean {
  const registry = loadRegistry(registryDir);

  if (!registry.plugins[name]) {
    throw new Error(`Plugin not installed: ${name}`);
  }

  registry.plugins[name].enabled = true;
  saveRegistry(registryDir, registry);
  return true;
}

/**
 * Disables an installed plugin without removing it.
 * Throws if the plugin is not installed.
 *
 * @param registryDir - Directory containing registry.json
 * @param name - Plugin name to disable
 * @returns true when disabled
 * @throws Error if plugin not installed
 */
export function disablePlugin(registryDir: string, name: string): boolean {
  const registry = loadRegistry(registryDir);

  if (!registry.plugins[name]) {
    throw new Error(`Plugin not installed: ${name}`);
  }

  registry.plugins[name].enabled = false;
  saveRegistry(registryDir, registry);
  return true;
}

/**
 * Lists all installed plugins with their state.
 *
 * @param registryDir - Directory containing registry.json
 * @returns Array of plugin info objects
 */
export function listPlugins(
  registryDir: string
): Array<{ name: string; enabled: boolean; version: string; installed: string }> {
  const registry = loadRegistry(registryDir);

  return Object.entries(registry.plugins).map(([name, entry]) => ({
    name,
    enabled: entry.enabled,
    version: entry.version,
    installed: entry.installed,
  }));
}

/**
 * Checks whether a plugin is installed.
 *
 * @param registryDir - Directory containing registry.json
 * @param name - Plugin name to check
 * @returns true if the plugin exists in the registry
 */
export function isInstalled(registryDir: string, name: string): boolean {
  const registry = loadRegistry(registryDir);
  return name in registry.plugins;
}

/**
 * Checks whether a plugin is installed and enabled.
 * Returns false if the plugin is not installed (rather than throwing).
 *
 * @param registryDir - Directory containing registry.json
 * @param name - Plugin name to check
 * @returns true if installed and enabled, false otherwise
 */
export function isEnabled(registryDir: string, name: string): boolean {
  const registry = loadRegistry(registryDir);
  const entry = registry.plugins[name];
  return entry?.enabled ?? false;
}
