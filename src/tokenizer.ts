// Tokenizer for Diana language

export type TokenType =
  | 'COMMENT'
  | 'IDENTIFIER'
  | 'NUMBER'
  | 'STRING'
  | 'BOOLEAN'
  | 'NULL'
  | 'COLON'
  | 'COMMA'
  | 'LBRACE'
  | 'RBRACE'
  | 'LBRACKET'
  | 'RBRACKET'
  | 'ASTERISK'
  | 'NEWLINE'
  | 'INDENT'
  | 'DEDENT'
  | 'EOF';

export interface Token {
  type: TokenType;
  value?: string;
  line: number;
  column: number;
}

const KEYWORDS = {
  'true': 'BOOLEAN',
  'false': 'BOOLEAN',
  'null': 'NULL',
};

function isWhitespace(ch: string) {
  return ch === ' ' || ch === '\t';
}

function isDigit(ch: string) {
  return /[0-9]/.test(ch);
}

function isIdentifierStart(ch: string) {
  return /[A-Za-z_\[\]\.\-\d"]/i.test(ch);
}

function isIdentifierChar(ch: string) {
  return /[A-Za-z0-9_\.\-\[\]"]/i.test(ch);
}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;
  let line = 1;
  let col = 1;
  let indentStack = [0];

  function addToken(type: TokenType, value?: string) {
    tokens.push({ type, value, line, column: col });
  }

  function advance(n = 1) {
    for (let i = 0; i < n; i++) {
      if (input[pos] === '\n') {
        line++;
        col = 1;
      } else {
        col++;
      }
      pos++;
    }
  }

  function peek(n = 0) {
    return input[pos + n];
  }

  function readWhile(predicate: (ch: string) => boolean) {
    let start = pos;
    while (pos < input.length && predicate(input[pos])) {
      advance();
    }
    return input.slice(start, pos);
  }

  function skipWhitespace() {
    while (isWhitespace(peek())) advance();
  }

  function handleIndentation() {
    let start = pos;
    let spaces = 0;
    while (peek() === ' ') {
      advance();
      spaces++;
    }
    if (peek() === '\n' || peek() === undefined) return; // blank line
    if (spaces > indentStack[indentStack.length - 1]) {
      indentStack.push(spaces);
      addToken('INDENT');
    } else {
      while (spaces < indentStack[indentStack.length - 1]) {
        indentStack.pop();
        addToken('DEDENT');
      }
    }
  }

  while (pos < input.length) {
    let ch = peek();
    // Handle comments
    if (ch === ';') {
      let startCol = col;
      let comment = '';
      while (peek() && peek() !== '\n') {
        comment += peek();
        advance();
      }
      addToken('COMMENT', comment);
      continue;
    }
    // Handle whitespace
    if (isWhitespace(ch)) {
      skipWhitespace();
      continue;
    }
    // Handle newlines and indentation
    if (ch === '\n') {
      addToken('NEWLINE');
      advance();
      handleIndentation();
      continue;
    }
    // Handle punctuation
    if (ch === ':') { addToken('COLON'); advance(); continue; }
    if (ch === ',') { addToken('COMMA'); advance(); continue; }
    if (ch === '{') { addToken('LBRACE'); advance(); continue; }
    if (ch === '}') { addToken('RBRACE'); advance(); continue; }
    if (ch === '[') { addToken('LBRACKET'); advance(); continue; }
    if (ch === ']') { addToken('RBRACKET'); advance(); continue; }
    if (ch === '*') { addToken('ASTERISK'); advance(); continue; }
    // Handle multi-line string
    if (ch === '"' && peek(1) === '"' && peek(2) === '"') {
      let startCol = col;
      advance(3); // skip """
      let str = '';
      while (!(peek() === '"' && peek(1) === '"' && peek(2) === '"') && pos < input.length) {
        str += peek();
        advance();
      }
      advance(3); // skip closing """
      addToken('STRING', str);
      continue;
    }
    // Handle string
    if (ch === '"') {
      let str = '';
      advance(); // skip opening "
      while (peek() !== '"' && pos < input.length) {
        if (peek() === '\\' && peek(1) === '"') {
          str += '"';
          advance(2);
        } else {
          str += peek();
          advance();
        }
      }
      advance(); // skip closing "
      addToken('STRING', str);
      continue;
    }
    // Handle number (int, float, scientific)
    if (isDigit(ch) || (ch === '-' && isDigit(peek(1)))) {
      let num = '';
      if (ch === '-') {
        num += '-';
        advance();
      }
      num += readWhile(c => isDigit(c));
      if (peek() === '.') {
        num += '.';
        advance();
        num += readWhile(c => isDigit(c));
      }
      if (peek() === 'e' || peek() === 'E') {
        num += peek();
        advance();
        if (peek() === '+' || peek() === '-') {
          num += peek();
          advance();
        }
        num += readWhile(c => isDigit(c));
      }
      addToken('NUMBER', num);
      continue;
    }
    // Handle identifier, boolean, null, bracketed/quoted keys
    if (isIdentifierStart(ch)) {
      let id = '';
      if (ch === '[') {
        advance();
        id = '[' + readWhile(c => c !== ']') + ']';
        advance(); // skip closing ]
      } else if (ch === '"') {
        advance();
        id = '"' + readWhile(c => c !== '"') + '"';
        advance(); // skip closing "
      } else {
        id = readWhile(isIdentifierChar);
      }
      if (id in KEYWORDS) {
        addToken(KEYWORDS[id as keyof typeof KEYWORDS] as TokenType, id);
      } else {
        addToken('IDENTIFIER', id);
      }
      continue;
    }
    // Unknown character, skip
    advance();
  }
  // Handle dedents at EOF
  while (indentStack.length > 1) {
    indentStack.pop();
    addToken('DEDENT');
  }
  addToken('EOF');
  return tokens;
} 