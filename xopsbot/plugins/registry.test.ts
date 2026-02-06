import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  loadRegistry,
  saveRegistry,
  installPlugin,
  removePlugin,
  enablePlugin,
  disablePlugin,
  listPlugins,
  isInstalled,
  isEnabled,
} from './registry';
import type { PluginManifest } from './schema';

/** Helper: create a temp dir for each test */
function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'xopsbot-registry-test-'));
}

/** Helper: minimal plugin manifest for testing */
function testManifest(overrides: Partial<PluginManifest> = {}): PluginManifest {
  return {
    name: 'test-plugin',
    version: '1.0.0',
    description: 'A test plugin',
    skills: ['test-skill'],
    tools: ['test-tool'],
    workspaces: ['test-agent'],
    dependencies: [],
    requiredBins: ['test-bin'],
    optionalBins: [],
    ...overrides,
  };
}

describe('registry', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTmpDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('loadRegistry', () => {
    it('returns empty registry when file does not exist', () => {
      const registry = loadRegistry(tmpDir);
      expect(registry).toEqual({ version: 1, plugins: {} });
    });

    it('returns parsed JSON when file exists', () => {
      const registryDir = tmpDir;
      const data = {
        version: 1 as const,
        plugins: {
          kubernetes: {
            installed: '2026-01-01T00:00:00Z',
            enabled: true,
            version: '1.0.0',
            source: 'builtin' as const,
          },
        },
      };
      fs.writeFileSync(
        path.join(registryDir, 'registry.json'),
        JSON.stringify(data)
      );
      const registry = loadRegistry(registryDir);
      expect(registry).toEqual(data);
    });
  });

  describe('saveRegistry', () => {
    it('writes registry JSON to registryDir', () => {
      const registry = { version: 1 as const, plugins: {} };
      saveRegistry(tmpDir, registry);
      const content = fs.readFileSync(
        path.join(tmpDir, 'registry.json'),
        'utf-8'
      );
      expect(JSON.parse(content)).toEqual(registry);
    });

    it('creates directory if it does not exist', () => {
      const nestedDir = path.join(tmpDir, 'nested', 'plugins');
      const registry = { version: 1 as const, plugins: {} };
      saveRegistry(nestedDir, registry);
      expect(
        fs.existsSync(path.join(nestedDir, 'registry.json'))
      ).toBe(true);
    });
  });

  describe('installPlugin', () => {
    it('adds entry with enabled=true and installed timestamp', async () => {
      const manifest = testManifest({ name: 'kubernetes', version: '1.0.0' });
      const result = await installPlugin(tmpDir, manifest);
      expect(result).toBe(true);

      const registry = loadRegistry(tmpDir);
      expect(registry.plugins['kubernetes']).toBeDefined();
      expect(registry.plugins['kubernetes'].enabled).toBe(true);
      expect(registry.plugins['kubernetes'].version).toBe('1.0.0');
      expect(registry.plugins['kubernetes'].source).toBe('builtin');
      // installed should be an ISO string
      expect(typeof registry.plugins['kubernetes'].installed).toBe('string');
      expect(
        new Date(registry.plugins['kubernetes'].installed).toISOString()
      ).toBe(registry.plugins['kubernetes'].installed);
    });

    it('returns false when plugin already installed (idempotent)', async () => {
      const manifest = testManifest({ name: 'kubernetes' });
      await installPlugin(tmpDir, manifest);
      const result = await installPlugin(tmpDir, manifest);
      expect(result).toBe(false);
    });
  });

  describe('removePlugin', () => {
    it('removes entry and returns true', async () => {
      const manifest = testManifest({ name: 'kubernetes' });
      await installPlugin(tmpDir, manifest);
      const result = await removePlugin(tmpDir, 'kubernetes');
      expect(result).toBe(true);

      const registry = loadRegistry(tmpDir);
      expect(registry.plugins['kubernetes']).toBeUndefined();
    });

    it('returns false when plugin not installed (no-op)', async () => {
      const result = await removePlugin(tmpDir, 'nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('enablePlugin', () => {
    it('sets enabled=true and returns true', async () => {
      const manifest = testManifest({ name: 'kubernetes' });
      await installPlugin(tmpDir, manifest);
      await disablePlugin(tmpDir, 'kubernetes');

      const result = await enablePlugin(tmpDir, 'kubernetes');
      expect(result).toBe(true);

      const registry = loadRegistry(tmpDir);
      expect(registry.plugins['kubernetes'].enabled).toBe(true);
    });

    it('throws when plugin not installed', async () => {
      expect(() => enablePlugin(tmpDir, 'nonexistent')).toThrow(
        'Plugin not installed: nonexistent'
      );
    });
  });

  describe('disablePlugin', () => {
    it('sets enabled=false and returns true', async () => {
      const manifest = testManifest({ name: 'kubernetes' });
      await installPlugin(tmpDir, manifest);

      const result = await disablePlugin(tmpDir, 'kubernetes');
      expect(result).toBe(true);

      const registry = loadRegistry(tmpDir);
      expect(registry.plugins['kubernetes'].enabled).toBe(false);
    });

    it('throws when plugin not installed', async () => {
      expect(() => disablePlugin(tmpDir, 'nonexistent')).toThrow(
        'Plugin not installed: nonexistent'
      );
    });
  });

  describe('listPlugins', () => {
    it('returns empty array when no plugins installed', () => {
      const list = listPlugins(tmpDir);
      expect(list).toEqual([]);
    });

    it('returns array of plugin info', async () => {
      await installPlugin(tmpDir, testManifest({ name: 'kubernetes', version: '1.0.0' }));
      await installPlugin(tmpDir, testManifest({ name: 'docker', version: '2.0.0' }));

      const list = listPlugins(tmpDir);
      expect(list).toHaveLength(2);

      const k8s = list.find((p) => p.name === 'kubernetes');
      expect(k8s).toBeDefined();
      expect(k8s!.enabled).toBe(true);
      expect(k8s!.version).toBe('1.0.0');
      expect(typeof k8s!.installed).toBe('string');

      const docker = list.find((p) => p.name === 'docker');
      expect(docker).toBeDefined();
      expect(docker!.version).toBe('2.0.0');
    });
  });

  describe('isInstalled', () => {
    it('returns true when plugin is installed', async () => {
      await installPlugin(tmpDir, testManifest({ name: 'kubernetes' }));
      expect(isInstalled(tmpDir, 'kubernetes')).toBe(true);
    });

    it('returns false when plugin not installed', () => {
      expect(isInstalled(tmpDir, 'nonexistent')).toBe(false);
    });
  });

  describe('isEnabled', () => {
    it('returns true when plugin installed and enabled', async () => {
      await installPlugin(tmpDir, testManifest({ name: 'kubernetes' }));
      expect(isEnabled(tmpDir, 'kubernetes')).toBe(true);
    });

    it('returns false when plugin not installed', () => {
      expect(isEnabled(tmpDir, 'nonexistent')).toBe(false);
    });

    it('returns false when plugin installed but disabled', async () => {
      await installPlugin(tmpDir, testManifest({ name: 'kubernetes' }));
      await disablePlugin(tmpDir, 'kubernetes');
      expect(isEnabled(tmpDir, 'kubernetes')).toBe(false);
    });
  });
});
