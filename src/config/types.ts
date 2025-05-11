/**
 * Configuration types and interfaces
 */

/**
 * Profile configuration
 */
export interface Profile {
  /** System prompt for the profile */
  system_prompt: string;
  /** Temperature setting (0.0 - 1.0) */
  temperature: number;
}

/**
 * Main application configuration
 */
export interface SynapseConfig {
  /** General settings */
  general: {
    /** Whether to stream responses by default */
    stream: boolean;
  };
  /** User-defined profiles */
  profiles?: Record<string, Profile>;
}

/**
 * Model configuration
 */
export interface Model {
  /** Supported LLM provider types */
  provider: 'anthropic' | 'openai';
  /** The model string */
  modelStr: string;
}

/**
 * Default profile
 */
export const DEFAULT_PROFILE: Profile = {
  system_prompt: 'You are a helpful AI assistant.',
  temperature: 0.7,
};

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: SynapseConfig = {
  general: {
    stream: true,
  },
  profiles: {
    default: DEFAULT_PROFILE,
  },
};

/**
 * Default model
 */
export const DEFAULT_MODEL: Model = {
  provider: 'anthropic',
  modelStr: 'claude-3-7-sonnet-latest',
};
