/**
 * Functions for managing conversation storage
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse, stringify } from '@std/toml';
import { getConversationsDir } from '../config/paths';
import type { Conversation } from './types';

/**
 * Create the conversations directory if it doesn't exist
 */
export function createConversationDirectory(): void {
  const conversationsDir = getConversationsDir();

  if (!existsSync(conversationsDir)) {
    mkdirSync(conversationsDir, { recursive: true });
  }
}

/**
 * Save a conversation to the last.toml file
 *
 * @param conversation - The conversation to save
 */
export function saveConversation(conversation: Conversation): void {
  // Ensure the conversations directory exists
  createConversationDirectory();

  // Convert the conversation to TOML
  const tomlContent = stringify(conversation);

  // Write to the last.toml file
  const conversationsDir = getConversationsDir();
  const lastConversationPath = join(conversationsDir, 'last.toml');

  writeFileSync(lastConversationPath, tomlContent, 'utf-8');
}

/**
 * Load the last conversation from disk
 *
 * @returns The last conversation, or undefined if none exists
 */
export function loadLastConversation(): Conversation | undefined {
  const conversationsDir = getConversationsDir();
  const lastConversationPath = join(conversationsDir, 'last.toml');

  // Check if the file exists
  if (!existsSync(lastConversationPath)) {
    return undefined;
  }

  try {
    // Read and parse the TOML file
    const tomlContent = readFileSync(lastConversationPath, 'utf-8');
    const conversation = parse(tomlContent) as Conversation;
    return conversation;
  } catch (error) {
    console.error('Error loading last conversation:', error);
    return undefined;
  }
}

/**
 * Add a new message to a conversation
 *
 * @param conversation - The conversation to update
 * @param role - The role of the message sender
 * @param content - The content of the message
 * @returns The updated conversation
 */
export function addMessageToConversation(
  conversation: Conversation,
  role: 'system' | 'user' | 'assistant',
  content: string,
): Conversation {
  return {
    ...conversation,
    messages: [...conversation.messages, { role, content }],
  };
}
