import { describe, expect, it } from 'bun:test';
import { resolveDependencies } from './resolve-dependencies';
import type { PluginManifest } from './schema';

/** Helper: create a minimal plugin manifest */
function manifest(
  name: string,
  deps: string[] = []
): PluginManifest {
  return {
    name,
    version: '1.0.0',
    description: `${name} plugin`,
    skills: [],
    tools: [],
    workspaces: [],
    dependencies: deps,
    requiredBins: [],
    optionalBins: [],
  };
}

/** Helper: build a Map from an array of manifests */
function pluginMap(
  ...manifests: PluginManifest[]
): Map<string, PluginManifest> {
  return new Map(manifests.map((m) => [m.name, m]));
}

describe('resolveDependencies', () => {
  describe('no dependencies', () => {
    it('returns [pluginName] for a plugin with no deps', () => {
      const allPlugins = pluginMap(manifest('kubernetes'));
      const result = resolveDependencies('kubernetes', allPlugins, new Set());
      expect(result).toEqual(['kubernetes']);
    });
  });

  describe('with dependencies', () => {
    it('returns [dep, plugin] when dep is not installed', () => {
      const allPlugins = pluginMap(
        manifest('docker'),
        manifest('kubernetes', ['docker'])
      );
      const result = resolveDependencies('kubernetes', allPlugins, new Set());
      expect(result).toEqual(['docker', 'kubernetes']);
    });

    it('returns [plugin] when dep is already installed', () => {
      const allPlugins = pluginMap(
        manifest('docker'),
        manifest('kubernetes', ['docker'])
      );
      const installed = new Set(['docker']);
      const result = resolveDependencies('kubernetes', allPlugins, installed);
      expect(result).toEqual(['kubernetes']);
    });
  });

  describe('transitive dependencies', () => {
    it('resolves A -> B -> C to [C, B, A]', () => {
      const allPlugins = pluginMap(
        manifest('core'),
        manifest('base', ['core']),
        manifest('app', ['base'])
      );
      const result = resolveDependencies('app', allPlugins, new Set());
      expect(result).toEqual(['core', 'base', 'app']);
    });

    it('skips already-installed transitive deps', () => {
      const allPlugins = pluginMap(
        manifest('core'),
        manifest('base', ['core']),
        manifest('app', ['base'])
      );
      const installed = new Set(['core']);
      const result = resolveDependencies('app', allPlugins, installed);
      expect(result).toEqual(['base', 'app']);
    });

    it('handles diamond dependencies (A -> B, A -> C, B -> D, C -> D)', () => {
      const allPlugins = pluginMap(
        manifest('d'),
        manifest('b', ['d']),
        manifest('c', ['d']),
        manifest('a', ['b', 'c'])
      );
      const result = resolveDependencies('a', allPlugins, new Set());
      // D should appear only once, before B and C
      expect(result).toContain('d');
      expect(result).toContain('b');
      expect(result).toContain('c');
      expect(result).toContain('a');
      expect(result.indexOf('d')).toBeLessThan(result.indexOf('b'));
      expect(result.indexOf('d')).toBeLessThan(result.indexOf('c'));
      expect(result.indexOf('b')).toBeLessThan(result.indexOf('a'));
      expect(result.indexOf('c')).toBeLessThan(result.indexOf('a'));
      // No duplicates
      expect(new Set(result).size).toBe(result.length);
    });
  });

  describe('error cases', () => {
    it('throws for unknown plugin', () => {
      const allPlugins = pluginMap(manifest('kubernetes'));
      expect(() =>
        resolveDependencies('nonexistent', allPlugins, new Set())
      ).toThrow('Unknown plugin: nonexistent');
    });

    it('throws for unknown dependency', () => {
      const allPlugins = pluginMap(
        manifest('app', ['missing-dep'])
      );
      expect(() =>
        resolveDependencies('app', allPlugins, new Set())
      ).toThrow('Unknown plugin: missing-dep');
    });

    it('throws for circular dependency (A -> B -> A)', () => {
      const allPlugins = pluginMap(
        manifest('a', ['b']),
        manifest('b', ['a'])
      );
      expect(() =>
        resolveDependencies('a', allPlugins, new Set())
      ).toThrow(/Circular dependency detected/);
    });

    it('throws for self-referencing dependency', () => {
      const allPlugins = pluginMap(
        manifest('a', ['a'])
      );
      expect(() =>
        resolveDependencies('a', allPlugins, new Set())
      ).toThrow(/Circular dependency detected/);
    });

    it('throws for longer circular chain (A -> B -> C -> A)', () => {
      const allPlugins = pluginMap(
        manifest('a', ['b']),
        manifest('b', ['c']),
        manifest('c', ['a'])
      );
      expect(() =>
        resolveDependencies('a', allPlugins, new Set())
      ).toThrow(/Circular dependency detected/);
    });
  });

  describe('built-in plugins (all have no dependencies)', () => {
    it('each returns [pluginName] for the 5 built-in plugins', () => {
      const builtins = pluginMap(
        manifest('kubernetes'),
        manifest('docker'),
        manifest('aws'),
        manifest('terraform'),
        manifest('observability')
      );

      for (const name of ['kubernetes', 'docker', 'aws', 'terraform', 'observability']) {
        const result = resolveDependencies(name, builtins, new Set());
        expect(result).toEqual([name]);
      }
    });
  });

  describe('already-installed plugin', () => {
    it('returns empty array when the requested plugin is already installed', () => {
      const allPlugins = pluginMap(manifest('kubernetes'));
      const installed = new Set(['kubernetes']);
      const result = resolveDependencies('kubernetes', allPlugins, installed);
      expect(result).toEqual([]);
    });
  });
});
