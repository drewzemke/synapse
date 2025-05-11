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
  model?: string;
  chat?: boolean;
  verbose?: boolean;
  extend?: boolean;
  last?: boolean;
}

/**
 * Parse command-line arguments using Yargs
 *
 * @param args - Command-line arguments to parse
 * @returns Parsed arguments object
 */
export function parseArgs(args: string[]): SynapseArgs {
  // Use exitProcess: false to prevent yargs from calling process.exit() during tests
  const parsedArgs = yargs(args)
    .showHelpOnFail(process.env.NODE_ENV !== 'test')
    .exitProcess(process.env.NODE_ENV !== 'test')
    .usage('Usage: $0 [options] [prompt]')
    .option('profile', {
      alias: 'p',
      type: 'string',
      describe: 'Use a specific profile for this query',
    })
    .option('model', {
      alias: 'm',
      type: 'string',
      describe: 'Use a specific model for this query',
    })
    .option('chat', {
      alias: 'c',
      type: 'boolean',
      describe: 'Start an interactive chat session',
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      describe: 'Show verbose output including token usage',
    })
    .option('extend', {
      alias: 'e',
      type: 'boolean',
      describe: 'Continue the previous conversation',
    })
    .option('last', {
      alias: 'l',
      type: 'boolean',
      describe: 'Show the last response from the LLM',
    })
    .conflicts({
      last: ['profile', 'extend', 'model'],
    })
    .example('$0 "What is a binary tree?"', 'Send a simple query to the LLM')
    .example('$0 -p coding "Explain recursion"', 'Use a pre-configured profile for a query')
    .example('$0 -m gpt4 "Explain promises in JS"', 'Use a pre-configured model for a query')
    .example('$0 -e "Can you give me an example?"', 'Continue the previous conversation')
    .example('cat main.ts | $0 "Explain this code"', 'Pipe content as context for the query')
    .example('$0 -l', 'Show the last response from the LLM')
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
