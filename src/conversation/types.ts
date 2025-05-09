/**
 * Types and interfaces for conversation management
 */

/**
 * Message represents a single message in a conversation
 */
export interface Message {
  /** Role of the message sender (system, user, assistant) */
  role: 'system' | 'user' | 'assistant';
  /** Content of the message */
  content: string;
}

/**
 * Conversation represents a complete conversation with the LLM
 */
export interface Conversation extends Record<string, unknown> {
  /** Profile used for the conversation */
  profile: string;
  /** Temperature setting for the conversation */
  temperature: number;
  /** Array of messages in the conversation */
  messages: Message[];
}
