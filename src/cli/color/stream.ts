import * as ansiEscapes from 'ansi-escapes'; // For terminal manipulation
import type { Conversation } from '../../conversation';
import type { LLM } from '../../llm';
import { FALLBACK_LANGUAGE, highlight } from './highlighter';

const CODE_BLOCK_START_REGEX = /\`\`\`(\w*)?\n/;
const CODE_BLOCK_END_REGEX = /\`\`\`\s*$/;

/**
 * stream text from LLM with code block highlighting

 * @param llm The language model client
 * @param conversation The conversation to stream from
 */
export async function streamWithCodeColor(llm: LLM, conversation: Conversation): Promise<string> {
  let rawResponse = '';

  let buffer = '';
  let inCodeBlock = false;
  let codeBuffer = '';
  let language = '';
  let codeBlockLineCount = 0;

  const deletePreviousRender = () => {
    if (codeBlockLineCount > 0) {
      process.stdout.write(ansiEscapes.cursorUp(codeBlockLineCount));
      process.stdout.write(ansiEscapes.cursorLeft);
      process.stdout.write(ansiEscapes.eraseDown);
    }
  };

  const renderCode = () => {
    const highlightedCode = highlight(codeBuffer, language);
    process.stdout.write(highlightedCode);

    codeBlockLineCount = (highlightedCode.match(/\n/g) || []).length + 1;
  };

  for await (const chunk of llm.streamText(conversation.messages)) {
    rawResponse += chunk;

    if (inCodeBlock) {
      // check if this chunk contains the end of the code block
      const combinedCode = codeBuffer + chunk;
      const endMatch = combinedCode.match(CODE_BLOCK_END_REGEX);

      if (endMatch?.index !== undefined) {
        // code block is complete
        inCodeBlock = false;

        // extract everything before the end marker
        codeBuffer = combinedCode.substring(0, endMatch.index);

        deletePreviousRender();
        renderCode();
        // HACK: dunno why but I have to print these extra lines to get the spaces
        // after the code block that the LLM always puts
        process.stdout.write('\n\n');

        codeBuffer = '';

        // print the remaining chunk after the code block end
        const remainingText = combinedCode.substring(endMatch.index + endMatch[0].length);
        if (remainingText) {
          process.stdout.write(remainingText);
        }
      } else {
        // still in code block, update buffer and re-render
        codeBuffer += chunk;
        deletePreviousRender();
        renderCode();
      }
    } else {
      // not in a code block, check if this chunk starts one
      buffer += chunk;

      const startMatch = buffer.match(CODE_BLOCK_START_REGEX);
      if (startMatch?.index !== undefined) {
        // initialize code block tracking
        inCodeBlock = true;
        language = startMatch[1] || FALLBACK_LANGUAGE;

        // start collecting the code content (everything after the ```language)
        codeBuffer = buffer.substring(startMatch.index + startMatch[0].length);
        buffer = '';

        // initial render of the code block (may be empty at first)
        renderCode();
      } else {
        // proceed normally
        process.stdout.write(chunk);

        // clear buffer if it gets too long without finding a code block
        if (buffer.length > 100) {
          buffer = buffer.slice(-20);
        }
      }
    }
  }

  return rawResponse;
}
