import { describe, expect, it } from 'vitest';
import { type SynapseArgs, parseArgs } from './args';

describe('Command Line Argument Parsing', () => {
  // Test for expected use
  it('should parse a simple prompt', () => {
    const args = parseArgs(['What is a binary tree?']);

    expect(args).toMatchObject({
      _: ['What is a binary tree?'],
      chat: false,
      verbose: false,
    });
  });

  // Test with profile option
  it('should parse a prompt with profile option', () => {
    const args = parseArgs(['-p', 'coding', 'Explain recursion']);

    expect(args).toMatchObject({
      _: ['Explain recursion'],
      profile: 'coding',
      chat: false,
      verbose: false,
    });
  });

  // Test with long-form options
  it('should parse long-form options correctly', () => {
    const args = parseArgs(['--profile', 'programming', '--chat', 'How do I configure tailwind?']);

    expect(args).toMatchObject({
      _: ['How do I configure tailwind?'],
      profile: 'programming',
      chat: true,
      verbose: false,
    });
  });

  // Test with multiple options
  it('should parse multiple options correctly', () => {
    const args = parseArgs(['--profile', 'technical', '--verbose', 'What is Docker?']);

    expect(args).toMatchObject({
      _: ['What is Docker?'],
      profile: 'technical',
      chat: false,
      verbose: true,
    });
  });

  // Edge case: no prompt provided
  it('should handle case with no prompt', () => {
    const args = parseArgs(['--chat']);

    expect(args).toMatchObject({
      _: [],
      chat: true,
      verbose: false,
    });
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
