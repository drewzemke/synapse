#!/usr/bin/env node

/**
 * Synapse CLI - Lightweight CLI LLM Interface
 * Main entry point for the application
 */

import { parseArgs } from './cli/args';
import { startChatSession } from './cli/chat';
import { colorCodeBlocks } from './cli/color';
import { streamWithCodeColor } from './cli/color/stream';
import { createPromptWithPipedInput } from './cli/piped-prompt';
import { startSpinner, stopSpinner } from './cli/spinner';
import { configManager } from './config';
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

    const printColor = configManager.resolveColorOutput(
      args.color,
      args.noColor,
      process.stdout.isTTY,
    );
    const streamOutput = configManager.resolveStreamOutput(
      args.stream,
      args.noStream,
      process.stdout.isTTY,
    );

    if (args.verbose) {
      console.log('Synapse CLI initialized');
      console.log(`Config file path: ${configManager.configFile}`);
    }

    if (args.last) {
      printLastMessage(printColor);
      return;
    }

    if (!args.chat && args._.length === 0 && !args.prompt) {
      console.log('No prompt provided. Use --help for usage information.');
      process.exit(1);
    }

    // Create LLM provider from environment variables
    try {
      const profileName = args.profile;
      const profile = configManager.getProfile(profileName);

      const model = configManager.getModel(args.model);

      // Create LLM provider with options from profile
      const llm = createLLMFromEnv(model);

      // Get the base prompt from arguments
      const basePrompt = args.prompt || args._.join(' ');

      // Check for and combine with any piped input
      const prompt = await createPromptWithPipedInput(basePrompt);

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

      // do chat instead if the flag was set
      if (args.chat) {
        if (args.verbose) {
          console.log('Starting chat session...');
        }

        // Get the initial prompt if provided
        const hasInitialPrompt = args.prompt !== undefined || args._.join(' ') !== '';

        // Start the chat session
        await startChatSession(
          conversation,
          llm,
          printColor,
          streamOutput,
          args.verbose ?? false,
          hasInitialPrompt,
        );
        return;
      }

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
