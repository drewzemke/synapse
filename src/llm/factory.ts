/**
 * Factory for creating LLM providers
 */

import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import type { LanguageModel } from 'ai';
import { LLM } from '.';
import type { ModelSpec } from '../config';

type ProviderNeedingApiKey = Exclude<ModelSpec['provider'], 'bedrock'>;

/**
 * Get the API key from environment variables based on provider type
 * @param provider The provider type
 * @returns The API key or undefined if not found
 */
export function getApiKeyFromEnv(provider: ProviderNeedingApiKey): string | undefined {
  const envVarMap: Record<ProviderNeedingApiKey, string> = {
    anthropic: 'ANTHROPIC_API_KEY',
    openai: 'OPENAI_API_KEY',
    openrouter: 'OPENROUTER_API_KEY',
  };

  const envVarKey = envVarMap[provider];
  const apiKey = process.env[envVarKey];

  if (!apiKey) {
    throw new Error(
      `API key for provider '${provider}' not found in environment variables. Please set the '${envVarKey}' environment variable.`,
    );
  }

  return apiKey;
}

/**
 * Create an LLM provider using environment variables for configuration
 * @param provider The provider type to create
 * @param model Optional model name to use
 * @returns An LLM provider instance
 * @throws Error if the required API key is not found in environment variables
 */
export function createLLMFromEnv(modelSpec: ModelSpec): LLM {
  const { provider, modelStr } = modelSpec;

  let model: LanguageModel;

  switch (provider) {
    case 'anthropic': {
      const apiKey = getApiKeyFromEnv(provider);
      const anthropic = createAnthropic({ apiKey });
      model = anthropic(modelStr);
      break;
    }

    case 'openai': {
      const apiKey = getApiKeyFromEnv(provider);
      const openai = createOpenAI({ apiKey, compatibility: 'strict' });
      model = openai(modelStr);
      break;
    }

    case 'openrouter': {
      const apiKey = getApiKeyFromEnv(provider);
      const openrouter = createOpenRouter({ apiKey });
      model = openrouter.chat(modelStr);
      break;
    }

    case 'bedrock': {
      const bedrock = createAmazonBedrock({
        credentialProvider: fromNodeProviderChain(),
        region: modelSpec.aws_region,
      });
      model = bedrock(modelStr);
      break;
    }

    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }

  return new LLM(model);
}
