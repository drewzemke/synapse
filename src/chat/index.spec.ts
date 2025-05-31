/** biome-ignore-all lint/suspicious/noExplicitAny: any is okay in test file */

import * as readline from 'node:readline';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SynapseApp } from '../app';
import { streamWithCodeColor } from '../color/stream';
import { ConfigManager } from '../config';
import { addMessageToConversation, type Conversation, saveConversation } from '../conversation';
import type { LLM } from '../llm';
import { startChatSession } from '.';

// Mock modules
vi.mock('node:readline', () => ({
  createInterface: vi.fn(),
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

vi.mock('../color/stream', () => ({
  streamWithCodeColor: vi.fn(),
}));

vi.mock('../cli/spinner', () => ({
  startSpinner: vi.fn(),
  stopSpinner: vi.fn(),
}));

// Create a simple mock that always returns the same object
vi.mock('./commands', () => ({
  CommandRegistry: vi.fn(() => ({
    registerCommand: vi.fn(),
    getCommand: vi.fn(),
    getCompletions: vi.fn(() => []),
    getBuiltInCommands: vi.fn(() => ({
      help: { name: 'help', description: 'Show help', execute: vi.fn() },
      exit: { name: 'exit', description: 'Exit', execute: vi.fn() },
      convo: { name: 'convo', description: 'Show conversation', execute: vi.fn() },
      copy: { name: 'copy', description: 'Copy last response', execute: vi.fn() },
    })),
    getAllCommands: vi.fn(() => []),
    updateConversation: vi.fn(),
    clear: vi.fn(),
  })),
}));

describe('chat module', () => {
  const mockLLM: LLM = {
    streamText: vi.fn(),
    generateText: vi.fn(),
    getUsage: vi.fn(),
  } as unknown as LLM;

  const mockConversation: Conversation = {
    profile: 'default',
    temperature: 0.7,
    messages: [],
  };

  const mockConfig: ConfigManager = new ConfigManager();

  beforeEach(() => {
    vi.resetAllMocks();
    (streamWithCodeColor as any).mockResolvedValue('This is a mock LLM response');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates a readline interface with completer when starting chat session', async () => {
    // Mock the readline interface
    const mockRl = {
      prompt: vi.fn(),
      on: vi.fn(),
      close: vi.fn(),
    };

    vi.mocked(readline.createInterface).mockReturnValue(mockRl as any);

    // Make the 'on' method immediately call close when 'close' event is registered
    mockRl.on.mockImplementation((event: string, handler: any) => {
      if (event === 'close') {
        // Immediately call the close handler to end the session
        setTimeout(() => handler(), 0);
      }
    });

    const app = new SynapseApp(mockLLM, mockConversation, mockConfig, { _: [], $0: '' });
    await startChatSession(app, false);

    expect(readline.createInterface).toHaveBeenCalledWith({
      input: process.stdin,
      output: process.stdout,
      prompt: expect.any(String),
      completer: expect.any(Function),
    });
  });

  it('processes user inputs and gets responses from LLM', async () => {
    const mockUpdatedConversation = {
      ...mockConversation,
      messages: [{ role: 'user', content: 'Hello, LLM!' }],
    };

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

    const mockRl = {
      prompt: vi.fn(),
      on: vi.fn(),
      close: vi.fn(),
    };

    vi.mocked(readline.createInterface).mockReturnValue(mockRl as any);

    let lineHandler: any;
    let closeHandler: any;

    mockRl.on.mockImplementation((event: string, handler: any) => {
      if (event === 'line') {
        lineHandler = handler;
      } else if (event === 'close') {
        closeHandler = handler;
      }
    });

    const app = new SynapseApp(mockLLM, mockConversation, mockConfig, { _: [], $0: '' });
    const chatPromise = startChatSession(app, false);

    // Wait for setup to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Simulate user input
    if (lineHandler) {
      await lineHandler('Hello, LLM!');
    }

    // End the session
    if (closeHandler) {
      closeHandler();
    }

    await chatPromise;

    expect(addMessageToConversation).toHaveBeenCalledWith(
      expect.any(Object),
      'user',
      'Hello, LLM!',
    );
    expect(streamWithCodeColor).toHaveBeenCalled();
    expect(saveConversation).toHaveBeenCalled();
  });

  it('handles empty input gracefully', async () => {
    const mockRl = {
      prompt: vi.fn(),
      on: vi.fn(),
      close: vi.fn(),
    };

    vi.mocked(readline.createInterface).mockReturnValue(mockRl as any);

    let lineHandler: any;
    let closeHandler: any;

    mockRl.on.mockImplementation((event: string, handler: any) => {
      if (event === 'line') {
        lineHandler = handler;
      } else if (event === 'close') {
        closeHandler = handler;
      }
    });

    const app = new SynapseApp(mockLLM, mockConversation, mockConfig, { _: [], $0: '' });
    const chatPromise = startChatSession(app, false);

    // Wait for setup to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Simulate empty input
    if (lineHandler) {
      await lineHandler('');
    }

    // End the session
    if (closeHandler) {
      closeHandler();
    }

    await chatPromise;

    // Should not process empty input
    expect(addMessageToConversation).not.toHaveBeenCalled();
    expect(streamWithCodeColor).not.toHaveBeenCalled();
  });
});
