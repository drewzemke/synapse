/**
 * Configuration management for Synapse CLI
 */

import fs from 'node:fs';
import { parse as parseToml } from 'toml';
import { fromZodError } from 'zod-validation-error';
import type { SynapseArgs } from '../cli/args';
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

  /**
   * Load configuration from file
   * If the file doesn't exist, it will use default configuration
   * @returns The loaded configuration
   */
  public loadConfig(args: SynapseArgs): SynapseConfig {
    try {
      // create config directory if it doesn't exist
      this.ensureConfigDir();

      if (fs.existsSync(this.configPaths.configFile)) {
        // parse toml file
        const configString = fs.readFileSync(this.configPaths.configFile, 'utf-8');
        const configObj = parseToml(configString);

        // parse config object
        const parseResult = SynapseConfigSchema.safeParse(configObj);
        if (!parseResult.success) {
          throw new Error(fromZodError(parseResult.error).toString());
        }
        this.config = parseResult.data;
      } else {
        // if file doesn't exist, use default config
        this.config = { ...DEFAULT_CONFIG };
      }
    } catch (error) {
      // if there's an error parsing the config file, throw an error
      if (error instanceof Error && error.message.includes('Parse error')) {
        throw new Error(`Invalid configuration file format: ${error.message}`);
      }

      // re-throw other unexpected errors
      if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
        throw error;
      }

      // for other errors, use default config
      this.config = { ...DEFAULT_CONFIG };
    }

    // resolve color and stream settings with the config settings
    this.resolveColorOutput(args.color);
    this.resolveStreamOutput(args.stream);

    return this.config;
  }

  /**
   * Get the path to the config file.
   */
  get configFilePath() {
    return this.configPaths.configFile;
  }

  /**
   * Get a specific profile by name
   * @param profileName The name of the profile to get
   * @returns The profile, or the default profile if not found
   */
  // TODO: make this private, compute and store model privately
  public getProfile(profileName?: string): Profile {
    if (!profileName) {
      // fall back to the default profile defined in the config,
      // or the built-in default if that fails
      const defaultProfName = this.config.general.default_profile;
      return this.config.profiles?.[defaultProfName] ?? DEFAULT_PROFILE;
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
  // TODO: make this private, compute and store model privately
  public getModel(modelName?: string): ModelSpec {
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
   * @param colorArg CLI --color or --no-color flag value
   */
  private resolveColorOutput(colorArg?: boolean) {
    // prefer the passed in arg first, then the config loaded from the file,
    // falling back to false
    const colorPref = colorArg ?? this.config.general.color ?? false;

    // disable no matter what if there's no terminal to output to
    this.config.general.color = (process.stdout.isTTY && colorPref) ?? false;
  }

  /**
   * Resolve whether to stream output based on CLI args and config
   * @param streamArg CLI --stream or --no-stream flag value
   */
  private resolveStreamOutput(streamArg?: boolean) {
    // prefer the passed in arg first, then the config loaded from the file,
    // falling back to false
    const streamPref = streamArg ?? this.config.general.stream ?? false;

    // disable no matter what if there's no terminal to output to
    this.config.general.stream = (process.stdout.isTTY && streamPref) ?? false;
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

  showColor(): boolean {
    return this.config.general.color;
  }

  streamOutput(): boolean {
    return this.config.general.stream;
  }
}

export * from './schemas';
// Export types and schemas
export * from './types';
