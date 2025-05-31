import type * as readline from 'node:readline';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Conversation } from '../conversation';
import { CommandRegistry } from './commands';

// Mock clipboardy
vi.mock('clipboardy', () => ({
  default: {
    writeSync: vi.fn(),
  },
}));

describe('commands', () => {
  let commandRegistry: CommandRegistry;
  const mockConversation: Conversation = {
    profile: 'default',
    temperature: 0.7,
    messages: [],
  };

  beforeEach(() => {
    commandRegistry = new CommandRegistry(mockConversation);
  });

  it('should register commands', () => {
    commandRegistry.registerCommand({
      name: 'test',
      description: 'A test command',
      execute: vi.fn(),
    });

    expect(commandRegistry.getCommand('test')).toBeDefined();
    expect(commandRegistry.getCommand('nonexistent')).toBeUndefined();
  });

  it('should return all command names for completion', () => {
    commandRegistry.registerCommand({
      name: 'help',
      description: 'Show help',
      execute: vi.fn(),
    });
    commandRegistry.registerCommand({
      name: 'exit',
      description: 'Exit chat',
      execute: vi.fn(),
    });

    const completions = commandRegistry.getCompletions('');
    expect(completions).toContain('help');
    expect(completions).toContain('exit');
  });

  it('should filter command names for completion', () => {
    commandRegistry.registerCommand({
      name: 'help',
      description: 'Show help',
      execute: vi.fn(),
    });
    commandRegistry.registerCommand({
      name: 'exit',
      description: 'Exit chat',
      execute: vi.fn(),
    });
    commandRegistry.registerCommand({
      name: 'hello',
      description: 'Say hello',
      execute: vi.fn(),
    });

    const completions = commandRegistry.getCompletions('he');
    expect(completions).toContain('help');
    expect(completions).toContain('hello');
    expect(completions).not.toContain('exit');
  });

  it('should execute the /help command', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    commandRegistry.registerCommand({
      name: 'help',
      description: 'Show help',
      execute: commandRegistry.getBuiltInCommands().help.execute,
    });
    commandRegistry.registerCommand({
      name: 'exit',
      description: 'Exit chat',
      execute: vi.fn(),
    });

    const mockRl = {
      prompt: vi.fn(),
    } as unknown as readline.Interface;

    const helpCommand = commandRegistry.getCommand('help');
    helpCommand?.execute(mockRl);

    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Available Commands'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('/help'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('/exit'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Press Ctrl+C to quit'));

    consoleLogSpy.mockRestore();
  });

  it('should execute the /exit command', () => {
    const mockRl = {
      close: vi.fn(),
    } as unknown as readline.Interface;

    commandRegistry.registerCommand({
      name: 'exit',
      description: 'Exit chat',
      execute: commandRegistry.getBuiltInCommands().exit.execute,
    });

    const exitCommand = commandRegistry.getCommand('exit');
    exitCommand?.execute(mockRl);

    expect(mockRl.close).toHaveBeenCalled();
  });

  it('should execute the /convo command', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const testConversation: Conversation = {
      profile: 'default',
      temperature: 0.7,
      messages: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there! How can I help you?' },
        { role: 'user', content: 'What is Node.js?' },
        { role: 'assistant', content: 'Node.js is a JavaScript runtime...' },
      ],
    };

    // Create a new command registry with the test conversation
    const testCommandRegistry = new CommandRegistry(testConversation);

    const mockRl = {
      prompt: vi.fn(),
    } as unknown as readline.Interface;

    const convoExecute = testCommandRegistry.getBuiltInCommands().convo.execute;

    // Register convo command
    testCommandRegistry.registerCommand({
      name: 'convo',
      description: 'Show conversation history',
      execute: convoExecute,
    });

    // Execute convo command
    const convoCommand = testCommandRegistry.getCommand('convo');
    convoCommand?.execute(mockRl);

    // Verify each message in the conversation was logged
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Hello'));
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Hi there! How can I help you?'),
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('What is Node.js?'));
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Node.js is a JavaScript runtime...'),
    );

    // Ensure prompt is called to restore the input prompt
    expect(mockRl.prompt).toHaveBeenCalled();

    consoleLogSpy.mockRestore();
  });

  describe('/copy command', () => {
    let mockRl: readline.Interface;
    let consoleLogSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      mockRl = {
        prompt: vi.fn(),
      } as unknown as readline.Interface;
      consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.clearAllMocks();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    it('should copy the last assistant message to clipboard', async () => {
      const clipboardy = await import('clipboardy');

      const testConversation: Conversation = {
        profile: 'default',
        temperature: 0.7,
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there! How can I help you?' },
          { role: 'user', content: 'What is 2+2?' },
          { role: 'assistant', content: 'The answer is 4.' },
        ],
      };

      const testCommandRegistry = new CommandRegistry(testConversation);

      const copyExecute = testCommandRegistry.getBuiltInCommands().copy.execute;
      testCommandRegistry.registerCommand({
        name: 'copy',
        description: 'Copy last response to clipboard',
        execute: copyExecute,
      });

      const copyCommand = testCommandRegistry.getCommand('copy');
      copyCommand?.execute(mockRl);

      expect(clipboardy.default.writeSync).toHaveBeenCalledWith('The answer is 4.');
      expect(consoleLogSpy).toHaveBeenCalledWith('Last response copied to clipboard.');
      expect(mockRl.prompt).toHaveBeenCalled();
    });

    it('should handle no conversation found', async () => {
      const emptyConversation: Conversation = {
        profile: 'default',
        temperature: 0.7,
        messages: [],
      };

      const testCommandRegistry = new CommandRegistry(emptyConversation);

      const copyExecute = testCommandRegistry.getBuiltInCommands().copy.execute;
      testCommandRegistry.registerCommand({
        name: 'copy',
        description: 'Copy last response to clipboard',
        execute: copyExecute,
      });

      const copyCommand = testCommandRegistry.getCommand('copy');
      copyCommand?.execute(mockRl);

      expect(consoleLogSpy).toHaveBeenCalledWith('No conversation found to copy from.');
      expect(mockRl.prompt).toHaveBeenCalled();
    });

    it('should handle empty conversation', async () => {
      const emptyConversation: Conversation = {
        profile: 'default',
        temperature: 0.7,
        messages: [],
      };

      const testCommandRegistry = new CommandRegistry(emptyConversation);

      const copyExecute = testCommandRegistry.getBuiltInCommands().copy.execute;
      testCommandRegistry.registerCommand({
        name: 'copy',
        description: 'Copy last response to clipboard',
        execute: copyExecute,
      });

      const copyCommand = testCommandRegistry.getCommand('copy');
      copyCommand?.execute(mockRl);

      expect(consoleLogSpy).toHaveBeenCalledWith('No conversation found to copy from.');
      expect(mockRl.prompt).toHaveBeenCalled();
    });

    it('should handle conversation with no assistant messages', async () => {
      const noAssistantConversation: Conversation = {
        profile: 'default',
        temperature: 0.7,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello' },
          { role: 'user', content: 'Are you there?' },
        ],
      };

      const testCommandRegistry = new CommandRegistry(noAssistantConversation);

      const copyExecute = testCommandRegistry.getBuiltInCommands().copy.execute;
      testCommandRegistry.registerCommand({
        name: 'copy',
        description: 'Copy last response to clipboard',
        execute: copyExecute,
      });

      const copyCommand = testCommandRegistry.getCommand('copy');
      copyCommand?.execute(mockRl);

      expect(consoleLogSpy).toHaveBeenCalledWith('No assistant message found to copy.');
      expect(mockRl.prompt).toHaveBeenCalled();
    });

    it('should handle clipboard write failure', async () => {
      const clipboardy = await import('clipboardy');

      const testConversation: Conversation = {
        profile: 'default',
        temperature: 0.7,
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' },
        ],
      };

      const testCommandRegistry = new CommandRegistry(testConversation);
      vi.mocked(clipboardy.default.writeSync).mockImplementation(() => {
        throw new Error('Clipboard unavailable');
      });

      const copyExecute = testCommandRegistry.getBuiltInCommands().copy.execute;
      testCommandRegistry.registerCommand({
        name: 'copy',
        description: 'Copy last response to clipboard',
        execute: copyExecute,
      });

      const copyCommand = testCommandRegistry.getCommand('copy');
      copyCommand?.execute(mockRl);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Failed to copy to clipboard: Clipboard unavailable',
      );
      expect(mockRl.prompt).toHaveBeenCalled();
    });

    it('should find the most recent assistant message when multiple exist', async () => {
      const clipboardy = await import('clipboardy');
      // Reset any previous mock implementation
      vi.mocked(clipboardy.default.writeSync).mockReset();

      const testConversation: Conversation = {
        profile: 'default',
        temperature: 0.7,
        messages: [
          { role: 'user', content: 'First question' },
          { role: 'assistant', content: 'First answer' },
          { role: 'user', content: 'Second question' },
          { role: 'assistant', content: 'Second answer' },
          { role: 'user', content: 'Third question' },
          { role: 'assistant', content: 'Most recent answer' },
        ],
      };

      const testCommandRegistry = new CommandRegistry(testConversation);

      const copyExecute = testCommandRegistry.getBuiltInCommands().copy.execute;
      testCommandRegistry.registerCommand({
        name: 'copy',
        description: 'Copy last response to clipboard',
        execute: copyExecute,
      });

      const copyCommand = testCommandRegistry.getCommand('copy');
      copyCommand?.execute(mockRl);

      expect(clipboardy.default.writeSync).toHaveBeenCalledWith('Most recent answer');
      expect(consoleLogSpy).toHaveBeenCalledWith('Last response copied to clipboard.');
      expect(mockRl.prompt).toHaveBeenCalled();
    });
  });
});
