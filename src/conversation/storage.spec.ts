/**
 * Tests for conversation storage functionality
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as pathUtils from '../config/paths';
import type { Conversation } from './types';

// Mock the config paths
vi.mock('../config/paths', () => {
  // Mock a temporary path for testing
  const mockConfigDir = '/tmp/synapse-test';
  const mockConversationsDir = join(mockConfigDir, 'conversations');

  return {
    getConfigPaths: vi.fn(() => ({
      configDir: mockConfigDir,
      configFile: join(mockConfigDir, 'config.toml'),
      keysFile: join(mockConfigDir, '.api-keys.toml'),
    })),
    getConversationsDir: vi.fn(() => mockConversationsDir),
  };
});

// Mock fs functions
vi.mock('node:fs', async () => {
  const actual = await vi.importActual('node:fs');
  return {
    ...actual,
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    existsSync: vi.fn(() => false),
    readFileSync: vi.fn(),
  };
});

describe('Conversation storage', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Mock conversation for testing
  const mockConversation: Conversation = {
    profile: 'default',
    temperature: 0.7,
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'How do I list files in a directory?' },
      { role: 'assistant', content: 'You can use the `ls` command.' },
    ],
  };

  describe('createConversationDirectory', () => {
    it('should create the conversations directory if it does not exist', async () => {
      // Import the module under test
      const { createConversationDirectory } = await import('./storage.js');

      // Mock existsSync to return false (directory doesn't exist)
      vi.mocked(existsSync).mockReturnValue(false);

      // Call the function
      createConversationDirectory();

      // Get the expected conversations directory path
      const conversationsDir = pathUtils.getConversationsDir();

      // Verify mkdirSync was called with the correct path and options
      expect(mkdirSync).toHaveBeenCalledWith(conversationsDir, { recursive: true });
    });

    it('should not create the directory if it already exists', async () => {
      // Import the module under test
      const { createConversationDirectory } = await import('./storage.js');

      // Mock existsSync to return true (directory exists)
      vi.mocked(existsSync).mockReturnValue(true);

      // Call the function
      createConversationDirectory();

      // Verify mkdirSync was not called
      expect(mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('saveConversation', () => {
    it('should save a conversation to the last.json file', async () => {
      // Import the module under test
      const { saveConversation } = await import('./storage.js');

      // Call the function
      saveConversation(mockConversation);

      // Get the expected file path
      const conversationsDir = pathUtils.getConversationsDir();
      const lastConversationPath = join(conversationsDir, 'last.json');

      // Verify writeFileSync was called with the correct path
      expect(writeFileSync).toHaveBeenCalledWith(lastConversationPath, expect.any(String), 'utf-8');

      // Get the JSON content that was written
      const jsonContent = vi.mocked(writeFileSync).mock.calls[0][1] as string;

      // Parse the JSON content back to an object and verify it matches the original conversation
      const parsedJson = JSON.parse(jsonContent) as Conversation;
      expect(parsedJson.profile).toBe(mockConversation.profile);
      expect(parsedJson.temperature).toBe(mockConversation.temperature);
      expect(parsedJson.messages).toHaveLength(mockConversation.messages.length);
    });
  });

  describe('loadLastConversation', () => {
    it('should return undefined if no last conversation exists', async () => {
      // Import the module under test
      const { loadLastConversation } = await import('./storage.js');

      // Mock existsSync to return false (file doesn't exist)
      vi.mocked(existsSync).mockReturnValue(false);

      // Call the function
      const result = loadLastConversation();

      // Verify the result is undefined
      expect(result).toBeUndefined();
    });

    it('should load and parse the last conversation when it exists', async () => {
      // Import the module under test
      const { loadLastConversation } = await import('./storage.js');

      // Mock existsSync to return true (file exists)
      vi.mocked(existsSync).mockReturnValue(true);

      // Mock readFileSync to return a JSON string
      const mockJson = `
{
  "profile": "default",
  "temperature": 0.7,
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "How do I list files in a directory?"
    },
    {
      "role": "assistant",
      "content": "You can use the \`ls\` command."
    }
  ]
}
`;
      vi.mocked(readFileSync).mockReturnValue(mockJson as unknown as Buffer);

      // Call the function
      const result = loadLastConversation();

      // Verify the result matches the expected conversation
      expect(result).toBeDefined();
      expect(result?.profile).toBe('default');
      expect(result?.temperature).toBe(0.7);
      expect(result?.messages).toHaveLength(3);
      expect(result?.messages[0].role).toBe('system');
      expect(result?.messages[1].role).toBe('user');
      expect(result?.messages[2].role).toBe('assistant');
    });
  });
});
