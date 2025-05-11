/**
 * Factory for creating LLM providers
 */

import { createAnthropic } from '@ai-sdk/anthropic';
import type { LanguageModel } from 'ai';
import { LLM } from '.';
import type { Model } from '../config';

// TODO: move this elsewhere
export type ProviderType = 'anthropic' | 'openai'; // Add more as needed

/**
 * Get the API key from environment variables based on provider type
 * @param provider The provider type
 * @returns The API key or undefined if not found
 */
export function getApiKeyFromEnv(provider: ProviderType): string | undefined {
  const envVarMap: Record<ProviderType, string> = {
    anthropic: 'ANTHROPIC_API_KEY',
    openai: 'OPENAI_API_KEY',
  };

  const envVar = envVarMap[provider];
  return process.env[envVar];
}

/**
 * Create an LLM provider using environment variables for configuration
 * @param provider The provider type to create
 * @param model Optional model name to use
 * @returns An LLM provider instance
 * @throws Error if the required API key is not found in environment variables
 */
export function createLLMFromEnv(modelSpec: Model): LLM {
  const { provider, modelStr } = modelSpec;
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

  let model: LanguageModel;

  switch (provider) {
    case 'anthropic': {
      const anthropic = createAnthropic({ apiKey });
      model = anthropic(modelStr);
      break;
    }

    // Add more providers here as they're implemented
    // case 'openai':
    //   ...

    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }

  return new LLM(model);
}
