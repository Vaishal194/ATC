import { EPSILON } from '../types/automata';
import { RegexToken } from '../types/regex';

export interface ParseResult {
  isValid: boolean;
  error?: string;
  postfix: string[];
  alphabet: string[];
  formattedWithConcat: string;
}

/**
 * Validates and tokenizes an input regular expression.
 */
export function tokenizeRegex(input: string): { tokens: RegexToken[]; alphabet: string[]; error?: string } {
  const cleanInput = input.trim();
  if (!cleanInput) {
    return { tokens: [], alphabet: [], error: 'Regular expression cannot be empty.' };
  }

  const tokens: RegexToken[] = [];
  const alphabetSet = new Set<string>();

  let i = 0;
  while (i < cleanInput.length) {
    const ch = cleanInput[i];

    // Skip whitespace
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Check for explicit epsilon symbols: 'ε', 'E', or 'eps'
    if (ch === 'ε') {
      tokens.push({ type: 'OPERAND', value: EPSILON, position: i });
      i++;
      continue;
    }

    if (cleanInput.slice(i, i + 3).toLowerCase() === 'eps') {
      tokens.push({ type: 'OPERAND', value: EPSILON, position: i });
      i += 3;
      continue;
    }

    if (ch === '(') {
      tokens.push({ type: 'LPAREN', value: '(', position: i });
      i++;
    } else if (ch === ')') {
      tokens.push({ type: 'RPAREN', value: ')', position: i });
      i++;
    } else if (ch === '|') {
      tokens.push({ type: 'UNION', value: '|', position: i });
      i++;
    } else if (ch === '.') {
      tokens.push({ type: 'CONCAT', value: '.', position: i });
      i++;
    } else if (ch === '*') {
      tokens.push({ type: 'STAR', value: '*', position: i });
      i++;
    } else if (ch === '+') {
      tokens.push({ type: 'PLUS', value: '+', position: i });
      i++;
    } else {
      // Ordinary alphabet symbol (alphanumeric or punctuation other than regex ops)
      tokens.push({ type: 'OPERAND', value: ch, position: i });
      alphabetSet.add(ch);
      i++;
    }
  }

  return { tokens, alphabet: Array.from(alphabetSet).sort() };
}

/**
 * Inserts explicit concatenation tokens '.' into the token stream.
 * e.g., 'ab' -> 'a.b', '(a|b)c' -> '(a|b).c', 'a*b' -> 'a*.b'
 */
export function insertExplicitConcat(tokens: RegexToken[]): { tokensWithConcat: RegexToken[]; error?: string } {
  if (tokens.length === 0) {
    return { tokensWithConcat: [] };
  }

  const result: RegexToken[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const current = tokens[i];
    result.push(current);

    if (i + 1 < tokens.length) {
      const next = tokens[i + 1];

      const currentCanEndOperand =
        current.type === 'OPERAND' ||
        current.type === 'STAR' ||
        current.type === 'PLUS' ||
        current.type === 'RPAREN';

      const nextCanStartOperand =
        next.type === 'OPERAND' ||
        next.type === 'LPAREN';

      if (currentCanEndOperand && nextCanStartOperand) {
        result.push({
          type: 'CONCAT',
          value: '.',
          position: current.position,
        });
      }
    }
  }

  return { tokensWithConcat: result };
}

/**
 * Validates the token stream for syntactic correctness:
 * - Matching parentheses
 * - No empty groups ()
 * - No dangling binary operators (| at start or end, consecutive operators ||)
 * - No misplaced unary operators (* or + at start or right after | or ()
 */
export function validateTokenStream(tokens: RegexToken[]): string | null {
  if (tokens.length === 0) return 'Expression contains no valid symbols.';

  let parenDepth = 0;

  for (let i = 0; i < tokens.length; i++) {
    const curr = tokens[i];
    const prev = i > 0 ? tokens[i - 1] : null;
    const next = i + 1 < tokens.length ? tokens[i + 1] : null;

    if (curr.type === 'LPAREN') {
      parenDepth++;
      if (next && next.type === 'RPAREN') {
        return 'Empty group "()" is not allowed. Use "ε" for empty string.';
      }
    } else if (curr.type === 'RPAREN') {
      parenDepth--;
      if (parenDepth < 0) {
        return `Unexpected closing parenthesis ')' at character position ${curr.position + 1}.`;
      }
    } else if (curr.type === 'UNION' || curr.type === 'CONCAT') {
      if (!prev || prev.type === 'LPAREN' || prev.type === 'UNION' || prev.type === 'CONCAT') {
        return `Operator '${curr.value}' at position ${curr.position + 1} is missing a preceding operand.`;
      }
      if (!next || next.type === 'RPAREN' || next.type === 'UNION' || next.type === 'CONCAT' || next.type === 'STAR' || next.type === 'PLUS') {
        return `Operator '${curr.value}' at position ${curr.position + 1} is missing a following operand.`;
      }
    } else if (curr.type === 'STAR' || curr.type === 'PLUS') {
      if (!prev || prev.type === 'LPAREN' || prev.type === 'UNION' || prev.type === 'CONCAT') {
        return `Unary operator '${curr.value}' at position ${curr.position + 1} has no preceding operand to repeat.`;
      }
      if (prev.type === 'STAR' || prev.type === 'PLUS') {
        return `Consecutive unary operator '${curr.value}' at position ${curr.position + 1} is not allowed.`;
      }
    }
  }

  if (parenDepth !== 0) {
    return 'Unbalanced parentheses: missing one or more closing ")".';
  }

  return null;
}

/**
 * Converts infix regular expression tokens with explicit concatenations
 * into Postfix (Reverse Polish Notation) using Dijkstra's Shunting-Yard Algorithm.
 */
export function infixToPostfix(tokens: RegexToken[]): string[] {
  const output: string[] = [];
  const operatorStack: RegexToken[] = [];

  const precedence: Record<string, number> = {
    '*': 3,
    '+': 3,
    '.': 2,
    '|': 1,
  };

  for (const token of tokens) {
    if (token.type === 'OPERAND') {
      output.push(token.value);
    } else if (token.type === 'STAR' || token.type === 'PLUS') {
      // Unary operators have highest precedence and can be output immediately in postfix
      output.push(token.value);
    } else if (token.type === 'LPAREN') {
      operatorStack.push(token);
    } else if (token.type === 'RPAREN') {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== 'LPAREN') {
        output.push(operatorStack.pop()!.value);
      }
      if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type === 'LPAREN') {
        operatorStack.pop(); // Remove '('
      }
    } else if (token.type === 'UNION' || token.type === 'CONCAT') {
      const currentPrec = precedence[token.value] || 0;
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1].type !== 'LPAREN' &&
        (precedence[operatorStack[operatorStack.length - 1].value] || 0) >= currentPrec
      ) {
        output.push(operatorStack.pop()!.value);
      }
      operatorStack.push(token);
    }
  }

  while (operatorStack.length > 0) {
    output.push(operatorStack.pop()!.value);
  }

  return output;
}

/**
 * Master parser function that runs the complete pipeline:
 * Tokenize -> Validate -> Insert Concat -> Infix to Postfix
 */
export function parseRegex(input: string): ParseResult {
  const { tokens, alphabet, error: tokenError } = tokenizeRegex(input);
  if (tokenError) {
    return { isValid: false, error: tokenError, postfix: [], alphabet: [], formattedWithConcat: '' };
  }

  const validationError = validateTokenStream(tokens);
  if (validationError) {
    return { isValid: false, error: validationError, postfix: [], alphabet, formattedWithConcat: '' };
  }

  const { tokensWithConcat } = insertExplicitConcat(tokens);
  const formattedWithConcat = tokensWithConcat.map((t) => t.value).join('');

  const postfix = infixToPostfix(tokensWithConcat);

  return {
    isValid: true,
    postfix,
    alphabet,
    formattedWithConcat,
  };
}
