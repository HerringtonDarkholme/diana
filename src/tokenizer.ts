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
  return /[A-Za-z_[].-\d"]/i.test(ch);
}

function isIdentifierChar(ch: string) {
  return /[A-Za-z0-9_.[\]"]/i.test(ch);
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
    if (ch === '[') {
      advance(); // skip [
      let innerStart = pos;
      readWhile(c => c !== ']');
      advance(); // skip ]
      skipWhitespace();
      if (peek() === ':') {
        let id = input.slice(innerStart - 1, pos); // includes [ and ]
        addToken('IDENTIFIER', id);
        continue;
      } else {
        pos = innerStart - 1; // rewind
        col -= (pos - (innerStart - 1));
        addToken('LBRACKET'); advance();
        skipWhitespace();
        while (pos < input.length && peek() !== ']') {
          if (isDigit(peek())) {
            let num = readWhile(isDigit);
            addToken('NUMBER', num);
            skipWhitespace();
            if (peek() === ',') { addToken('COMMA'); advance(); skipWhitespace(); }
          } else {
            advance();
          }
        }
        if (peek() === ']') { addToken('RBRACKET'); advance(); }
        continue;
      }
    }
    if (ch === '"') {
      // Quoted key or string
      let start = pos;
      advance(); // skip opening "
      readWhile(c => c !== '"');
      advance(); // skip closing "
      let id = input.slice(start, pos); // includes " and "
      skipWhitespace();
      if (peek() === ':') {
        addToken('IDENTIFIER', id);
        continue;
      } else {
        // Not a key, treat as STRING
        addToken('STRING', id.slice(1, -1));
        continue;
      }
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
    // Handle identifier, boolean, null
    if (isIdentifierStart(ch)) {
      let id = readWhile(isIdentifierChar);
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