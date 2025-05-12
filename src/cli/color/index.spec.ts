import { beforeEach, describe, expect, it, vi } from 'vitest';
import { colorCodeBlocks } from '.';
import * as highlighter from './highlighter';

const highlightSpy = vi.spyOn(highlighter, 'highlight');

describe('code coloring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('identifies multiple code blocks in a single snippet', () => {
    const input = `
    ## Continuation Example
    
    \`\`\`shell
    # Ask an initial question
    sy "What are the SOLID principles in software design?"
    
    # Continue the conversation with follow-up questions
    sy -e "Can you explain the first one in more detail?"
    sy -e "How does that compare to the Open/Closed Principle?"
    \`\`\`
    
    ## Configuration
    
    \`\`\`toml
    # General settings
    [general]
    # Whether to stream responses by default (default true)
    stream = true
    \`\`\`
    `;

    colorCodeBlocks(input);

    expect(highlightSpy).toHaveBeenCalledWith(expect.anything(), 'shell');
    expect(highlightSpy).toHaveBeenCalledWith(expect.anything(), 'toml');
  });

  it('preserves indentation', () => {
    const spy = vi.spyOn(highlighter, 'highlight');

    const input = `
    Here's a simple TypeScript function:
    \`\`\`typescript
      function myAbsVal(x: number): number {
        if( x < 0 ) {
          return -x;
        }
        return x;
      }
    \`\`\`
    Cool, huh?
    `;

    const code = `      function myAbsVal(x: number): number {
        if( x < 0 ) {
          return -x;
        }
        return x;
      }
    `;
    colorCodeBlocks(input);

    expect(spy).toHaveBeenCalledWith(code, 'typescript');
  });

  it('identifies code blocks that are not complete', () => {
    const spy = vi.spyOn(highlighter, 'highlight');

    const input = `
    Here's a simple TypeScript function:
    \`\`\`typescript
      function myAbsVal(x: number): number {
        if( x < 0 ) {
          return -x;
    `;

    const code = `      function myAbsVal(x: number): number {
        if( x < 0 ) {
          return -x;
    `;
    colorCodeBlocks(input);

    expect(spy).toHaveBeenCalledWith(code, 'typescript');
  });
});
