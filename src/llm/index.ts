/**
 * Main LLM module that exports all LLM-related functionality
 */

import { type LanguageModel, generateText, smoothStream, streamText } from 'ai';
import type { Message } from '../conversation';
import type { LLMOptions, TokenUsage } from './types';

// Re-export stuff
export * from './types';
export * from './factory';

/**
 * The main wrapper around an LLM connection.
 */
export class LLM {
  private lastUsage?: TokenUsage;

  constructor(private model: LanguageModel) {}

  /**
   * Generate text from the  LLM
   * @param messages Array of messages to send to the LLM
   * @param params Additional options for generation
   */
  async generateText(messages: Message[], params?: LLMOptions): Promise<string> {
    const result = await generateText({
      model: this.model,
      maxTokens: params?.maxTokens,
      temperature: params?.temperature,
      messages,
    });

    this.lastUsage = result.usage;

    return result.text;
  }

  /**
   * Generate text from the  LLM
   * @param messages Array of messages to send to the LLM
   * @param params Additional options for generation
   */
  async *streamText(messages: Message[], params?: LLMOptions): AsyncIterable<string> {
    const result = streamText({
      model: this.model,
      maxTokens: params?.maxTokens,
      temperature: params?.temperature,
      messages,
      experimental_transform: smoothStream({ delayInMs: 40 }),
      onFinish: ({ usage }) => {
        this.lastUsage = usage;
      },
    });

    for await (const chunk of result.textStream) {
      yield chunk;
    }
  }

  /**
   * Get token usage information from the last request if available
   */
  getUsage(): TokenUsage | undefined {
    return this.lastUsage;
  }
}
