/**
 * Types and interfaces for LLM providers
 */

/**
 * Common options for all LLM providers
 */
export interface LLMOptions {
  /** API key for the LLM provider */
  apiKey: string;
  /** Model name to use */
  model: string;
  /** Temperature for generation (0.0 to 1.0) */
  temperature?: number;
  /** Maximum tokens to generate */
  maxTokens?: number;
}

/**
 * Token usage information
 */
export interface TokenUsage {
  /** Number of tokens in the prompt */
  promptTokens?: number;
  /** Number of tokens in the completion */
  completionTokens?: number;
  /** Total number of tokens used */
  totalTokens?: number;
}

/**
 * Response from an LLM
 */
export interface LLMResponse {
  /** The generated text */
  text: string;
  /** Metadata about the response */
  metadata?: {
    /** Token usage information */
    usage?: TokenUsage;
    /** Model used for generation */
    model?: string;
  };
}

/**
 * Interface that all LLM providers must implement
 */
export interface LLMProvider {
  /**
   * Generate text from the LLM
   * @param prompt The prompt to send to the LLM
   * @param options Additional options for generation
   */
  generateText(prompt: string, options?: Partial<LLMOptions>): Promise<LLMResponse>;

  /**
   * Stream text from the LLM
   * @param prompt The prompt to send to the LLM
   * @param options Additional options for generation
   * @param onToken Callback function for each token received
   */
  streamText(
    prompt: string,
    options?: Partial<LLMOptions>,
    onToken?: (token: string) => void,
  ): AsyncIterable<string>;

  /**
   * Get token usage information from the last request if available
   * Note: Not all providers support this functionality
   */
  getUsage?(): TokenUsage | undefined;
}
