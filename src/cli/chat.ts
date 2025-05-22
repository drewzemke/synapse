/**
 * Interactive chat functionality
 */

import { createInterface } from 'node:readline';
import chalk from 'chalk';
import { configManager } from '../config';
import {
  addMessageToConversation,
  type Conversation,
  loadLastConversation,
  saveConversation,
} from '../conversation';
import { createLLMFromEnv, type LLM } from '../llm';
import type { SynapseArgs } from './args';
import { streamWithCodeColor } from './color/stream';
import { startSpinner, stopSpinner } from './spinner';

const PROMPT_MARKER = `${chalk.blue('⟫')}${chalk.cyan('⟫')}${chalk.green('⟫')}`;

/**
 * Start an interactive chat session
 *
 * @param initialPrompt - Optional initial prompt to start the conversation
 * @param extendConversation - Whether to continue from the last conversation
 * @param args - Command line arguments
 */
export async function startChatSession(
  initialPrompt?: string,
  extendConversation = false,
  args?: Partial<SynapseArgs>,
): Promise<void> {
  // Create readline interface for user input
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${PROMPT_MARKER} `,
  });

  // Get configuration options
  const profileName = args?.profile;
  const profile = configManager.getProfile(profileName);
  const model = configManager.getModel(args?.model);
  const printColor = configManager.resolveColorOutput(
    args?.color,
    args?.noColor,
    process.stdout.isTTY,
  );
  const verbose = args?.verbose ?? false;

  // Initialize the conversation
  let conversation: Conversation;
  const llm = createLLMFromEnv(model);

  if (extendConversation) {
    // Load the previous conversation if available
    const lastConversation = loadLastConversation();
    if (!lastConversation) {
      console.log('No previous conversation found. Starting a new conversation.');
      conversation = createNewConversation(profileName, profile.temperature);
    } else {
      conversation = lastConversation;
      const messageCount = lastConversation.messages.length;
      console.log(`Continuing previous conversation with ${messageCount} messages.`);
    }
  } else {
    // Start a new conversation
    conversation = createNewConversation(profileName, profile.temperature, profile.system_prompt);
  }

  // If an initial prompt is provided, process it
  if (initialPrompt) {
    console.log(PROMPT_MARKER, initialPrompt, '\n');
    await processUserInput(initialPrompt, llm, conversation, printColor, verbose);
    console.log('\n');
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
      console.log('');

      // Load the latest conversation before processing, since it might have been updated
      const latestConversation = loadLastConversation() || conversation;
      await processUserInput(input, llm, latestConversation, printColor, verbose);

      // Add extra line break after each message exchange
      console.log('\n');
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
  useColor = true,
  verbose = false,
): Promise<void> {
  // Add user message to conversation
  let updatedConversation = addMessageToConversation(conversationParam, 'user', input);

  // Start spinner while waiting for response
  startSpinner();

  try {
    let response: string;

    if (useColor) {
      response = await streamWithCodeColor(llm, updatedConversation);
    } else {
      response = '';
      let firstChunk = true;
      for await (const chunk of llm.streamText(updatedConversation.messages)) {
        if (firstChunk) {
          firstChunk = false;
          stopSpinner();
        }
        process.stdout.write(chunk);
        response += chunk;
      }
      console.log();
    }

    updatedConversation = addMessageToConversation(updatedConversation, 'assistant', response);

    // Save updated conversation
    saveConversation(updatedConversation);

    // Show token usage if verbose mode is enabled
    if (verbose && llm.getUsage) {
      console.log('\n------------');
      console.log('Token usage:');
      console.log(llm.getUsage());
    }
  } catch (error) {
    stopSpinner();
    console.error(
      'Error getting response:',
      error instanceof Error ? error.message : String(error),
    );
  }
}

/**
 * Create a new conversation
 */
function createNewConversation(
  profileName?: string,
  temperature = 0.7,
  systemPrompt?: string,
): Conversation {
  return {
    profile: profileName ?? 'default',
    temperature,
    messages: systemPrompt ? [{ role: 'system', content: systemPrompt }] : [],
  };
}
