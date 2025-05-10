import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Message } from '../conversation/types';
import {
  type ProviderType,
  createLLMProvider,
  createLLMProviderFromEnv,
  getApiKeyFromEnv,
} from './factory';
import { type LLMProvider, LLMResponse } from './types';

// Mock implementation for the LLM provider to avoid actual API calls
vi.mock('./providers/anthropic', () => {
  const mockGenerateText = vi.fn().mockImplementation(async (messages: Message[]) => {
    // Extract the last user message
    const lastUserMessage = [...messages].reverse().find((msg) => msg.role === 'user');
    const prompt = lastUserMessage?.content || 'No user message';

    return {
      text: `Mock response to: ${prompt}`,
      metadata: {
        model: 'mock-model',
        usage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30,
        },
      },
    };
  });

  const mockStreamText = vi.fn().mockImplementation(function* (
    messages: Message[],
    _options,
    onToken,
  ) {
    // Extract the last user message
    const lastUserMessage = [...messages].reverse().find((msg) => msg.role === 'user');
    const prompt = lastUserMessage?.content || 'No user message';

    const chunks = ['Mock', ' streamed', ' response', ' to:', ` ${prompt}`];
    for (const chunk of chunks) {
      if (onToken) {
        onToken(chunk);
      }
      yield chunk;
    }
  });

  return {
    AnthropicProvider: vi.fn().mockImplementation(() => ({
      generateText: mockGenerateText,
      streamText: mockStreamText,
      getUsage: () => ({
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      }),
    })),
  };
});

describe('LLM Integration', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('End-to-end LLM flow', () => {
    let provider: LLMProvider;

    beforeEach(() => {
      provider = createLLMProvider({
        provider: 'anthropic',
        apiKey: 'test-key',
        model: 'claude-test',
      });
    });

    it('successfully generates text', async () => {
      const messages: Message[] = [{ role: 'user', content: 'Test prompt' }];
      const response = await provider.generateText(messages);

      expect(response).toBeDefined();
      expect(response.text).toContain('Mock response to: Test prompt');
      expect(response.metadata).toBeDefined();
      expect(response.metadata?.model).toBeDefined();
      expect(response.metadata?.usage).toBeDefined();
    });

    it('successfully streams text', async () => {
      const messages: Message[] = [{ role: 'user', content: 'Stream test' }];
      const stream = provider.streamText(messages);
      const chunks: string[] = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(5);
      expect(chunks.join('')).toContain('Mock streamed response to: Stream test');
    });

    it('calls onToken callback when streaming', async () => {
      const messages: Message[] = [{ role: 'user', content: 'Callback test' }];
      const onToken = vi.fn();
      const stream = provider.streamText(messages, {}, onToken);

      for await (const _chunk of stream) {
        // Just consume the stream
      }

      expect(onToken).toHaveBeenCalled();
    });
  });

  describe('Environment-based provider creation', () => {
    it('creates provider from environment variables', () => {
      const provider = createLLMProviderFromEnv('anthropic');

      expect(provider).toBeDefined();
    });

    it('passes model and options to provider', async () => {
      const provider = createLLMProviderFromEnv('anthropic', 'claude-custom', {
        temperature: 0.7,
      });

      const messages: Message[] = [{ role: 'user', content: 'Test with options' }];
      const response = await provider.generateText(messages);

      expect(response).toBeDefined();
      expect(response.text).toContain('Mock response to: Test with options');
    });

    it('throws error when API key is missing', () => {
      process.env.ANTHROPIC_API_KEY = undefined;

      expect(() => createLLMProviderFromEnv('anthropic')).toThrow(
        'API key for anthropic not found in environment variables',
      );
    });
  });

  describe('Different provider types', () => {
    it('throws error for unsupported providers', () => {
      expect(() =>
        createLLMProvider({
          provider: 'unsupported' as unknown as ProviderType,
          apiKey: 'test-key',
        }),
      ).toThrow('Unsupported LLM provider');
    });
  });
});
