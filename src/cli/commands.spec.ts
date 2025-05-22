import type * as readline from 'node:readline';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type Conversation, loadLastConversation } from '../conversation';
import { commandRegistry, registerCommand } from './commands';

describe('commands', () => {
  beforeEach(() => {
    commandRegistry.clear();
  });

  it('should register commands', () => {
    registerCommand({
      name: 'test',
      description: 'A test command',
      execute: vi.fn(),
    });

    expect(commandRegistry.getCommand('test')).toBeDefined();
    expect(commandRegistry.getCommand('nonexistent')).toBeUndefined();
  });

  it('should return all command names for completion', () => {
    registerCommand({
      name: 'help',
      description: 'Show help',
      execute: vi.fn(),
    });
    registerCommand({
      name: 'exit',
      description: 'Exit chat',
      execute: vi.fn(),
    });

    const completions = commandRegistry.getCompletions('');
    expect(completions).toContain('help');
    expect(completions).toContain('exit');
  });

  it('should filter command names for completion', () => {
    registerCommand({
      name: 'help',
      description: 'Show help',
      execute: vi.fn(),
    });
    registerCommand({
      name: 'exit',
      description: 'Exit chat',
      execute: vi.fn(),
    });
    registerCommand({
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

    registerCommand({
      name: 'help',
      description: 'Show help',
      execute: commandRegistry.getBuiltInCommands().help.execute,
    });
    registerCommand({
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

    registerCommand({
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

    const mockConversation: Conversation = {
      profile: 'default',
      temperature: 0.7,
      messages: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there! How can I help you?' },
        { role: 'user', content: 'What is Node.js?' },
        { role: 'assistant', content: 'Node.js is a JavaScript runtime...' },
      ],
    };

    vi.mock('../conversation');
    vi.mocked(loadLastConversation).mockReturnValue(mockConversation);

    const mockRl = {
      prompt: vi.fn(),
    } as unknown as readline.Interface;

    const convoExecute = commandRegistry.getBuiltInCommands().convo.execute;

    // Register convo command
    registerCommand({
      name: 'convo',
      description: 'Show conversation history',
      execute: convoExecute,
    });

    // Execute convo command
    const convoCommand = commandRegistry.getCommand('convo');
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
});
