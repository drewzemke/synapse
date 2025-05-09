/**
 * Cross-platform configuration directory paths
 */

import { homedir } from 'node:os';
import { join } from 'node:path';

interface ConfigPaths {
  /** Base directory for configuration files */
  configDir: string;
  /** Path to the main configuration file */
  configFile: string;
  /** Path to the API keys file */
  keysFile: string;
}

/**
 * Get platform-specific configuration paths
 *
 * On Linux/macOS: ~/.config/synapse/
 * On Windows: %APPDATA%\synapse\
 */
export function getConfigPaths(): ConfigPaths {
  const isWindows = process.platform === 'win32';
  const home = homedir();

  // Base configuration directory
  let configDir: string;
  if (isWindows) {
    // Windows: %APPDATA%\synapse\
    configDir = join(process.env.APPDATA || join(home, 'AppData', 'Roaming'), 'synapse');
  } else {
    // Linux/macOS: ~/.config/synapse/
    configDir = join(home, '.config', 'synapse');
  }

  // File paths
  const configFile = join(configDir, 'config.toml');
  const keysFile = join(configDir, '.api-keys.toml');

  return {
    configDir,
    configFile,
    keysFile,
  };
}

/**
 * Get the directory path for storing conversations
 * This is a subdirectory of the main config directory
 */
export function getConversationsDir(): string {
  const { configDir } = getConfigPaths();
  return join(configDir, 'conversations');
}
