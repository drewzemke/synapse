/**
 * Factory for creating LLM providers
 */

import { AnthropicProvider } from './providers/anthropic';
import type { LLMOptions, LLMProvider } from './types';

/**
 * Supported LLM provider types
 */
export type ProviderType = 'anthropic' | 'openai' | 'mistral'; // Add more as needed

/**
 * Configuration for creating an LLM provider
 */
export interface LLMConfig {
  /** Type of provider to create */
  provider: ProviderType;
  /** API key for the provider */
  apiKey: string;
  /** Model to use */
  model?: string;
  /** Additional provider-specific options */
  options?: Record<string, unknown>;
}

/**
 * Get the API key from environment variables based on provider type
 * @param provider The provider type
 * @returns The API key or undefined if not found
 */
export function getApiKeyFromEnv(provider: ProviderType): string | undefined {
  const envVarMap: Record<ProviderType, string> = {
    anthropic: 'ANTHROPIC_API_KEY',
    openai: 'OPENAI_API_KEY',
    mistral: 'MISTRAL_API_KEY',
  };

  const envVar = envVarMap[provider];
  return process.env[envVar];
}

/**
 * Create an LLM provider based on configuration
 * @param config Provider configuration
 * @returns An LLM provider instance
 */
export function createLLMProvider(config: LLMConfig): LLMProvider {
  const { provider, apiKey, model, options } = config;

  // Common options for all providers
  const commonOptions: LLMOptions = {
    apiKey,
    model: model || '', // Default model will be set by the provider
    ...options,
  };

  switch (provider) {
    case 'anthropic':
      return new AnthropicProvider(commonOptions);

    // Add more providers here as they're implemented
    // case 'openai':
    //   return new OpenAIProvider(commonOptions);

    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}

/**
 * Create an LLM provider using environment variables for configuration
 * @param provider The provider type to create
 * @param model Optional model name to use
 * @param options Additional provider-specific options
 * @returns An LLM provider instance
 * @throws Error if the required API key is not found in environment variables
 */
export function createLLMProviderFromEnv(
  provider: ProviderType,
  model?: string,
  options?: Record<string, unknown>,
): LLMProvider {
  const apiKey = getApiKeyFromEnv(provider);

  if (!apiKey) {
    throw new Error(
      `API key for ${provider} not found in environment variables. ` +
        `Please set the ${
          provider === 'anthropic'
            ? 'ANTHROPIC_API_KEY'
            : provider === 'openai'
              ? 'OPENAI_API_KEY'
              : `API key for ${provider}`
        } environment variable.`,
    );
  }

  return createLLMProvider({
    provider,
    apiKey,
    model,
    options,
  });
}
