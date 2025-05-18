import { type Spinner, createSpinner } from 'nanospinner';

let activeSpinner: Spinner | null = null;

/**
 * Start a spinner to indicate processing
 *
 * @param text The message to display next to the spinner
 * @returns The spinner instance
 */
export function startSpinner(text: string | undefined = undefined) {
  // don't do anything if there's no terminal to output to
  if (!process.stdout.isTTY) return;

  if (activeSpinner) {
    activeSpinner.clear();
    activeSpinner.stop();
    activeSpinner = null;
  }

  activeSpinner = createSpinner(text, { stream: process.stdout, color: 'cyan' });
  activeSpinner.start();
}

/**
 * Stop the active spinner
 */
export function stopSpinner(): void {
  if (activeSpinner) {
    activeSpinner.clear();
    activeSpinner.stop();
    activeSpinner = null;
  }
}
