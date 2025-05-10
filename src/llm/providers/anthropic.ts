/**
 * Anthropic LLM provider using Vercel AI SDK
 */

import { anthropic, createAnthropic } from '@ai-sdk/anthropic';
import { generateText, streamText } from 'ai';
import type { Message } from '../../conversation/types';
import type { LLMOptions, LLMProvider, LLMResponse, TokenUsage } from '../types';

/**
 * Anthropic-specific LLM options
 */
export interface AnthropicOptions extends LLMOptions {
  /** Base URL for the Anthropic API */
  baseURL?: string;
  /** System prompt to control the model's behavior */
  systemPrompt?: string;
}

/**
 * Default model to use if none specified
 */
const DEFAULT_MODEL = 'claude-3-7-sonnet-latest';

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
   * @param messages Array of messages to send to the LLM
   * @param options Additional options for generation
   */
  async generateText(
    messages: Message[],
    options?: Partial<AnthropicOptions>,
  ): Promise<LLMResponse> {
    const mergedOptions = { ...this.options, ...options };

    // Extract system message if present (first message with role "system")
    let systemPrompt = mergedOptions.systemPrompt;
    let userMessages: Message[] = [...messages];

    // If we have a system message in the array, use it and remove from messages
    const systemMessageIndex = messages.findIndex((msg) => msg.role === 'system');
    if (systemMessageIndex >= 0) {
      systemPrompt = messages[systemMessageIndex].content;
      // Remove system message from the array
      userMessages = [
        ...messages.slice(0, systemMessageIndex),
        ...messages.slice(systemMessageIndex + 1),
      ];
    }

    // For simple cases, just use the last user message as the prompt
    // In a real implementation, we'd convert the full message history
    const lastUserMessage = userMessages.filter((msg) => msg.role === 'user').pop();
    const prompt = lastUserMessage?.content || '';

    const result = await generateText({
      model: this.provider(mergedOptions.model),
      maxTokens: mergedOptions.maxTokens,
      temperature: mergedOptions.temperature,
      // Use the system parameter for Anthropic system prompts
      system: systemPrompt,
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
   * @param messages Array of messages to send to the LLM
   * @param options Additional options for generation
   * @param onToken Optional callback for each token
   */
  async *streamText(
    messages: Message[],
    options?: Partial<AnthropicOptions>,
    onToken?: (token: string) => void,
  ): AsyncIterable<string> {
    const mergedOptions = { ...this.options, ...options };

    // Extract system message if present (first message with role "system")
    // Fallback to the options' systemp prompt
    const systemPrompt =
      messages.find((m) => m.role === 'system')?.content ?? mergedOptions.systemPrompt;

    // Remove the system prompt from the messages
    const nonSystemMessages = messages.filter((m) => m.role !== 'system');

    const result = streamText({
      model: this.provider(mergedOptions.model),
      maxTokens: mergedOptions.maxTokens,
      temperature: mergedOptions.temperature,
      // Use the system parameter for Anthropic system prompts
      system: systemPrompt,
      messages: nonSystemMessages,
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
