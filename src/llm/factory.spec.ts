import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type ProviderType,
  createLLMProvider,
  createLLMProviderFromEnv,
  getApiKeyFromEnv,
} from './factory';
import { AnthropicProvider } from './providers/anthropic';

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

    it('returns the correct API key for Mistral', () => {
      process.env.MISTRAL_API_KEY = 'test-mistral-key';
      expect(getApiKeyFromEnv('mistral')).toBe('test-mistral-key');
    });

    it('returns undefined when API key is not set', () => {
      process.env.ANTHROPIC_API_KEY = undefined;
      expect(getApiKeyFromEnv('anthropic')).toBeUndefined();
    });
  });

  describe('createLLMProvider', () => {
    it('creates an AnthropicProvider with the provided config', () => {
      const provider = createLLMProvider({
        provider: 'anthropic',
        apiKey: 'test-key',
        model: 'claude-3-opus',
      });

      expect(provider).toBeInstanceOf(AnthropicProvider);
    });

    it('throws an error for unsupported providers', () => {
      expect(() =>
        createLLMProvider({
          provider: 'unsupported' as unknown as ProviderType,
          apiKey: 'test-key',
        }),
      ).toThrow('Unsupported LLM provider: unsupported');
    });

    it('passes options to the provider', () => {
      // Reset mock between tests
      vi.clearAllMocks();

      createLLMProvider({
        provider: 'anthropic',
        apiKey: 'test-key',
        model: 'claude-3-opus',
        options: {
          temperature: 0.5,
          maxTokens: 1000,
        },
      });

      // Verify the AnthropicProvider constructor was called with expected options
      expect(AnthropicProvider).toHaveBeenCalledWith(
        expect.objectContaining({
          apiKey: 'test-key',
          model: 'claude-3-opus',
          temperature: 0.5,
          maxTokens: 1000,
        }),
      );
    });
  });

  describe('createLLMProviderFromEnv', () => {
    it('creates a provider using environment variables', () => {
      process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';

      const provider = createLLMProviderFromEnv('anthropic', 'claude-3-opus');

      expect(provider).toBeInstanceOf(AnthropicProvider);
    });

    it('throws error when API key is not in environment', () => {
      process.env.ANTHROPIC_API_KEY = undefined;

      expect(() => createLLMProviderFromEnv('anthropic')).toThrow(
        'API key for anthropic not found in environment variables',
      );
    });

    it('passes model and options to the provider', () => {
      process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';

      // Reset mock between tests
      vi.clearAllMocks();

      createLLMProviderFromEnv('anthropic', 'claude-3-opus', {
        temperature: 0.7,
      });

      // Verify the AnthropicProvider constructor was called with expected options
      expect(AnthropicProvider).toHaveBeenCalledWith(
        expect.objectContaining({
          apiKey: 'test-anthropic-key',
          model: 'claude-3-opus',
          temperature: 0.7,
        }),
      );
    });
  });
});
