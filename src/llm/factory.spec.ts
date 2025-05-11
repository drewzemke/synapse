import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getApiKeyFromEnv } from './factory';

// Create mock for AnthropicProvider module
vi.mock('./providers/anthropic', () => {
  const mockProvider = vi.fn();
  mockProvider.prototype.generateText = vi.fn();
  mockProvider.prototype.streamText = vi.fn();
  return {
    AnthropicProvider: mockProvider,
  };
});

describe('LLM Factory', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getApiKeyFromEnv', () => {
    it('returns the correct API key for Anthropic', () => {
      process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
      expect(getApiKeyFromEnv('anthropic')).toBe('test-anthropic-key');
    });

    it('returns the correct API key for OpenAI', () => {
      process.env.OPENAI_API_KEY = 'test-openai-key';
      expect(getApiKeyFromEnv('openai')).toBe('test-openai-key');
    });

    it('throws an error when API key is not set', () => {
      process.env.ANTHROPIC_API_KEY = undefined;
      expect(() => getApiKeyFromEnv('anthropic')).toThrow();
    });
  });

  describe('createLLMProvider', () => {
    it.todo('creates an LLM object with the provided config');

    it.todo('throws an error for unsupported providers');
  });
});
