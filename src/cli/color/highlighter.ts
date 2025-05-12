import chalk from 'chalk';
import type { RootContent } from 'hast';
import { refractor } from 'refractor/all';

function padLines(text: string): string {
  const termWidth = process.stdout.columns;

  return text
    .split('\n')
    .map((line) => line + ' '.repeat(termWidth - line.length))
    .join('\n');
}

// TODO: instead of this, try doing some nice horizontal rules, maybe
// with the language name in the middle?
function restoreBackticks(text: string, language: string): string {
  const topLine = padLines(`\`\`\`${language}`);
  const bottomLine = padLines('```');
  return `${topLine}\n${text}${bottomLine}`;
}

export function highlight(code: string, language: string): string {
  const paddedCode = padLines(code);

  const tree = refractor.highlight(paddedCode, language);

  const coloredCode = tree.children
    .map((node: RootContent) => {
      if (node.type === 'text') {
        return node.value;
      }

      if (node.type === 'element') {
        const secondClassName = (node.properties?.className as string[])[1];
        // FIXME: need to hanlde when this is not defined
        // @ts-ignore
        const value = node.children[0].value;

        switch (secondClassName) {
          case 'keyword':
            return chalk.magenta(value);
          case 'punctuation':
            return chalk.white(value);
          case 'parameter':
            return chalk.blue(value);
          case 'function':
          case 'macro':
          case 'function-definition':
            return chalk.green(value);
          case 'string':
          case 'template-string':
            return chalk.yellow(value);
          case 'number':
            return chalk.blue(value);
          case 'class-name':
            return chalk.cyan(value);
          case 'operator':
            return chalk.white(value);
          case 'builtin':
            return chalk.cyan(value);
          case 'comment':
            return chalk.gray(value);
          case 'function-variable':
            return chalk.blue(value);
          default:
            return value ?? '';
        }
      }
    })
    .join('');

  const fullCode = restoreBackticks(coloredCode, language);

  return fullCode;
}
