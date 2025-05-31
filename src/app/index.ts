import type { SynapseArgs } from '../cli/args';
import { startSpinner, stopSpinner } from '../cli/spinner';
import { colorCodeBlocks } from '../color';
import { streamWithCodeColor } from '../color/stream';
import type { ConfigManager } from '../config';
import { addMessageToConversation, type Conversation, saveConversation } from '../conversation';
import type { LLM } from '../llm';

/**
 * Wrapper around the core functionality of the app
 */
export class SynapseApp {
  private verbose: boolean;
  private profileName: string | undefined;
  private modelName: string | undefined;

  constructor(
    private llm: LLM,
    public conversation: Conversation,
    private config: ConfigManager,
    args: SynapseArgs,
  ) {
    this.verbose = args.verbose ?? false;
    this.profileName = args.profile;
    this.modelName = args.model;
  }

  async runLLM() {
    let assistantResponse = '';

    // FIXME: read from config
    const streamOutput = true;
    const printColor = true;

    if (streamOutput) {
      if (printColor) {
        startSpinner();
        assistantResponse = await streamWithCodeColor(this.llm, this.conversation);
      } else {
        // normal streaming, no color
        startSpinner();
        let firstChunk = true;
        for await (const chunk of this.llm.streamText(this.conversation.messages)) {
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
      assistantResponse = await this.llm.generateText(this.conversation.messages);
      stopSpinner();

      if (printColor) {
        console.log(colorCodeBlocks(assistantResponse));
      } else {
        console.log(assistantResponse);
      }
    }

    // add new response to conversation and save
    this.conversation = addMessageToConversation(this.conversation, 'assistant', assistantResponse);
    saveConversation(this.conversation);
  }

  logInit() {
    if (!this.verbose) return;

    console.log('Synapse CLI initialized');
    console.log(`Config file path: ${this.config.configFile}`);
  }

  logProcessing(prompt: string) {
    if (!this.verbose) return;

    const model = this.config.getModel(this.modelName);
    const profile = this.config.getProfile(this.profileName);

    console.log(`Processing prompt: "${prompt}"\n`);
    console.log(`Using provider: ${model.provider}`);
    console.log(`Using model: ${model.modelStr}`);
    console.log(`Using profile: ${this.profileName || '<none>'}`);
    console.log(`Profile temperature: ${profile.temperature}`);
    // FIXME: bring these back
    // console.log(`Code coloring: ${printColor ? 'on' : 'off'}`);
    // console.log(`Response streaming: ${streamOutput ? 'on' : 'off'}`);
    if (this.conversation.messages.length > 2) {
      console.log('Continuing previous conversation');
    }
    console.log('\nResponse:');
  }

  logUsage() {
    if (!this.verbose) return;

    if (this.llm.getUsage) {
      console.log('------------');
      console.log('Token usage:');
      console.log(this.llm.getUsage());
    }
  }
}
