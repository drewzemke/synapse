import type { Interface as ReadlineInterface } from 'node:readline';
import clipboardy from 'clipboardy';

import type { SynapseApp } from '../app';
import { PROMPT_MARKER } from '../cli/prompt-marker';
import { colorCodeBlocks } from '../color';
import type { Conversation } from '../conversation';

export interface Command {
  name: string;
  description: string;
  execute: (rl: ReadlineInterface) => void;
}

class CommandRegistry {
  private commands = new Map<string, Command>();

  constructor(private app: SynapseApp) {}

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
          const { messages } = this.app.conversation;

          if (messages.length === 0 || (messages.length === 1 && messages[0].role === 'system')) {
            console.log('\nNo conversation history found.\n');
            rl.prompt();
            return;
          }

          console.log('\nConversation History:');
          console.log('---------------------\n');

          for (const message of messages) {
            switch (message.role) {
              case 'user':
                if (message.content.length > 0) {
                  console.log(`${PROMPT_MARKER} ${message.content}`);
                }
                break;
              case 'assistant': {
                const content = this.app.config.showColor()
                  ? colorCodeBlocks(message.content)
                  : message.content;
                console.log(content);
                break;
              }
              case 'system':
                // skip printing system messages
                continue;
            }

            // newline between messages for better readability
            console.log('');
          }

          rl.prompt();
        },
      },
      copy: {
        name: 'copy',
        description: 'Copy last response to clipboard',
        execute: (rl: ReadlineInterface) => {
          if (!this.app.conversation || this.app.conversation.messages.length === 0) {
            console.log('No conversation found to copy from.');
            rl.prompt();
            return;
          }

          // Find the most recent assistant message
          const lastAssistantMessage = this.app.conversation.messages
            .slice()
            .reverse()
            .find((msg) => msg.role === 'assistant');

          if (!lastAssistantMessage) {
            console.log('No assistant message found to copy.');
            rl.prompt();
            return;
          }

          try {
            clipboardy.writeSync(lastAssistantMessage.content);
            console.log('Last response copied to clipboard.');
          } catch (error) {
            console.log(
              `Failed to copy to clipboard: ${error instanceof Error ? error.message : String(error)}`,
            );
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

  updateConversation(conversation: Conversation): void {
    this.app.conversation = conversation;
  }

  clear(): void {
    this.commands.clear();
  }
}

export { CommandRegistry };
