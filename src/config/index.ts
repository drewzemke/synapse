/**
 * Configuration management for Synapse CLI
 */

import fs from 'node:fs';
import { parse as parseToml } from 'toml';
import { fromZodError } from 'zod-validation-error';
import { getConfigPaths } from './paths';
import {
  DEFAULT_CONFIG,
  DEFAULT_MODEL_ANTHROPIC,
  DEFAULT_PROFILE,
  SynapseConfigSchema,
} from './schemas';
import type { ModelSpec, Profile, SynapseConfig } from './types';

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
        const configString = fs.readFileSync(this.configPaths.configFile, 'utf-8');
        const configObj = parseToml(configString);

        const parseResult = SynapseConfigSchema.safeParse(configObj);
        if (!parseResult.success) {
          throw new Error(fromZodError(parseResult.error).toString());
        }
        this.config = parseResult.data;

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
   * Get the path to the config file.
   */
  get configFile() {
    return this.configPaths.configFile;
  }

  /**
   * Get a specific profile by name
   * @param profileName The name of the profile to get
   * @returns The profile, or the default profile if not found
   */
  public getProfile(profileName?: string): Profile {
    if (!this.configLoaded) {
      this.loadConfig();
    }

    if (!profileName) {
      // fall back to the default profile defined in the config,
      // or the built-in default if that fails
      // FIXME: this sucks
      return this.config.general.default_profile
        ? (this.config.profiles?.[this.config.general.default_profile] ?? DEFAULT_PROFILE)
        : DEFAULT_PROFILE;
    }

    // If the user requested a profile that they have not defined, throw an error
    if (!this.config.profiles?.[profileName]) {
      throw new Error(`Profile '${profileName}' not found`);
    }

    return this.config.profiles[profileName];
  }

  /**
   * Get a specific model by name, with fallback to config default or built-in default
   * @param modelName The name of the model to get
   * @returns The model, or the default model if not found
   */
  public getModel(modelName?: string): ModelSpec {
    if (!this.configLoaded) {
      this.loadConfig();
    }

    if (modelName) {
      // If a model name is explicitly provided, try to get it
      if (!this.config.models?.[modelName]) {
        throw new Error(`Model '${modelName}' not found`);
      }
      return this.config.models[modelName];
    }

    // Try using the default model specified in the config
    if (
      this.config.general.default_model &&
      this.config.models?.[this.config.general.default_model]
    ) {
      return this.config.models[this.config.general.default_model];
    }

    // Fall back to built-in default
    return DEFAULT_MODEL_ANTHROPIC;
  }

  /**
   * Resolve whether to use color output based on CLI args and config
   * @param colorArg CLI --color flag value
   * @param noColorArg CLI --no-color flag value
   * @param isTTY Whether output is a TTY
   * @returns Whether to use color output
   */
  public resolveColorOutput(colorArg?: boolean, noColorArg?: boolean, isTTY = true): boolean {
    const config = this.getConfig();

    // Check if explicitly specified in CLI args
    if (colorArg !== undefined) return colorArg;
    if (noColorArg !== undefined) return !noColorArg;

    // Otherwise use config default (only if TTY)
    return isTTY && config.general.color;
  }

  /**
   * Resolve whether to stream output based on CLI args and config
   * @param streamArg CLI --stream flag value
   * @param noStreamArg CLI --no-stream flag value
   * @param isTTY Whether output is a TTY
   * @returns Whether to stream output
   */
  public resolveStreamOutput(streamArg?: boolean, noStreamArg?: boolean, isTTY = true): boolean {
    const config = this.getConfig();

    // Check if explicitly specified in CLI args
    if (streamArg !== undefined) return streamArg;
    if (noStreamArg !== undefined) return !noStreamArg;

    // Otherwise use config default (only if TTY)
    return isTTY && config.general.stream;
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
}

// Export a singleton instance of the config manager
export const configManager = new ConfigManager();

export * from './schemas';
// Export types and schemas
export * from './types';
