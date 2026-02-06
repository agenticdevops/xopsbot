/**
 * Safety module - maps xopsbot SafetyMode to OpenClaw configuration.
 *
 * This module provides pure functions for generating:
 * - Exec security configuration (allowlist vs full access)
 * - Exec-approvals.json allowlist structures
 * - Audit logging configuration
 *
 * @module safety
 */

// Exec config generation
export {
  safetyModeToExecConfig,
  SAFE_BINS,
  SAFE_MODE_TOOL_DENY,
  type OpenClawExecConfig,
} from './generate-exec-config';

// Allowlist generation
export {
  generateExecApprovals,
  TOOL_BINARIES,
  type ExecAllowlistEntry,
  type ExecApprovalsFile,
} from './generate-allowlist';

// Audit config
export { getAuditConfig, type LoggingConfig } from './audit-config';
