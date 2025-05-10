/**
 * Functions for continuing conversations
 */

import { addMessageToConversation, loadLastConversation } from './storage';
import type { Conversation } from './types';

/**
 * Continue an existing conversation with a new user message
 *
 * @param newUserMessage - The new message to add to the conversation
 * @returns The updated conversation, or a new one if no previous conversation exists
 */
export function continueConversation(newUserMessage: string): Conversation {
  // Try to load the last conversation
  const lastConversation = loadLastConversation();

  if (lastConversation) {
    // Add the new user message to the existing conversation
    return addMessageToConversation(lastConversation, 'user', newUserMessage);
  }
  // If no previous conversation exists, create a new one with defaults
  return {
    profile: 'default',
    temperature: 0.7, // Default temperature
    messages: [{ role: 'user', content: newUserMessage }],
  };
}
