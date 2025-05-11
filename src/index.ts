#!/usr/bin/env node

/**
 * Synapse CLI - Lightweight CLI LLM Interface
 * Main entry point for the application
 */

import { parseArgs } from './cli/args';
import { createPromptWithPipedInput } from './cli/piped-prompt';
import { DEFAULT_MODEL, configManager } from './config';
import {
  type Conversation,
  addMessageToConversation,
  continueConversation,
  loadLastConversation,
  saveConversation,
} from './conversation';
import { type ProviderType, createLLMFromEnv } from './llm';

function loadConfiguration() {
  try {
    configManager.loadConfig();
  } catch (error) {
    console.error(
      'Error loading configuration:',
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
}

function printLastMessage() {
  const lastConversation = loadLastConversation();

  if (!lastConversation || lastConversation.messages.length === 0) {
    console.log('No previous conversations found.');
    return;
  }

  const assistantMessages = lastConversation.messages.filter((msg) => msg.role === 'assistant');

  if (assistantMessages.length === 0) {
    console.log('No previous assistant responses found.');
    return;
  }

  console.log(assistantMessages[assistantMessages.length - 1].content);
}

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));

    // Load configuration
    loadConfiguration();

    if (args.verbose) {
      console.log('Synapse CLI initialized');
      console.log(`Config file path: ${configManager.configFile}`);
    }

    if (args.last) {
      printLastMessage();
      return;
    }

    if (args.chat) {
      if (args.verbose) {
        console.log('Starting chat session...');
      }
      console.log('Chat functionality not yet implemented.');
      // TODO: Implement interactive chat session
      return;
    }

    if (args._.length === 0 && !args.prompt) {
      console.log('No prompt provided. Use --help for usage information.');
    }

    // Create LLM provider from environment variables
    try {
      // TODO: get the model from the user's configuration
      const model = DEFAULT_MODEL;

      // Get the specified profile (or default if none specified)
      const profileName = args.profile;
      const profile = configManager.getProfile(profileName);

      // Create LLM provider with options from profile
      const llm = createLLMFromEnv(model);

      // Get the base prompt from arguments
      const basePrompt = args.prompt || args._.join(' ');

      // Check for and combine with any piped input
      const prompt = await createPromptWithPipedInput(basePrompt);

      // Show diagnostic information in verbose mode
      if (args.verbose) {
        console.log(`Processing prompt: "${basePrompt}"\n`);
        if (prompt !== basePrompt) {
          console.log('Piped input detected and added to prompt');
        }
        console.log(`Using provider: ${model.provider}`);
        console.log(`Using model: ${model.modelStr}`);
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
        assistantResponse = await llm.generateText(conversation.messages);
        console.log(assistantResponse);
      }

      // Add assistant's response to conversation
      conversation = addMessageToConversation(conversation, 'assistant', assistantResponse);

      // Save the conversation
      saveConversation(conversation);

      // Show token usage if available and verbose is enabled
      // TODO: better printing?
      if (args.verbose && llm.getUsage) {
        console.log('------------');
        console.log('Token usage:');
        console.log(llm.getUsage());
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
