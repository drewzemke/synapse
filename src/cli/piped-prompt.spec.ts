import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPromptWithPipedInput } from './piped-prompt';

// Mock the stdin utility functions
vi.mock('./stdin', () => ({
  hasPipedInput: vi.fn(),
  getPipedInput: vi.fn(),
}));

import { getPipedInput, hasPipedInput } from './stdin';

// Type the mocked functions correctly
const mockedHasPipedInput = hasPipedInput as unknown as Mock;
const mockedGetPipedInput = getPipedInput as unknown as Mock;

describe('Piped Prompt Handling', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // Expected use test - with piped input
  it('should combine prompt with piped input when available', async () => {
    // Setup mocks
    const mockPipedInput = 'const add = (a, b) => a + b;\nconsole.log(add(1, 2));';
    const mockPrompt = 'Explain this code';

    mockedHasPipedInput.mockReturnValue(true);
    mockedGetPipedInput.mockResolvedValue(mockPipedInput);

    // Call the function
    const combinedPrompt = await createPromptWithPipedInput(mockPrompt);

    // Verify the combined prompt has both parts
    expect(combinedPrompt).toBe(`${mockPrompt}\n\n${mockPipedInput}`);
    expect(mockedHasPipedInput).toHaveBeenCalled();
    expect(mockedGetPipedInput).toHaveBeenCalled();
  });

  // Test case - no piped input
  it('should return original prompt when no piped input exists', async () => {
    // Setup mocks
    const mockPrompt = 'What is a binary tree?';

    mockedHasPipedInput.mockReturnValue(false);

    // Call the function
    const result = await createPromptWithPipedInput(mockPrompt);

    // Verify the original prompt is returned unchanged
    expect(result).toBe(mockPrompt);
    expect(mockedHasPipedInput).toHaveBeenCalled();
    expect(mockedGetPipedInput).not.toHaveBeenCalled(); // getPipedInput should not be called
  });

  // Edge case - empty prompt with piped input
  it('should handle empty prompt with piped input', async () => {
    // Setup mocks with empty prompt
    const mockPipedInput = 'function fetchData() { /* code */ }';
    const mockPrompt = '';

    mockedHasPipedInput.mockReturnValue(true);
    mockedGetPipedInput.mockResolvedValue(mockPipedInput);

    // Call the function
    const combinedPrompt = await createPromptWithPipedInput(mockPrompt);

    // Should still include the piped input with newlines
    expect(combinedPrompt).toBe(`\n\n${mockPipedInput}`);
  });

  // Edge case - prompt with piped input that is empty
  it('should handle prompt with empty piped input', async () => {
    // Setup mocks with empty piped input
    const mockPipedInput = '';
    const mockPrompt = 'What is the meaning of life?';

    mockedHasPipedInput.mockReturnValue(true);
    mockedGetPipedInput.mockResolvedValue(mockPipedInput);

    // Call the function
    const combinedPrompt = await createPromptWithPipedInput(mockPrompt);

    // Should just be the original prompt without additional newlines
    expect(combinedPrompt).toBe(mockPrompt);
  });

  // Failure case - error while reading piped input
  it('should handle errors when reading piped input', async () => {
    // Setup mocks to simulate error
    const mockPrompt = 'Analyze this';
    const mockError = new Error('Failed to read from stdin');

    mockedHasPipedInput.mockReturnValue(true);
    mockedGetPipedInput.mockRejectedValue(mockError);

    // Call the function and expect it to throw
    await expect(createPromptWithPipedInput(mockPrompt)).rejects.toThrow(mockError);
  });
});
