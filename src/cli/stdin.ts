/**
 * Utilities for handling stdin (piped input)
 */

/**
 * Determines if input is being piped to the process
 *
 * @returns true if input is being piped, false otherwise
 */
export function hasPipedInput(): boolean {
  // When input is piped, stdin is not a TTY
  return !process.stdin.isTTY;
}

/**
 * Reads data piped to stdin
 *
 * @returns Promise that resolves to the piped input string
 */
export function getPipedInput(): Promise<string> {
  return new Promise((resolve, reject) => {
    // If there's no piped input, resolve with empty string
    if (!hasPipedInput()) {
      resolve('');
      return;
    }

    let inputData = '';

    // Set encoding to UTF-8
    process.stdin.setEncoding('utf8');

    // Listen for data chunks
    process.stdin.on('data', (chunk) => {
      inputData += chunk;
    });

    // When the stream ends, resolve with the collected data
    process.stdin.on('end', () => {
      resolve(inputData);
    });

    // Handle errors
    process.stdin.on('error', (err) => {
      reject(err);
    });
  });
}
