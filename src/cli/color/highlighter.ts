import { stdout } from 'node:process';
import chalk, { type ChalkInstance } from 'chalk';
import type { Root, RootContent } from 'hast';
import { refractor } from 'refractor/all';

const DEBUG_MISSING_CLASSES = false;

export const FALLBACK_LANGUAGE = 'plaintext';

type TaggedToken = [token: string, classes: Set<string>];

function flattenHast(node: Root | RootContent): Array<TaggedToken> {
  const result: Array<[string, Set<string>]> = [];

  if (node.type === 'text') {
    // Text nodes get an empty set for classes
    result.push([node.value, new Set()]);
  }

  // Extract classes if they exist
  const classes: Set<string> = new Set();
  if (node.type === 'element' && node.properties && node.properties.className) {
    if (Array.isArray(node.properties.className)) {
      for (const cls of node.properties.className) {
        if (typeof cls === 'string' && cls !== 'token') {
          classes.add(cls as string);
        }
      }
    } else if (
      typeof node.properties.className === 'string' &&
      node.properties.className !== 'token'
    ) {
      classes.add(node.properties.className);
    }
  }

  // Process children if they exist
  if ('children' in node) {
    for (const child of node.children) {
      const childResults = flattenHast(child);

      // If this node has classes, apply them to direct text children
      if (classes.size > 0) {
        for (const [text, childClasses] of childResults) {
          const mergedClasses = new Set(childClasses);
          for (const cls of classes) {
            mergedClasses.add(cls);
          }
          result.push([text, mergedClasses]);
        }
      } else {
        // Otherwise just add the child results as is
        result.push(...childResults);
      }
    }
  }

  return result;
}

// earlier on the list is higher priority
const CLASSES = [
  'punctuation',
  'keyword',
  'parameter',
  'function',
  'macro',
  'function-definition',
  'string',
  'string-interpolation',
  'interpolation',
  'template-string',
  'number',
  'boolean',
  'class-name',
  'operator',
  'builtin',
  'function-variable',
  'comment',
  'symbol',
  'hvariable',
  'constant',
  'attr-name',
  'attr-value',
  'tag',
] as const;

type Class = (typeof CLASSES)[number];

function getHighestPriorityClass(classes: Set<string>): Class | null {
  // Go through priority list in order (highest priority first)
  for (const priorityClass of CLASSES) {
    if (classes.has(priorityClass)) {
      return priorityClass;
    }
  }

  if (DEBUG_MISSING_CLASSES && classes.size > 0) {
    console.error('unrecognized classes', classes);
  }

  return null;
}

function colorizerForClass(cls: Class): ChalkInstance {
  switch (cls) {
    case 'keyword':
      return chalk.magenta;
    case 'punctuation':
      return chalk.white;
    case 'parameter':
      return chalk.blue;
    case 'function':
    case 'macro':
    case 'function-definition':
      return chalk.green;
    case 'string':
    case 'template-string':
      return chalk.yellow;
    case 'number':
      return chalk.blue;
    case 'class-name':
      return chalk.cyan;
    case 'operator':
      return chalk.white;
    case 'builtin':
      return chalk.cyan;
    case 'comment':
      return chalk.gray;
    case 'function-variable':
      return chalk.blue;
    case 'tag':
      return chalk.magenta;
    case 'attr-name':
      return chalk.blue;
    case 'attr-value':
      return chalk.yellow;
    case 'boolean':
      return chalk.blue;
    case 'string-interpolation':
    case 'interpolation':
      return chalk.blue;
    case 'symbol':
      return chalk.blue;
    case 'hvariable':
      return chalk.green;
    case 'constant':
      return chalk.blue;
  }
}

function colorizeToken([token, classes]: TaggedToken): string {
  const cls = getHighestPriorityClass(classes);
  if (cls) {
    const colorizer = colorizerForClass(cls);
    return colorizer(token);
  }

  return token;
}

const TOP_LEFT = '╭';
const TOP_RIGHT = '╮';
const BOTTOM_LEFT = '╰';
const BOTTOM_RIGHT = '╯';
const HORIZONTAL = '─';
const VERTICAL = '│';

const LANGUAGE_NAME_INDENT = 1;

const terminalWidth = stdout.columns;

function formatCodeBlock(coloredCode: string, uncoloredCode: string, language: string): string {
  //  top border with language name
  const topLeftPadding = HORIZONTAL.repeat(LANGUAGE_NAME_INDENT);
  const topRightPadding = HORIZONTAL.repeat(
    terminalWidth - topLeftPadding.length - language.length - 4,
  );

  const topBorder =
    language === FALLBACK_LANGUAGE
      ? `${TOP_LEFT}${HORIZONTAL.repeat(terminalWidth - 2)}${TOP_RIGHT}`
      : `${TOP_LEFT}${topLeftPadding} ${language} ${topRightPadding}${TOP_RIGHT}`;

  const bottomBorder = `${BOTTOM_LEFT}${HORIZONTAL.repeat(terminalWidth - 2)}${BOTTOM_RIGHT}`;

  // for each line, add a vertical line on the left and right sides of the terminal
  const uncoloredLineLengths = uncoloredCode.split('\n').map((l) => l.length);
  const formattedCode = coloredCode
    .trim()
    .split('\n')
    .map((line, idx) => {
      const codeLength = uncoloredLineLengths[idx];
      const spaces = ' '.repeat(terminalWidth - codeLength - 2);
      return `${chalk.gray(VERTICAL)}${line}${spaces}${chalk.gray(VERTICAL)}`;
    })
    .join('\n');

  return `${chalk.gray(topBorder)}\n${formattedCode}${chalk.gray(bottomBorder)}`;
}

export function highlight(code: string, language: string): string {
  const hast = refractor.highlight(code, language);

  const flattenedNodes = flattenHast(hast);

  const coloredCode = flattenedNodes.map(colorizeToken).join('');

  const fullCode = formatCodeBlock(coloredCode, code, language);

  return fullCode;
}
