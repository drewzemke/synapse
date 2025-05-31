import { FALLBACK_LANGUAGE, highlight } from './highlighter';

export function colorCodeBlocks(input: string): string {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)($|```)/g;

  return input.replace(codeBlockRegex, (_, language, code) => {
    const highlightedCode = highlight(code, language || FALLBACK_LANGUAGE);
    return highlightedCode;
  });
}
