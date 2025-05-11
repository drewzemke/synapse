/**
 * Configuration management for Synapse CLI
 */

import fs from 'node:fs';
import { parse } from 'toml';
import { getConfigPaths } from './paths';
import {
  DEFAULT_CONFIG,
  DEFAULT_MODEL_ANTHROPIC,
  DEFAULT_PROFILE,
  type ModelSpec,
  type Profile,
  type SynapseConfig,
} from './types';

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
        const parsedConfig = parse(configContents);

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
      // If user has defined a custom 'default' profile, use that
      // Otherwise return the built-in default profile
      return this.config.profiles?.default ?? DEFAULT_PROFILE;
    }

    // If the user requested a profile that they have not defined, throw an error
    if (!this.config.profiles?.[profileName]) {
      throw new Error('Profile does not exist');
    }

    return this.config.profiles[profileName];
  }

  /**
   * Get a specific model by name
   * @param modelName The name of the model to get
   * @returns The model, or the default model if not found
   */
  public getModel(modelName?: string): ModelSpec {
    if (!this.configLoaded) {
      this.loadConfig();
    }

    if (!modelName) {
      // Return default Anthropic model if no model name is provided
      return DEFAULT_MODEL_ANTHROPIC;
    }

    // If the user requested a model that they have not defined, throw an error
    if (!this.config.models?.[modelName]) {
      throw new Error('Model does not exist');
    }

    return this.config.models[modelName];
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

      // Merge profiles if they exist
      if (
        'profiles' in parsedConfig &&
        typeof parsedConfig.profiles === 'object' &&
        parsedConfig.profiles !== null
      ) {
        result.profiles = { ...DEFAULT_CONFIG.profiles };

        const profiles = parsedConfig.profiles as Record<string, unknown>;

        // Iterate through each profile in the parsed config
        for (const [profileName, profileData] of Object.entries(profiles)) {
          if (typeof profileData === 'object' && profileData !== null) {
            const profile = profileData as Record<string, unknown>;
            const validatedProfile: Partial<Profile> = {};

            // Validate and extract profile properties
            if ('system_prompt' in profile && typeof profile.system_prompt === 'string') {
              validatedProfile.system_prompt = profile.system_prompt;
            }

            if ('temperature' in profile && typeof profile.temperature === 'number') {
              validatedProfile.temperature = profile.temperature;
            }

            // Only add profiles that have at least one valid property
            if (Object.keys(validatedProfile).length > 0) {
              // Create profile with defaults for any missing properties
              if (result.profiles) {
                result.profiles[profileName] = {
                  ...DEFAULT_PROFILE,
                  ...validatedProfile,
                };
              }
            }
          }
        }
      }

      // Merge models if they exist
      if (
        'models' in parsedConfig &&
        typeof parsedConfig.models === 'object' &&
        parsedConfig.models !== null
      ) {
        const models = parsedConfig.models as Record<string, unknown>;
        const validatedModels: Record<string, ModelSpec> = {};

        // Iterate through each model in the parsed config
        for (const [modelName, modelData] of Object.entries(models)) {
          if (typeof modelData === 'object' && modelData !== null) {
            const model = modelData as Record<string, unknown>;

            // Validate provider field
            if (
              !('provider' in model) ||
              typeof model.provider !== 'string' ||
              !['anthropic', 'openai', 'openrouter'].includes(model.provider as string)
            ) {
              continue; // Skip invalid provider
            }

            // Validate model field
            if (!('model' in model) || typeof model.model !== 'string') {
              continue; // Skip missing or invalid model string
            }

            // Add validated model
            validatedModels[modelName] = {
              provider: model.provider as ModelSpec['provider'],
              modelStr: model.model as string,
            };
          }
        }

        // Only add models section if at least one valid model was found
        if (Object.keys(validatedModels).length > 0) {
          result.models = validatedModels;
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
