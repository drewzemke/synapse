import type * as readline from 'node:readline';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
});
