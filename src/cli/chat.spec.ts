/** biome-ignore-all lint/suspicious/noExplicitAny: any is okay in test file */

import * as readline from 'node:readline';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addMessageToConversation,
  type Conversation,
  loadLastConversation,
  saveConversation,
} from '../conversation';
import { createLLMFromEnv } from '../llm';
import { startChatSession } from './chat';
import { streamWithCodeColor } from './color/stream';
import { executeCommand } from './commands';

// Mock modules
vi.mock('node:readline', () => ({
  createInterface: vi.fn().mockReturnValue({
    prompt: vi.fn(),
    on: vi.fn(),
    close: vi.fn(),
  }),
}));

vi.mock('chalk', () => ({
  default: {
    blue: vi.fn((text) => text),
    cyan: vi.fn((text) => text),
    green: vi.fn((text) => text),
    magenta: vi.fn((text) => text),
  },
}));

vi.mock('ansi-escapes', () => ({
  clearScreen: 'mock-clear-screen',
}));

vi.mock('../conversation', () => ({
  addMessageToConversation: vi.fn(),
  loadLastConversation: vi.fn(),
  saveConversation: vi.fn(),
}));

vi.mock('./color/stream', () => ({
  streamWithCodeColor: vi.fn(),
}));

vi.mock('./spinner', () => ({
  startSpinner: vi.fn(),
  stopSpinner: vi.fn(),
}));

vi.mock('../llm', () => ({
  createLLMFromEnv: vi.fn().mockReturnValue({
    streamText: vi.fn(),
    generateText: vi.fn(),
  }),
}));

vi.mock('./commands', () => ({
  registerBuiltInCommands: vi.fn(),
  executeCommand: vi.fn(),
}));

describe('chat module', () => {
  const mockReadlineInstance = {
    prompt: vi.fn(),
    on: vi.fn(),
    close: vi.fn(),
  };

  const mockLLM = {
    streamText: vi.fn(),
    generateText: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (readline.createInterface as any).mockReturnValue(mockReadlineInstance);
    (createLLMFromEnv as any).mockReturnValue(mockLLM);
    (streamWithCodeColor as any).mockResolvedValue('This is a mock LLM response');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates a readline interface with completer when starting chat session', async () => {
    const startChatPromise = startChatSession();

    // Simulate 'close' event to resolve the promise
    const closeHandler = mockReadlineInstance.on.mock.calls.find(
      (call) => call[0] === 'close',
    )?.[1];
    closeHandler();

    await startChatPromise;

    expect(readline.createInterface).toHaveBeenCalledWith({
      input: process.stdin,
      output: process.stdout,
      prompt: expect.any(String),
      completer: expect.any(Function),
    });
  });

  // FIXME: this test fails because the mocking needs improvement
  it.skip('processes user inputs and gets responses from LLM', async () => {
    const mockConversation = {
      profile: 'default',
      temperature: 1.0,
      messages: [],
    };

    const mockUpdatedConversation = {
      ...mockConversation,
      messages: [{ role: 'user', content: 'Hello, LLM!' }],
    };

    (loadLastConversation as any).mockReturnValue(mockConversation);
    (addMessageToConversation as any).mockImplementation(
      (_conv: Conversation, role: 'user' | 'assistant', content: string) => {
        if (role === 'user') {
          return mockUpdatedConversation;
        }
        return {
          ...mockUpdatedConversation,
          messages: [...mockUpdatedConversation.messages, { role: 'assistant', content }],
        };
      },
    );

    const startChatPromise = startChatSession();

    // Find the line handler
    const lineHandler = mockReadlineInstance.on.mock.calls.find((call) => call[0] === 'line')?.[1];

    // Simulate user input
    await lineHandler('Hello, LLM!');

    // Simulate 'close' event to resolve the promise
    const closeHandler = mockReadlineInstance.on.mock.calls.find(
      (call) => call[0] === 'close',
    )?.[1];
    closeHandler();

    await startChatPromise;

    // First call - user message
    expect(addMessageToConversation).toHaveBeenNthCalledWith(
      1,
      expect.any(Object),
      'user',
      'Hello, LLM!',
    );

    expect(streamWithCodeColor).toHaveBeenCalled();

    // Second call - assistant response
    expect(addMessageToConversation).toHaveBeenNthCalledWith(
      2,
      expect.any(Object),
      'assistant',
      'This is a mock LLM response',
    );

    expect(saveConversation).toHaveBeenCalled();
  });

  it('handles CTRL+C (SIGINT) correctly', async () => {
    const startChatPromise = startChatSession();

    // Find the SIGINT handler
    const sigintHandler = mockReadlineInstance.on.mock.calls.find(
      (call) => call[0] === 'SIGINT',
    )?.[1];

    // Simulate SIGINT (CTRL+C)
    sigintHandler();

    expect(mockReadlineInstance.close).toHaveBeenCalled();

    // Simulate 'close' event to resolve the promise
    const closeHandler = mockReadlineInstance.on.mock.calls.find(
      (call) => call[0] === 'close',
    )?.[1];
    closeHandler();

    await startChatPromise;
  });

  it('processes slash commands correctly', async () => {
    (executeCommand as any).mockReturnValue(true);
    const startChatPromise = startChatSession();

    // Find the line handler
    const lineHandler = mockReadlineInstance.on.mock.calls.find((call) => call[0] === 'line')?.[1];

    // Simulate user typing a command
    await lineHandler('/help');

    expect(executeCommand).toHaveBeenCalledWith('help', expect.any(Object));

    // Should not try to process as regular input
    expect(addMessageToConversation).not.toHaveBeenCalled();

    // Simulate 'close' event to resolve the promise
    const closeHandler = mockReadlineInstance.on.mock.calls.find(
      (call) => call[0] === 'close',
    )?.[1];
    closeHandler();

    await startChatPromise;
  });

  it('handles unknown commands', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    (executeCommand as any).mockReturnValue(false);

    const startChatPromise = startChatSession();

    // Find the line handler
    const lineHandler = mockReadlineInstance.on.mock.calls.find((call) => call[0] === 'line')?.[1];

    // Simulate user typing an unknown command
    await lineHandler('/unknown');

    expect(executeCommand).toHaveBeenCalledWith('unknown', expect.any(Object));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown command'));

    // Simulate 'close' event to resolve the promise
    const closeHandler = mockReadlineInstance.on.mock.calls.find(
      (call) => call[0] === 'close',
    )?.[1];
    closeHandler();

    await startChatPromise;
    consoleLogSpy.mockRestore();
  });
});
