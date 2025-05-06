#!/usr/bin/env node

/**
 * Synapse CLI - Lightweight CLI LLM Interface
 * Main entry point for the application
 */

import { parseArgs } from './cli/args';
import { configManager } from './config';
import { type ProviderType, createLLMProviderFromEnv } from './llm';

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));

    // Load configuration
    try {
      configManager.loadConfig();
    } catch (error) {
      console.error(
        'Error loading configuration:',
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }

    // Only show initialization message in verbose mode
    if (args.verbose) {
      console.log('Synapse CLI initialized');
    }

    // Create LLM provider from environment variables
    try {
      // Default to Anthropic as the provider for now
      const provider = 'anthropic' as ProviderType;
      const model = process.env.SYNAPSE_MODEL || undefined; // Use default model if not specified

      const llm = createLLMProviderFromEnv(provider, model);

      // If we have a prompt from command line arguments, process it
      if (args._.length > 0 || args.prompt) {
        const prompt = args.prompt || args._.join(' ');

        // Only show diagnostic information in verbose mode
        if (args.verbose) {
          console.log(`Processing prompt: "${prompt}"`);
          console.log(`Using provider: ${provider}`);
          console.log(`Using model: ${model || 'default'}`);
          console.log('Response:');
        }

        // Get streaming preference from config
        const config = configManager.getConfig();
        const shouldStream = config.general.stream;

        if (shouldStream) {
          // Stream the response
          for await (const chunk of llm.streamText(prompt)) {
            process.stdout.write(chunk);
          }
          console.log('\n'); // Add a newline at the end
        } else {
          // Generate the full response instead of streaming
          const result = await llm.generateText(prompt);
          console.log(result.text);
        }

        // Show token usage if available and verbose is enabled
        // Note: Vercel AI SDK with Anthropic doesn't provide token usage info directly
        // This is left here for future implementation
        if (args.verbose && llm.getUsage) {
          console.log('\nToken usage:');
          console.log(llm.getUsage());
        }
      } else if (args.chat) {
        if (args.verbose) {
          console.log('Starting chat session...');
        }
        console.log('Chat functionality not yet implemented.');
        // TODO: Implement interactive chat session
      } else {
        console.log('No prompt provided. Use --help for usage information.');
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('API key')) {
        console.error(
          'Error: Missing API key. Please set the ANTHROPIC_API_KEY environment variable.',
        );
        process.exit(1);
      }
      throw error;
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
