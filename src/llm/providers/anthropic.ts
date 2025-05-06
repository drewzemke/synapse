/**
 * Anthropic LLM provider using Vercel AI SDK
 */

import { anthropic, createAnthropic } from '@ai-sdk/anthropic';
import { generateText, streamText } from 'ai';
import type { LLMOptions, LLMProvider, LLMResponse, TokenUsage } from '../types';

/**
 * Anthropic-specific LLM options
 */
export interface AnthropicOptions extends LLMOptions {
  /** Base URL for the Anthropic API */
  baseURL?: string;
}

/**
 * Default model to use if none specified
 */
const DEFAULT_MODEL = 'claude-3-opus-20240229';

/**
 * Anthropic LLM provider implementation
 */
export class AnthropicProvider implements LLMProvider {
  private options: AnthropicOptions;
  private provider: ReturnType<typeof createAnthropic>;
  private lastUsage?: TokenUsage;

  /**
   * Create a new Anthropic provider
   * @param options Provider options
   */
  constructor(options: AnthropicOptions) {
    this.options = {
      ...options,
      model: options.model || DEFAULT_MODEL,
    };

    // Create the Anthropic provider with the API key
    this.provider = createAnthropic({
      apiKey: this.options.apiKey,
      baseURL: this.options.baseURL,
    });
  }

  /**
   * Generate text from Anthropic
   * @param prompt The prompt to send to the LLM
   * @param options Additional options for generation
   */
  async generateText(prompt: string, options?: Partial<AnthropicOptions>): Promise<LLMResponse> {
    const mergedOptions = { ...this.options, ...options };

    const result = await generateText({
      model: this.provider(mergedOptions.model),
      maxTokens: mergedOptions.maxTokens,
      temperature: mergedOptions.temperature,
      prompt,
    });

    // Note: Vercel AI SDK with Anthropic doesn't provide token usage info directly
    // This is a placeholder for future implementation
    this.lastUsage = {
      // These would be populated with actual values if available
      promptTokens: undefined,
      completionTokens: undefined,
      totalTokens: undefined,
    };

    return {
      text: result.text,
      metadata: {
        model: mergedOptions.model,
        usage: this.lastUsage,
      },
    };
  }

  /**
   * Stream text from Anthropic
   * @param prompt The prompt to send to the LLM
   * @param options Additional options for generation
   * @param onToken Optional callback for each token
   */
  async *streamText(
    prompt: string,
    options?: Partial<AnthropicOptions>,
    onToken?: (token: string) => void,
  ): AsyncIterable<string> {
    const mergedOptions = { ...this.options, ...options };

    const result = streamText({
      model: this.provider(mergedOptions.model),
      maxTokens: mergedOptions.maxTokens,
      temperature: mergedOptions.temperature,
      prompt,
    });

    // Note: Vercel AI SDK with Anthropic doesn't provide token usage info directly
    // This is a placeholder for future implementation
    this.lastUsage = {
      // These would be populated with actual values if available
      promptTokens: undefined,
      completionTokens: undefined,
      totalTokens: undefined,
    };

    for await (const chunk of result.textStream) {
      if (onToken) {
        onToken(chunk);
      }
      yield chunk;
    }
  }

  /**
   * Get token usage information from the last request if available
   * Note: Vercel AI SDK with Anthropic doesn't provide token usage info directly
   */
  getUsage(): TokenUsage | undefined {
    return this.lastUsage;
  }
}
