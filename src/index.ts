#!/usr/bin/env node

/**
 * Synapse CLI - Lightweight CLI LLM Interface
 * Main entry point for the application
 */

import { parseArgs } from './cli/args';

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));

    // For now, just output the parsed arguments
    console.log('Synapse CLI initialized');
    console.log('Arguments:', args);

    // Future: Connect to LLM, process input, etc.
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
