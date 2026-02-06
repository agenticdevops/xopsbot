import type { PluginManifest } from './schema';

/**
 * Resolves the installation order for a plugin and its dependencies.
 * Uses depth-first topological sort with cycle detection.
 *
 * @param pluginName - The plugin to resolve dependencies for
 * @param allPlugins - Map of all available plugin manifests
 * @param installed - Set of already-installed plugin names (skipped)
 * @returns Ordered array of plugin names to install (dependencies first, requested plugin last).
 *          Returns empty array if the requested plugin is already installed.
 * @throws Error if pluginName or any dependency is not in allPlugins
 * @throws Error if a circular dependency is detected
 */
export function resolveDependencies(
  pluginName: string,
  allPlugins: Map<string, PluginManifest>,
  installed: Set<string>
): string[] {
  if (!allPlugins.has(pluginName)) {
    throw new Error(`Unknown plugin: ${pluginName}`);
  }

  // If the requested plugin is already installed, nothing to do
  if (installed.has(pluginName)) {
    return [];
  }

  const result: string[] = [];
  const visited = new Set<string>();
  const processing = new Set<string>();

  function visit(name: string): void {
    // Skip already-installed plugins
    if (installed.has(name)) {
      return;
    }

    // Already in final result, skip
    if (visited.has(name)) {
      return;
    }

    // Currently being processed -- circular dependency
    if (processing.has(name)) {
      throw new Error(`Circular dependency detected: ${name}`);
    }

    const manifest = allPlugins.get(name);
    if (!manifest) {
      throw new Error(`Unknown plugin: ${name}`);
    }

    processing.add(name);

    // Visit all dependencies first
    for (const dep of manifest.dependencies) {
      visit(dep);
    }

    processing.delete(name);
    visited.add(name);
    result.push(name);
  }

  visit(pluginName);

  return result;
}
