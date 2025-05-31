/**
 * Interactive chat functionality
 */

import { createInterface } from 'node:readline';
import type { SynapseApp } from '../app';
import { PROMPT_MARKER } from '../cli/prompt-marker';
import { addMessageToConversation } from '../conversation';
import { CommandRegistry } from './commands';

/**
 * Start an interactive chat session
 *
 * @param initialPrompt - Optional initial prompt to start the conversation
 * @param extendConversation - Whether to continue from the last conversation
 * @param args - Command line arguments
 */
export async function startChatSession(
  app: SynapseApp,
  /** If true, start processing without prompting for user input. */
  processImmediately: boolean,
): Promise<void> {
  // Create command registry with conversation reference
  const commandRegistry = new CommandRegistry(app.conversation);

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
    const initialPrompt = app.conversation.messages.pop()?.content;
    if (initialPrompt) {
      console.log(PROMPT_MARKER, initialPrompt, '\n');
      app.logProcessing(initialPrompt);
      app.conversation = addMessageToConversation(app.conversation, 'user', initialPrompt);
      await app.runLLM();
      app.logUsage();
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
      app.conversation = addMessageToConversation(app.conversation, 'user', input);
      await app.runLLM();
      app.logUsage();
    }
    rl.prompt();
  });

  // Handle CTRL+C for proper exit
  rl.on('SIGINT', () => {
    rl.close();
  });

  rl.on('close', () => {
    console.log('\n\nChat session ended. See you soon!');

    // don't call process.exit() during tests
    if (process.env.NODE_ENV !== 'test') {
      process.exit(0);
    }
  });
}
