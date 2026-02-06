/**
 * CLI commands barrel export.
 *
 * This module provides the public API for xopsbot CLI commands.
 *
 * @module cli
 */

// Safety mode switching
export { switchSafetyMode } from './safety-switch';

// Plugin management
export {
  pluginInstall,
  pluginRemove,
  pluginList,
  pluginEnable,
  pluginDisable,
} from './plugin';
