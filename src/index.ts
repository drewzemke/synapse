#!/usr/bin/env node

/**
 * Synapse CLI - Lightweight CLI LLM Interface
 * Main entry point for the application
 */

import { parseArgs } from './cli/args';
import { colorCodeBlocks } from './cli/color';
import { streamWithCodeColor } from './cli/color/stream';
import { createPromptWithPipedInput } from './cli/piped-prompt';
import { startSpinner, stopSpinner } from './cli/spinner';
import { configManager, DEFAULT_MODEL_ANTHROPIC as DEFAULT_MODEL, type ModelSpec } from './config';
import {
  addMessageToConversation,
  type Conversation,
  continueConversation,
  loadLastConversation,
  saveConversation,
} from './conversation';
import { createLLMFromEnv } from './llm';

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

function printLastMessage(color: boolean) {
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

  const content = assistantMessages[assistantMessages.length - 1].content;
  if (color) {
    console.log(colorCodeBlocks(content));
  } else {
    console.log(content);
  }
}

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));

    // Load configuration
    loadConfiguration();
    const config = configManager.getConfig();

    // args.color and args.noColor will never be set at the same time,
    // so this has the effect of prioritizing whichever of the two
    // args the user has passed, falling back to the config (which itself
    // defaults to false if not set)
    const printColor = process.stdout.isTTY && (args.color ?? args.noColor ?? config.general.color);

    // same as above
    const streamOutput =
      process.stdout.isTTY && (args.stream ?? args.noStream ?? config.general.stream);

    if (args.verbose) {
      console.log('Synapse CLI initialized');
      console.log(`Config file path: ${configManager.configFile}`);
    }

    if (args.last) {
      printLastMessage(printColor);
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
      process.exit(1);
    }

    // Create LLM provider from environment variables
    try {
      // Get the specified profile (or default if none specified)
      // TODO: refactor some of this to be in the config manager
      const profileName = args.profile;
      const profile = configManager.getProfile(profileName);

      // Get the specified model (or default if none specified)
      // TODO: refactor some of this to be in the config manager
      let model: ModelSpec;
      if (args.model) {
        // If a model is specified via command line, get it from config
        model = configManager.getModel(args.model);
      } else if (config.general.default_model) {
        // Try using the default model specfied in the config
        model = configManager.getModel(config.general.default_model);
      } else {
        // Otherwise use the default model
        model = DEFAULT_MODEL;
      }

      // Create LLM provider with options from profile
      const llm = createLLMFromEnv(model);

      // Get the base prompt from arguments
      const basePrompt = args.prompt || args._.join(' ');

      // Check for and combine with any piped input
      const prompt = await createPromptWithPipedInput(basePrompt);

      // show diagnostic information in verbose mode
      if (args.verbose) {
        console.log(`Processing prompt: "${basePrompt}"\n`);
        if (prompt !== basePrompt) {
          console.log('Piped input detected and added to prompt');
        }
        console.log(`Using provider: ${model.provider}`);
        console.log(`Using model: ${model.modelStr}`);
        console.log(`Using profile: ${profileName || '<none>'}`);
        console.log(`Profile temperature: ${profile.temperature}`);
        console.log(`Code coloring: ${printColor ? 'on' : 'off'}`);
        console.log(`Response streaming: ${streamOutput ? 'on' : 'off'}`);
        if (args.extend) {
          console.log('Continuing previous conversation');
        }
        console.log('\nResponse:');
      }

      // initialize conversation
      let conversation: Conversation;

      if (args.extend) {
        conversation = continueConversation(prompt);
      } else {
        // create a new conversation
        conversation = {
          profile: profileName ?? 'default',
          temperature: profile.temperature,
          messages: [
            // system message if present
            ...(profile.system_prompt
              ? [{ role: 'system' as const, content: profile.system_prompt }]
              : []),
            // user message
            { role: 'user', content: prompt },
          ],
        };
      }

      let assistantResponse = '';

      // TODO: clean this up
      if (streamOutput) {
        if (printColor) {
          startSpinner();
          assistantResponse = await streamWithCodeColor(llm, conversation);
        } else {
          // normal streaming, no color
          startSpinner();
          let firstChunk = true;
          for await (const chunk of llm.streamText(conversation.messages)) {
            if (firstChunk) {
              firstChunk = false;
              stopSpinner();
            }
            process.stdout.write(chunk);
            assistantResponse += chunk;
          }
        }
        console.log('\n');
      } else {
        // generate the full response without streaming
        startSpinner();
        assistantResponse = await llm.generateText(conversation.messages);
        stopSpinner();
        if (printColor) {
          console.log(colorCodeBlocks(assistantResponse));
        } else {
          console.log(assistantResponse);
        }
      }

      // add new response to conversation and save
      conversation = addMessageToConversation(conversation, 'assistant', assistantResponse);
      saveConversation(conversation);

      // show token usage if available and verbose is enabled
      // TODO: better printing?
      if (args.verbose && llm.getUsage) {
        console.log('------------');
        console.log('Token usage:');
        console.log(llm.getUsage());
      }
    } catch (error) {
      // FIXME: maybe handle this elsewhere? or at least reconcile it with the error handling below this
      if (error instanceof Error && error.message.includes('AWS region setting is missing')) {
        console.error(
          "Error: AWS region must be specified either by 'aws_region' in the Synapse model configuration or by setting the 'AWS_REGION' environment variable.",
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
