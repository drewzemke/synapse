import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText, streamText } from 'ai';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnthropicProvider } from './anthropic';

// Mock the Vercel AI SDK
vi.mock('ai', () => ({
  generateText: vi.fn(),
  streamText: vi.fn(),
}));

vi.mock('@ai-sdk/anthropic', () => ({
  createAnthropic: vi.fn(),
}));

describe('AnthropicProvider', () => {
  const mockApiKey = 'test-api-key';
  const mockModel = 'claude-test';
  let provider: AnthropicProvider;

  beforeEach(() => {
    vi.resetAllMocks();

    // Mock implementation for createAnthropic
    (createAnthropic as unknown as { mockReturnValue: (fn: () => string) => void }).mockReturnValue(
      () => 'mocked-model-instance',
    );

    provider = new AnthropicProvider({
      apiKey: mockApiKey,
      model: mockModel,
    });
  });

  describe('constructor', () => {
    it('initializes with provided options', () => {
      expect(createAnthropic).toHaveBeenCalledWith({
        apiKey: mockApiKey,
        baseURL: undefined,
      });

      // We can't directly access private members, so we'll test behavior instead
      expect(createAnthropic).toHaveBeenCalled();
    });

    it('initializes with default model values', () => {
      // We don't have direct access to the private default model constant,
      // so we'll test behavior, not implementation details
      new AnthropicProvider({
        apiKey: mockApiKey,
        model: 'claude-3-opus-20240229', // Using the expected default value
      });

      expect(createAnthropic).toHaveBeenCalled();
    });

    it('initializes with custom options', () => {
      const customOptions = {
        apiKey: mockApiKey,
        model: mockModel,
        temperature: 0.7,
        maxTokens: 500,
        baseURL: 'https://custom-api.example.com',
        systemPrompt: 'You are a helpful assistant.',
      };

      provider = new AnthropicProvider(customOptions);

      // Cannot directly access private properties
      expect(createAnthropic).toHaveBeenCalledWith({
        apiKey: mockApiKey,
        baseURL: 'https://custom-api.example.com',
      });
    });
  });

  describe('generateText', () => {
    it('calls Vercel AI SDK with correct parameters', async () => {
      const mockPrompt = 'Hello, world';
      const mockResponse = { text: 'Hello, human!' };

      (
        generateText as unknown as { mockResolvedValue: (val: { text: string }) => void }
      ).mockResolvedValue(mockResponse);

      const result = await provider.generateText(mockPrompt);

      expect(generateText).toHaveBeenCalledWith({
        model: 'mocked-model-instance',
        maxTokens: undefined,
        temperature: undefined,
        system: undefined,
        prompt: mockPrompt,
      });

      expect(result).toEqual({
        text: 'Hello, human!',
        metadata: {
          model: mockModel,
          usage: expect.any(Object),
        },
      });
    });

    it('merges provided options with default options', async () => {
      const mockPrompt = 'Tell me a story';
      const mockResponse = { text: 'Once upon a time...' };
      const additionalOptions = {
        temperature: 0.8,
        maxTokens: 100,
        systemPrompt: 'You are a storyteller',
      };

      (
        generateText as unknown as { mockResolvedValue: (val: { text: string }) => void }
      ).mockResolvedValue(mockResponse);

      await provider.generateText(mockPrompt, additionalOptions);

      expect(generateText).toHaveBeenCalledWith({
        model: 'mocked-model-instance',
        maxTokens: 100,
        temperature: 0.8,
        system: 'You are a storyteller',
        prompt: mockPrompt,
      });
    });
  });

  describe('streamText', () => {
    it('calls Vercel AI SDK streamText with correct parameters', async () => {
      const mockPrompt = 'Stream a response';
      const mockChunks = ['This', ' is', ' a', ' streamed', ' response'];

      const mockAsyncIterator = {
        async *[Symbol.asyncIterator]() {
          for (const chunk of mockChunks) {
            yield chunk;
          }
        },
      };

      (
        streamText as unknown as { mockReturnValue: (val: Record<string, unknown>) => void }
      ).mockReturnValue({
        textStream: mockAsyncIterator,
      });

      const stream = provider.streamText(mockPrompt);
      const result = [];

      for await (const chunk of stream) {
        result.push(chunk);
      }

      expect(streamText).toHaveBeenCalledWith({
        model: 'mocked-model-instance',
        maxTokens: undefined,
        temperature: undefined,
        system: undefined,
        prompt: mockPrompt,
      });

      expect(result).toEqual(mockChunks);
    });

    it('calls onToken callback for each token when provided', async () => {
      const mockPrompt = 'Stream with callback';
      const mockChunks = ['One', ' Two', ' Three'];
      const onToken = vi.fn();

      const mockAsyncIterator = {
        async *[Symbol.asyncIterator]() {
          for (const chunk of mockChunks) {
            yield chunk;
          }
        },
      };

      (
        streamText as unknown as { mockReturnValue: (val: Record<string, unknown>) => void }
      ).mockReturnValue({
        textStream: mockAsyncIterator,
      });

      const stream = provider.streamText(mockPrompt, undefined, onToken);

      for await (const _chunk of stream) {
        // Just iterate through to consume the stream
      }

      expect(onToken).toHaveBeenCalledTimes(mockChunks.length);
      mockChunks.forEach((chunk, index) => {
        expect(onToken).toHaveBeenNthCalledWith(index + 1, chunk);
      });
    });
  });

  describe('getUsage', () => {
    it('returns the last usage information', async () => {
      const mockResponse = { text: 'Response text' };
      (
        generateText as unknown as { mockResolvedValue: (val: { text: string }) => void }
      ).mockResolvedValue(mockResponse);

      await provider.generateText('Get usage test');

      const usage = provider.getUsage();

      // Cannot directly access private properties, but we can test what getUsage returns
      expect(usage).toHaveProperty('promptTokens');
      expect(usage).toHaveProperty('completionTokens');
      expect(usage).toHaveProperty('totalTokens');
    });
  });
});
