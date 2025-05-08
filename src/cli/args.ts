/**
 * Command-line argument parsing for Synapse CLI
 */

import yargs from 'yargs';

/**
 * Interface for parsed command-line arguments
 */
export interface SynapseArgs {
  _: string[];
  $0: string;
  prompt?: string;
  profile?: string;
  chat: boolean;
  verbose: boolean;
}

/**
 * Parse command-line arguments using Yargs
 *
 * @param args - Command-line arguments to parse
 * @returns Parsed arguments object
 */
export function parseArgs(args: string[]): SynapseArgs {
  // Use type assertion to ensure the correct type
  const parsedArgs = yargs(args)
    .usage('Usage: $0 [options] [prompt]')
    .option('profile', {
      alias: 'p',
      type: 'string',
      describe: 'Use a specific profile for this query',
    })
    .option('chat', {
      alias: 'c',
      type: 'boolean',
      default: false,
      describe: 'Start an interactive chat session',
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      default: false,
      describe: 'Show verbose output including token usage',
    })
    .example('$0 "What is a binary tree?"', 'Send a simple query to the LLM')
    .example('$0 -p coding "Explain recursion"', 'Use the coding profile for a query')
    .example('cat main.ts | $0 "Explain this code"', 'Pipe content as context for the query')
    // .example('$0 --chat', 'Start an interactive chat session')
    .epilogue('For more information, visit https://github.com/drewzemke/synapse')
    .help()
    .alias('help', 'h')
    .parseSync();

  // Convert any numbers in the _ array to strings to match our interface
  const result: SynapseArgs = {
    ...parsedArgs,
    _: parsedArgs._.map((arg) => String(arg)),
  };

  return result;
}
