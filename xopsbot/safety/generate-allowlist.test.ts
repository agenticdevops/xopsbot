import { describe, expect, it } from 'bun:test';
import { generateExecApprovals, TOOL_BINARIES } from './generate-allowlist';
import { getAuditConfig } from './audit-config';

describe('generateExecApprovals', () => {
  describe('full mode', () => {
    it('returns version 1', () => {
      const result = generateExecApprovals('full', ['xops-k8s']);
      expect(result.version).toBe(1);
    });

    it('sets security to full', () => {
      const result = generateExecApprovals('full', ['xops-k8s']);
      expect(result.defaults?.security).toBe('full');
    });

    it('sets ask to off', () => {
      const result = generateExecApprovals('full', ['xops-k8s']);
      expect(result.defaults?.ask).toBe('off');
    });

    it('does NOT include agents/allowlist', () => {
      const result = generateExecApprovals('full', ['xops-k8s']);
      expect(result.agents).toBeUndefined();
    });
  });

  describe('standard mode', () => {
    it('returns version 1', () => {
      const result = generateExecApprovals('standard', ['xops-k8s']);
      expect(result.version).toBe(1);
    });

    it('sets security to allowlist', () => {
      const result = generateExecApprovals('standard', ['xops-k8s']);
      expect(result.defaults?.security).toBe('allowlist');
    });

    it('sets ask to on-miss', () => {
      const result = generateExecApprovals('standard', ['xops-k8s']);
      expect(result.defaults?.ask).toBe('on-miss');
    });

    it('includes wildcard agent with allowlist', () => {
      const result = generateExecApprovals('standard', ['xops-k8s']);
      expect(result.agents).toBeDefined();
      expect(result.agents?.['*']).toBeDefined();
      expect(result.agents?.['*']?.allowlist).toBeDefined();
    });

    it('allowlist uses glob patterns not regex', () => {
      const result = generateExecApprovals('standard', ['xops-k8s']);
      const allowlist = result.agents?.['*']?.allowlist ?? [];
      // Glob patterns use * not regex patterns like .*
      const patterns = allowlist.map((e) => e.pattern);
      expect(patterns.some((p) => p.includes('*/kubectl'))).toBe(true);
      expect(patterns.every((p) => !p.includes('.*'))).toBe(true);
    });
  });

  describe('safe mode', () => {
    it('returns version 1', () => {
      const result = generateExecApprovals('safe', ['xops-k8s']);
      expect(result.version).toBe(1);
    });

    it('sets security to allowlist', () => {
      const result = generateExecApprovals('safe', ['xops-k8s']);
      expect(result.defaults?.security).toBe('allowlist');
    });

    it('sets ask to always', () => {
      const result = generateExecApprovals('safe', ['xops-k8s']);
      expect(result.defaults?.ask).toBe('always');
    });

    it('includes wildcard agent with allowlist', () => {
      const result = generateExecApprovals('safe', ['xops-k8s']);
      expect(result.agents).toBeDefined();
      expect(result.agents?.['*']).toBeDefined();
      expect(result.agents?.['*']?.allowlist).toBeDefined();
    });
  });
});

describe('TOOL_BINARIES constant', () => {
  it('covers all 8 tools from tool definitions', () => {
    const tools = Object.keys(TOOL_BINARIES);
    expect(tools).toContain('kubectl');
    expect(tools).toContain('docker');
    expect(tools).toContain('aws');
    expect(tools).toContain('terraform');
    expect(tools).toContain('ansible');
    expect(tools).toContain('promtool');
    expect(tools).toContain('logcli');
    expect(tools).toContain('jaeger');
    expect(tools).toHaveLength(8);
  });

  it('kubectl has single pattern', () => {
    expect(TOOL_BINARIES.kubectl).toEqual(['*/kubectl']);
  });

  it('ansible has multiple patterns for all ansible-* binaries', () => {
    expect(TOOL_BINARIES.ansible).toContain('*/ansible');
    expect(TOOL_BINARIES.ansible).toContain('*/ansible-playbook');
    expect(TOOL_BINARIES.ansible).toContain('*/ansible-galaxy');
    expect(TOOL_BINARIES.ansible).toContain('*/ansible-vault');
    expect(TOOL_BINARIES.ansible.length).toBeGreaterThanOrEqual(8);
  });
});

describe('getAuditConfig', () => {
  it('returns level info when audit enabled', () => {
    const config = getAuditConfig(true);
    expect(config.level).toBe('info');
  });

  it('returns level warn when audit disabled', () => {
    const config = getAuditConfig(false);
    expect(config.level).toBe('warn');
  });

  it('always sets redactSensitive to tools', () => {
    expect(getAuditConfig(true).redactSensitive).toBe('tools');
    expect(getAuditConfig(false).redactSensitive).toBe('tools');
  });
});
