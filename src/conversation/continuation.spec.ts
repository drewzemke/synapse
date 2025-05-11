/**
 * Tests for conversation continuation functionality
 */

import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
    existsSync: vi.fn(() => false),
    readFileSync: vi.fn(),
  };
});

describe('Conversation continuation', () => {
  // Reset mocks after each test
  afterEach(() => {
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

  // Import storage functions to use their mocked versions in tests
  let storage: typeof import('./storage.js');

  beforeEach(async () => {
    storage = await import('./storage.js');
  });

  describe('Conversation continuation flow', () => {
    it('should load the last conversation when extending', async () => {
      // Setup mocks for loading conversation
      vi.spyOn(storage, 'loadLastConversation').mockReturnValue(mockConversation);

      // Import the module under test
      const { continueConversation } = await import('./continuation.js');

      // Call the function with a new user message
      const newMessage = 'How do I get it to show details?';
      const result = continueConversation(newMessage);

      // Verify the loadLastConversation was called
      expect(storage.loadLastConversation).toHaveBeenCalled();

      // Verify the returned conversation has the old and new messages
      expect(result).toBeDefined();
      expect(result.messages).toHaveLength(4); // System + original user + assistant + new user
      expect(result.messages[3].role).toBe('user');
      expect(result.messages[3].content).toBe(newMessage);
    });

    it('should start a new conversation if no last conversation exists', async () => {
      // Setup mocks for loading conversation (returns undefined)
      vi.spyOn(storage, 'loadLastConversation').mockReturnValue(undefined);

      // Import the module under test
      const { continueConversation } = await import('./continuation.js');

      // Call the function with a new user message
      const newMessage = 'How do I list files?';
      const result = continueConversation(newMessage);

      // Verify the loadLastConversation was called
      expect(storage.loadLastConversation).toHaveBeenCalled();

      // Verify a new conversation was created with just the new message
      expect(result).toBeDefined();
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].role).toBe('user');
      expect(result.messages[0].content).toBe(newMessage);
    });

    it('should preserve profile and temperature from the original conversation', async () => {
      // Setup mock conversation with custom profile and temperature
      const customConversation: Conversation = {
        profile: 'coding',
        temperature: 0.5,
        messages: [
          { role: 'user', content: 'How do I list files?' },
          { role: 'assistant', content: 'Use ls command.' },
        ],
      };

      // Setup mocks for loading conversation
      vi.spyOn(storage, 'loadLastConversation').mockReturnValue(customConversation);

      // Import the module under test
      const { continueConversation } = await import('./continuation.js');

      // Call the function with a new user message
      const newMessage = 'How do I see hidden files?';
      const result = continueConversation(newMessage);

      // Verify the profile and temperature are preserved
      expect(result.profile).toBe('coding');
      expect(result.temperature).toBe(0.5);
    });
  });
});
