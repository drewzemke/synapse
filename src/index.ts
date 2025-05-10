#!/usr/bin/env node

/**
 * Synapse CLI - Lightweight CLI LLM Interface
 * Main entry point for the application
 */

import { parseArgs } from './cli/args';
import { createPromptWithPipedInput } from './cli/piped-prompt';
import { configManager } from './config';
import {
  type Conversation,
  addMessageToConversation,
  continueConversation,
  saveConversation,
} from './conversation';
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
      console.log(`Config file path: ${configManager.configFile}`);
    }

    // Create LLM provider from environment variables
    try {
      // Default to Anthropic as the provider for now
      const provider = 'anthropic' as ProviderType;
      const model = process.env.SYNAPSE_MODEL || undefined; // Use default model if not specified

      // Get the specified profile (or default if none specified)
      const profileName = args.profile;
      const profile = configManager.getProfile(profileName);

      // Create LLM provider with options from profile
      const llm = createLLMProviderFromEnv(provider, model, {
        temperature: profile.temperature,
        systemPrompt: profile.system_prompt,
      });

      // If we have a prompt from command line arguments, process it
      if (args._.length > 0 || args.prompt) {
        // Get the base prompt from arguments
        const basePrompt = args.prompt || args._.join(' ');

        // Check for and combine with any piped input
        const prompt = await createPromptWithPipedInput(basePrompt);

        // Only show diagnostic information in verbose mode
        if (args.verbose) {
          console.log(`Processing prompt: "${basePrompt}"\n`);
          if (prompt !== basePrompt) {
            console.log('Piped input detected and added to prompt');
          }
          console.log(`Using provider: ${provider}`);
          console.log(`Using model: ${model || 'default'}`);
          console.log(`Using profile: ${profileName || 'default'}`);
          console.log(`Profile temperature: ${profile.temperature}`);
          if (args.extend) {
            console.log('Continuing previous conversation');
          }
          console.log('\nResponse:');
        }

        // Get streaming preference from config
        const config = configManager.getConfig();
        const shouldStream = config.general.stream;

        // Initialize conversation
        let conversation: Conversation;

        if (args.extend) {
          // Continue previous conversation
          conversation = continueConversation(prompt);

          // If the profile has a system prompt and the continued conversation doesn't have one,
          // add it (this handles the case where we're creating a new conversation due to no previous one)
          if (
            profile.system_prompt &&
            (conversation.messages.length === 0 || conversation.messages[0].role !== 'system')
          ) {
            conversation.messages.unshift({
              role: 'system' as const,
              content: profile.system_prompt,
            });
          }
        } else {
          // Create a new conversation
          conversation = {
            profile: profileName ?? 'default',
            temperature: profile.temperature,
            messages: [
              // Add system message if present
              ...(profile.system_prompt
                ? [{ role: 'system' as const, content: profile.system_prompt }]
                : []),
              // Add user message
              { role: 'user', content: prompt },
            ],
          };
        }

        let assistantResponse = '';

        if (shouldStream) {
          // Stream the response using the conversation messages
          for await (const chunk of llm.streamText(conversation.messages)) {
            process.stdout.write(chunk);
            assistantResponse += chunk;
          }
          console.log('\n'); // Add a newline at the end
        } else {
          // Generate the full response using the conversation messages
          const result = await llm.generateText(conversation.messages);
          assistantResponse = result.text;
          console.log(result.text);
        }

        // Add assistant's response to conversation
        conversation = addMessageToConversation(conversation, 'assistant', assistantResponse);

        // Save the conversation
        saveConversation(conversation);

        // Show token usage if available and verbose is enabled
        // Note: Vercel AI SDK with Anthropic doesn't provide token usage info directly
        // This is left here for future implementation
        if (args.verbose && llm.getUsage) {
          console.log('Token usage:');
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
