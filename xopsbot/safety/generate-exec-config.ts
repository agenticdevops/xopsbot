import type { SafetyMode } from '../schemas/profile.schema';

/**
 * OpenClaw exec security configuration.
 * Defined locally to avoid dependency on OpenClaw types.
 */
export interface OpenClawExecConfig {
  security: 'deny' | 'allowlist' | 'full';
  ask: 'off' | 'on-miss' | 'always';
  safeBins?: string[];
}

/**
 * Safe binaries that can run without approval in allowlist mode.
 * These are read-only text-processing utilities with no side effects.
 */
export const SAFE_BINS: readonly string[] = [
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
] as const;

/**
 * OpenClaw tools to deny in safe mode.
 * These are write-capable tools that can modify the filesystem.
 */
export const SAFE_MODE_TOOL_DENY: readonly string[] = [
  'exec',
  'write',
  'edit',
  'apply_patch',
] as const;

/**
 * Maps xopsbot SafetyMode to OpenClaw exec security configuration.
 *
 * - safe: allowlist + always ask (most restrictive)
 * - standard: allowlist + ask on miss (default for production)
 * - full: full access + never ask (development only)
 */
export function safetyModeToExecConfig(mode: SafetyMode): OpenClawExecConfig {
  switch (mode) {
    case 'safe':
      return {
        security: 'allowlist',
        ask: 'always',
        safeBins: [...SAFE_BINS],
      };
    case 'standard':
      return {
        security: 'allowlist',
        ask: 'on-miss',
        safeBins: [...SAFE_BINS],
      };
    case 'full':
      return {
        security: 'full',
        ask: 'off',
      };
  }
}
