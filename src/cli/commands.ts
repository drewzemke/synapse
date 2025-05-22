import type { Interface as ReadlineInterface } from 'node:readline';
import { configManager } from '../config';
import { loadLastConversation } from '../conversation';
import { colorCodeBlocks } from './color';
import { PROMPT_MARKER } from './prompt-marker';

export interface Command {
  name: string;
  description: string;
  execute: (rl: ReadlineInterface) => void;
}

class CommandRegistry {
  private commands = new Map<string, Command>();

  registerCommand(command: Command): void {
    this.commands.set(command.name, command);
  }

  getCommand(name: string): Command | undefined {
    return this.commands.get(name);
  }

  getCompletions(partial: string): string[] {
    return Array.from(this.commands.keys()).filter((name) => name.startsWith(partial));
  }

  getBuiltInCommands(): Record<string, Command> {
    return {
      convo: {
        name: 'convo',
        description: 'Show conversation history',
        execute: (rl: ReadlineInterface) => {
          const conversation = loadLastConversation();

          if (!conversation || conversation.messages.length === 0) {
            console.log('\nNo conversation history found.');
            rl.prompt();
            return;
          }

          console.log('\nConversation History:');
          console.log('---------------------\n');

          const useColor = configManager.resolveColorOutput(
            undefined,
            undefined,
            process.stdout.isTTY,
          );

          for (const message of conversation.messages) {
            if (message.role === 'system') {
              continue; // Skip system messages
            }

            if (message.role === 'user') {
              console.log(`${PROMPT_MARKER} ${message.content}`);
            } else {
              // For assistant messages, apply code coloring if enabled
              const content = useColor ? colorCodeBlocks(message.content) : message.content;
              console.log(content);
            }

            // Add a newline between messages for better readability
            console.log('');
          }

          rl.prompt();
        },
      },
      help: {
        name: 'help',
        description: 'Show available commands',
        execute: (rl: ReadlineInterface) => {
          console.log('\nAvailable Commands:');

          for (const [name, command] of this.commands.entries()) {
            console.log(`/${name} - ${command.description}`);
          }

          console.log('\nPress Ctrl+C to quit at any time');
          rl.prompt();
        },
      },
      exit: {
        name: 'exit',
        description: 'Exit chat',
        execute: (rl: ReadlineInterface) => {
          rl.close();
        },
      },
    };
  }

  getAllCommands(): Command[] {
    return Array.from(this.commands.values());
  }

  clear(): void {
    this.commands.clear();
  }
}

export const commandRegistry = new CommandRegistry();

export function registerCommand(command: Command): void {
  commandRegistry.registerCommand(command);
}

export function executeCommand(commandName: string, rl: ReadlineInterface): boolean {
  const command = commandRegistry.getCommand(commandName);

  if (command) {
    command.execute(rl);
    return true;
  }

  return false;
}

// Register built-in commands
export function registerBuiltInCommands(): void {
  const builtInCommands = commandRegistry.getBuiltInCommands();

  for (const command of Object.values(builtInCommands)) {
    registerCommand(command);
  }
}
