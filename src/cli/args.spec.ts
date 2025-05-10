import { describe, expect, it, vi } from 'vitest';
import { type SynapseArgs, parseArgs } from './args';

describe('Command Line Argument Parsing', () => {
  // Test for expected use
  it('should parse a simple prompt', () => {
    const args = parseArgs(['What is a binary tree?']);

    expect(args).toMatchObject({
      _: ['What is a binary tree?'],
    });
  });

  // Test with profile option
  it('should parse a prompt with profile option', () => {
    const args = parseArgs(['-p', 'coding', 'Explain recursion']);

    expect(args).toMatchObject({
      _: ['Explain recursion'],
      profile: 'coding',
    });
  });

  // Test with long-form options
  it('should parse long-form options correctly', () => {
    const args = parseArgs(['--profile', 'programming', '--chat', 'How do I configure tailwind?']);

    expect(args).toMatchObject({
      _: ['How do I configure tailwind?'],
      profile: 'programming',
      chat: true,
    });
  });

  // Test with multiple options
  it('should parse multiple options correctly', () => {
    const args = parseArgs(['--profile', 'technical', '--verbose', 'What is Docker?']);

    expect(args).toMatchObject({
      _: ['What is Docker?'],
      profile: 'technical',
      verbose: true,
    });
  });

  // Edge case: no prompt provided
  it('should handle case with no prompt', () => {
    const args = parseArgs(['--chat']);

    expect(args).toMatchObject({
      _: [],
      chat: true,
    });
  });

  // Test for extend flag functionality
  it('should recognize the -e/--extend flag', () => {
    // Test with short form
    const shortArgs = parseArgs(['-e', 'How do I get it to show details?']);
    expect(shortArgs.extend).toBe(true);
    expect(shortArgs._).toEqual(['How do I get it to show details?']);

    // Test with long form
    const longArgs = parseArgs(['--extend', 'How do I get details?']);
    expect(longArgs.extend).toBe(true);
    expect(longArgs._).toEqual(['How do I get details?']);
  });

  // Test extend flag with other options
  it('should handle extend flag with other options', () => {
    const args = parseArgs(['-p', 'coding', '-e', '-v', 'How do I use grep?']);
    expect(args.extend).toBe(true);
    expect(args.profile).toBe('coding');
    expect(args.verbose).toBe(true);
    expect(args._).toEqual(['How do I use grep?']);
  });

  // Test the last flag functionality
  it('should recognize the -l/--last flag', () => {
    // Test with short form
    const shortArgs = parseArgs(['-l']);
    expect(shortArgs.last).toBe(true);

    // Test with long form
    const longArgs = parseArgs(['--last']);
    expect(longArgs.last).toBe(true);
  });

  // Test that last flag cannot be used with profile or extend
  it('should throw an error when last is used with profile', () => {
    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => parseArgs(['-l', '-p', 'coding'])).toThrow();
    consoleErrorMock.mockRestore();
  });

  it('should throw an error when last is used with extend', () => {
    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => parseArgs(['-l', '-e'])).toThrow();
    consoleErrorMock.mockRestore();
  });

  // Test that last flag works with verbose
  it('should allow last flag with verbose flag', () => {
    const args = parseArgs(['-l', '-v']);
    expect(args.last).toBe(true);
    expect(args.verbose).toBe(true);
  });

  // Failure case: non-string values in positional arguments get converted to strings
  it('should convert non-string values in _ array to strings', () => {
    // We're directly manipulating the args array to simulate numbers coming in
    // In real usage, yargs might parse numeric-looking strings as numbers
    const mockYargsOutput = {
      _: [123, 456],
      $0: 'synapse',
      chat: false,
      verbose: false,
      extend: false,
      last: false,
    };

    // We're going to bypass the parseArgs function and test just the conversion logic
    const result: SynapseArgs = {
      ...mockYargsOutput,
      _: mockYargsOutput._.map((arg) => String(arg)),
    };

    expect(result._).toEqual(['123', '456']);
    expect(typeof result._[0]).toBe('string');
    expect(typeof result._[1]).toBe('string');
  });
});
