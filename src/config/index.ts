/**
 * Configuration management for Synapse CLI
 */

import fs from 'node:fs';
import toml from 'toml';
import { getConfigPaths } from './paths';
import { DEFAULT_CONFIG, type SynapseConfig } from './types';

/**
 * Configuration manager
 */
export class ConfigManager {
  private config: SynapseConfig = DEFAULT_CONFIG;
  private configPaths = getConfigPaths();
  private configLoaded = false;

  /**
   * Load configuration from file
   * If the file doesn't exist, it will use default configuration
   * @returns The loaded configuration
   */
  public loadConfig(): SynapseConfig {
    try {
      // Create config directory if it doesn't exist
      this.ensureConfigDir();

      // Check if config file exists
      if (fs.existsSync(this.configPaths.configFile)) {
        // Read and parse the config file
        const configContents = fs.readFileSync(this.configPaths.configFile, 'utf-8');
        const parsedConfig = toml.parse(configContents);

        // Merge with default config to ensure all fields exist
        this.config = this.mergeConfig(parsedConfig);
        this.configLoaded = true;
      } else {
        // If file doesn't exist, use default config
        this.config = { ...DEFAULT_CONFIG };
        this.configLoaded = true;
      }
    } catch (error) {
      // If there's an error parsing the config file, throw an error
      if (error instanceof Error && error.message.includes('Parse error')) {
        throw new Error(`Invalid configuration file format: ${error.message}`);
      }
      // For other errors, use default config
      this.config = { ...DEFAULT_CONFIG };
      this.configLoaded = false;

      // Re-throw unexpected errors
      if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
        throw error;
      }
    }

    return this.config;
  }

  /**
   * Get the current configuration
   * If configuration hasn't been loaded yet, it will load it first
   * @returns The current configuration
   */
  public getConfig(): SynapseConfig {
    if (!this.configLoaded) {
      return this.loadConfig();
    }
    return this.config;
  }

  /**
   * Ensure the config directory exists
   * @private
   */
  private ensureConfigDir(): void {
    if (!fs.existsSync(this.configPaths.configDir)) {
      fs.mkdirSync(this.configPaths.configDir, { recursive: true });
    }
  }

  /**
   * Merge parsed config with default config
   * @param parsedConfig Parsed configuration
   * @returns Merged configuration
   * @private
   */
  private mergeConfig(parsedConfig: unknown): SynapseConfig {
    const result = { ...DEFAULT_CONFIG };

    if (this.isConfigObject(parsedConfig)) {
      // Merge general settings if they exist
      if (
        'general' in parsedConfig &&
        typeof parsedConfig.general === 'object' &&
        parsedConfig.general !== null
      ) {
        if ('stream' in parsedConfig.general && typeof parsedConfig.general.stream === 'boolean') {
          result.general.stream = parsedConfig.general.stream;
        }
      }
    }

    return result;
  }

  /**
   * Check if the parsed config has the expected structure
   * @param value Value to check
   * @returns Whether the value is a config object
   * @private
   */
  private isConfigObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}

// Export a singleton instance of the config manager
export const configManager = new ConfigManager();

// Export types
export * from './types';
