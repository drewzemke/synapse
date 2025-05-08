import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getPipedInput, hasPipedInput } from './stdin';

describe('Stdin Handling', () => {
  // Store original stdin properties to restore later
  let originalStdin: NodeJS.ReadStream;
  let originalIsTTY: boolean | undefined;

  beforeEach(() => {
    // Save original stdin
    originalStdin = process.stdin;
    originalIsTTY = process.stdin.isTTY;
  });

  afterEach(() => {
    // Restore original stdin
    Object.defineProperty(process, 'stdin', {
      value: originalStdin,
      writable: true,
    });

    if (originalIsTTY !== undefined) {
      Object.defineProperty(process.stdin, 'isTTY', {
        value: originalIsTTY,
        writable: true,
      });
    }

    // Clear mocks
    vi.restoreAllMocks();
  });

  // Expected use test - detecting piped input
  it('should detect when input is piped', async () => {
    // Mock stdin to simulate piped input
    Object.defineProperty(process.stdin, 'isTTY', {
      value: false,
      writable: true,
    });

    expect(hasPipedInput()).toBe(true);
  });

  // Expected use test - detecting no piped input
  it('should detect when input is not piped', async () => {
    // Mock stdin to simulate terminal input (no pipe)
    Object.defineProperty(process.stdin, 'isTTY', {
      value: true,
      writable: true,
    });

    expect(hasPipedInput()).toBe(false);
  });

  // Expected use test - reading piped input
  it('should read piped input correctly', async () => {
    // Mock data to be read from stdin
    const mockData = 'const add = (a, b) => a + b;\nconsole.log(add(1, 2));';

    // Create a mock for stdin
    const mockStdin = {
      isTTY: false,
      setEncoding: vi.fn(),
      on: vi.fn().mockImplementation((event, callback) => {
        if (event === 'data') {
          callback(mockData);
        }
        if (event === 'end') {
          callback();
        }
        return mockStdin;
      }),
    };

    // Replace process.stdin with our mock
    Object.defineProperty(process, 'stdin', {
      value: mockStdin,
      writable: true,
    });

    const pipedInput = await getPipedInput();
    expect(pipedInput).toBe(mockData);
    expect(mockStdin.setEncoding).toHaveBeenCalledWith('utf8');
  });

  // Edge case - empty piped input
  it('should handle empty piped input', async () => {
    // Create a mock for stdin with empty data
    const mockStdin = {
      isTTY: false,
      setEncoding: vi.fn(),
      on: vi.fn().mockImplementation((event, callback) => {
        if (event === 'data') {
          // Don't call with any data - simulate empty pipe
        }
        if (event === 'end') {
          callback();
        }
        return mockStdin;
      }),
    };

    // Replace process.stdin with our mock
    Object.defineProperty(process, 'stdin', {
      value: mockStdin,
      writable: true,
    });

    const pipedInput = await getPipedInput();
    expect(pipedInput).toBe('');
  });

  // Edge case - large input
  it('should handle large piped input', async () => {
    // Create a very large input string
    const largeInput = 'x'.repeat(1000000);

    // Mock for stdin delivering large input
    const mockStdin = {
      isTTY: false,
      setEncoding: vi.fn(),
      on: vi.fn().mockImplementation((event, callback) => {
        if (event === 'data') {
          // Split the large input into chunks to simulate realistic behavior
          const chunkSize = 100000;
          for (let i = 0; i < largeInput.length; i += chunkSize) {
            callback(largeInput.slice(i, i + chunkSize));
          }
        }
        if (event === 'end') {
          callback();
        }
        return mockStdin;
      }),
    };

    // Replace process.stdin with our mock
    Object.defineProperty(process, 'stdin', {
      value: mockStdin,
      writable: true,
    });

    const pipedInput = await getPipedInput();
    expect(pipedInput).toBe(largeInput);
    expect(pipedInput.length).toBe(largeInput.length);
  });

  // Failure case - error in stdin
  it('should handle stdin errors', async () => {
    // Mock for stdin that emits an error
    const mockStdin = {
      isTTY: false,
      setEncoding: vi.fn(),
      on: vi.fn().mockImplementation((event, callback) => {
        if (event === 'error') {
          callback(new Error('Mock stdin error'));
        }
        return mockStdin;
      }),
    };

    // Replace process.stdin with our mock
    Object.defineProperty(process, 'stdin', {
      value: mockStdin,
      writable: true,
    });

    // Error should be thrown when reading from stdin
    await expect(getPipedInput()).rejects.toThrow('Mock stdin error');
  });
});
