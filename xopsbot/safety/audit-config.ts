/**
 * OpenClaw logging configuration.
 */
export interface LoggingConfig {
  level: string;
  redactSensitive: string;
}

/**
 * Generates audit logging configuration based on whether audit is enabled.
 *
 * - Enabled (true): level 'info' - logs all operations for audit trail
 * - Disabled (false): level 'warn' - only logs warnings and errors
 *
 * Always redacts sensitive data from tool outputs.
 *
 * @param auditEnabled - Whether audit logging should be enabled
 * @returns Logging configuration for OpenClaw
 */
export function getAuditConfig(auditEnabled: boolean): LoggingConfig {
  return {
    level: auditEnabled ? 'info' : 'warn',
    redactSensitive: 'tools',
  };
}
