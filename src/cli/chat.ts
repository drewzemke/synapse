/**
 * Interactive chat functionality
 */

import { createInterface } from 'node:readline';
import {
  addMessageToConversation,
  type Conversation,
  loadLastConversation,
  saveConversation,
} from '../conversation';
import { createLLMFromEnv, type LLM } from '../llm';
import { streamWithCodeColor } from './color/stream';
import { startSpinner, stopSpinner } from './spinner';

/**
 * Start an interactive chat session
 *
 * @param initialPrompt - Optional initial prompt to start the conversation
 * @param extendConversation - Whether to continue from the last conversation
 */
export async function startChatSession(
  initialPrompt?: string,
  extendConversation = false,
): Promise<void> {
  // Create readline interface for user input
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  });

  // Initialize the conversation
  let conversation: Conversation;
  const llm = createLLMFromEnv({ provider: 'anthropic', modelStr: 'claude-3-sonnet-20240229' }); // Default model

  if (extendConversation) {
    // Load the previous conversation if available
    const lastConversation = loadLastConversation();
    if (!lastConversation) {
      console.log('No previous conversation found. Starting a new conversation.');
      conversation = createNewConversation();
    } else {
      conversation = lastConversation;
      console.log('Continuing previous conversation.');
    }
  } else {
    // Start a new conversation
    conversation = createNewConversation();
  }

  // If an initial prompt is provided, process it
  if (initialPrompt) {
    await processUserInput(initialPrompt, llm, conversation);
  }

  // Set up the chat loop
  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();

    // Check for exit commands
    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      rl.close();
      return;
    }

    if (input) {
      // Load the latest conversation before processing, since it might have been updated
      const latestConversation = loadLastConversation() || conversation;
      await processUserInput(input, llm, latestConversation);
    }

    rl.prompt();
  });

  // Handle CTRL+C for proper exit
  rl.on('SIGINT', () => {
    console.log('\nExiting chat.');
    rl.close();
  });

  rl.on('close', () => {
    console.log('Chat session ended.');
    // Don't call process.exit() during tests
    if (process.env.NODE_ENV !== 'test') {
      process.exit(0);
    }
  });
}

/**
 * Process user input, send to LLM and display response
 */
async function processUserInput(
  input: string,
  llm: LLM,
  conversationParam: Conversation,
): Promise<void> {
  // Add user message to conversation
  let updatedConversation = addMessageToConversation(conversationParam, 'user', input);

  // Start spinner while waiting for response
  startSpinner();

  try {
    // Get response from LLM and update conversation
    const response = await streamWithCodeColor(llm, updatedConversation);
    updatedConversation = addMessageToConversation(updatedConversation, 'assistant', response);

    // Save updated conversation
    saveConversation(updatedConversation);
  } catch (error) {
    stopSpinner();
    console.error(
      'Error getting response:',
      error instanceof Error ? error.message : String(error),
    );
  }

  console.log(''); // Add a blank line after response for readability
}

/**
 * Create a new conversation
 */
function createNewConversation(): Conversation {
  return {
    profile: 'default',
    temperature: 1.0,
    messages: [],
  };
}
