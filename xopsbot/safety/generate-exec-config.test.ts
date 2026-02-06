import { describe, expect, it } from 'bun:test';
import {
  safetyModeToExecConfig,
  SAFE_BINS,
  SAFE_MODE_TOOL_DENY,
} from './generate-exec-config';

describe('safetyModeToExecConfig', () => {
  describe('safe mode', () => {
    it('returns allowlist security with ask=always', () => {
      const config = safetyModeToExecConfig('safe');
      expect(config.security).toBe('allowlist');
      expect(config.ask).toBe('always');
    });

    it('includes SAFE_BINS in safeBins', () => {
      const config = safetyModeToExecConfig('safe');
      expect(config.safeBins).toBeDefined();
      expect(config.safeBins).toEqual(SAFE_BINS);
    });
  });

  describe('standard mode', () => {
    it('returns allowlist security with ask=on-miss', () => {
      const config = safetyModeToExecConfig('standard');
      expect(config.security).toBe('allowlist');
      expect(config.ask).toBe('on-miss');
    });

    it('includes SAFE_BINS in safeBins', () => {
      const config = safetyModeToExecConfig('standard');
      expect(config.safeBins).toBeDefined();
      expect(config.safeBins).toEqual(SAFE_BINS);
    });
  });

  describe('full mode', () => {
    it('returns full security with ask=off', () => {
      const config = safetyModeToExecConfig('full');
      expect(config.security).toBe('full');
      expect(config.ask).toBe('off');
    });

    it('does NOT include safeBins', () => {
      const config = safetyModeToExecConfig('full');
      expect(config.safeBins).toBeUndefined();
    });
  });
});

describe('SAFE_BINS constant', () => {
  it('has 14 entries', () => {
    expect(SAFE_BINS).toHaveLength(14);
  });

  it('contains expected text-processing utilities', () => {
    const expected = [
      'jq',
      'yq',
      'grep',
      'awk',
      'sed',
      'curl',
      'cat',
      'head',
      'tail',
      'wc',
      'sort',
      'uniq',
      'cut',
      'tr',
    ];
    expect(SAFE_BINS).toEqual(expected);
  });
});

describe('SAFE_MODE_TOOL_DENY constant', () => {
  it('contains exactly the write-capable OpenClaw tools', () => {
    const expected = ['exec', 'write', 'edit', 'apply_patch'];
    expect(SAFE_MODE_TOOL_DENY).toEqual(expected);
  });

  it('has 4 entries', () => {
    expect(SAFE_MODE_TOOL_DENY).toHaveLength(4);
  });
});
