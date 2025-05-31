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
