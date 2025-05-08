/**
 * Utilities for handling prompts with piped input
 */

import { getPipedInput, hasPipedInput } from './stdin';

/**
 * Creates a combined prompt using the provided prompt text and any piped input
 *
 * When input is piped to the command, it's appended to the user's prompt with
 * newlines in between, allowing for use cases like:
 * `cat file.js | sy "Explain this code"`
 *
 * @param prompt - The original prompt text
 * @returns A promise that resolves to the combined prompt text
 */
export async function createPromptWithPipedInput(prompt: string): Promise<string> {
  // Check if we have piped input
  if (!hasPipedInput()) {
    return prompt;
  }

  // Get the piped input content
  const pipedInput = await getPipedInput();

  // If piped input is empty, just return the original prompt
  if (!pipedInput) {
    return prompt;
  }

  // Combine the prompt and piped input with newlines in between
  return `${prompt}\n\n${pipedInput}`;
}
