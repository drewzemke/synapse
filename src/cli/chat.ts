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
import type { LLM } from '../llm';
import { streamWithCodeColor } from './color/stream';
import { CommandRegistry } from './commands';
import { PROMPT_MARKER } from './prompt-marker';
import { startSpinner, stopSpinner } from './spinner';

/**
 * Start an interactive chat session
 *
 * @param initialPrompt - Optional initial prompt to start the conversation
 * @param extendConversation - Whether to continue from the last conversation
 * @param args - Command line arguments
 */
export async function startChatSession(
  conversation: Conversation,
  llm: LLM,
  printColor: boolean,
  // FIXME: respect this config
  _streamOutput: boolean,
  verbose: boolean,
  /** If true, start processing without prompting for user input. */
  processImmediately: boolean,
): Promise<void> {
  // Create command registry with conversation reference
  const commandRegistry = new CommandRegistry(conversation);

  // Register built-in commands
  const builtInCommands = commandRegistry.getBuiltInCommands();
  for (const command of Object.values(builtInCommands)) {
    commandRegistry.registerCommand(command);
  }

  // Create readline interface for user input with command autocomplete
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${PROMPT_MARKER} `,
    completer: (line: string) => {
      if (line.startsWith('/')) {
        const commandPart = line.slice(1);
        const completions = commandRegistry.getCompletions(commandPart);
        return [completions.map((c) => `/${c}`), line];
      }
      return [[], line];
    },
  });

  // If an initial prompt is provided, process it
  if (processImmediately) {
    const initialPrompt = conversation.messages.pop()?.content;
    if (initialPrompt) {
      console.log(PROMPT_MARKER, initialPrompt, '\n');
      const updatedConversation = await processUserInput(
        initialPrompt,
        llm,
        conversation,
        printColor,
        verbose,
      );
      if (updatedConversation) {
        commandRegistry.updateConversation(updatedConversation);
      }
      console.log('\n');
    }
  }

  // Set up the chat loop
  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();

    // Handle commands that start with /
    if (input.startsWith('/')) {
      const commandName = input.slice(1).split(' ')[0];
      const command = commandRegistry.getCommand(commandName);

      if (command) {
        command.execute(rl);
      } else {
        console.log(`Unknown command: ${commandName}`);
        rl.prompt();
      }
      return;
    }

    if (input) {
      console.log('');

      // Load the latest conversation before processing, since it might have been updated
      const latestConversation = loadLastConversation() || conversation;
      const updatedConversation = await processUserInput(
        input,
        llm,
        latestConversation,
        printColor,
        verbose,
      );

      // Update the command registry with the latest conversation
      if (updatedConversation) {
        commandRegistry.updateConversation(updatedConversation);
      }

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
 * Returns the updated conversation
 */
async function processUserInput(
  input: string,
  llm: LLM,
  conversationParam: Conversation,
  useColor = true,
  verbose = false,
): Promise<Conversation | null> {
  let updatedConversation = addMessageToConversation(conversationParam, 'user', input);

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

    return updatedConversation;
  } catch (error) {
    stopSpinner();
    console.error(
      'Error getting response:',
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
}
