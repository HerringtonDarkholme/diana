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
  | 'EOF'

export interface Token {
  type: TokenType
  value?: string
  line: number
  column: number
}

const KEYWORDS = {
  'true': 'BOOLEAN',
  'false': 'BOOLEAN',
  'null': 'NULL',
}

function isWhitespace(ch: string) {
  return ch === ' ' || ch === '\t'
}

function isDigit(ch: string) {
  return /[0-9]/.test(ch)
}

function isIdentifierStart(ch: string) {
  // Only allow identifiers to start with a letter, underscore, or quote (for quoted keys)
  return /[A-Za-z_\"]/i.test(ch)
}

function isIdentifierChar(ch: string) {
  // Allow letters, digits, underscores, dots, brackets, and quotes in identifiers
  return /[A-Za-z0-9_\.\[\]\"-]/i.test(ch)
}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let pos = 0
  let line = 1
  let col = 1
  let indentStack = [0]

  function addToken(type: TokenType, value?: string) {
    tokens.push({ type, value, line, column: col })
  }

  function advance(n = 1) {
    for (let i = 0; i < n; i++) {
      if (input[pos] === '\n') {
        line++
        col = 1
      } else {
        col++
      }
      pos++
    }
  }

  function peek(n = 0) {
    return input[pos + n]
  }

  function readWhile(predicate: (ch: string) => boolean) {
    let start = pos
    while (pos < input.length && predicate(input[pos])) {
      advance()
    }
    return input.slice(start, pos)
  }

  function skipWhitespace() {
    while (isWhitespace(peek())) advance()
  }

  function handleIndentation() {
    let spaces = 0
    while (peek() === ' ') {
      advance()
      spaces++
    }
    if (peek() === '\n' || peek() === undefined) return; // blank line
    if (spaces > indentStack[indentStack.length - 1]) {
      indentStack.push(spaces)
      addToken('INDENT')
    } else {
      while (spaces < indentStack[indentStack.length - 1]) {
        indentStack.pop()
        addToken('DEDENT')
      }
    }
  }

  while (pos < input.length) {
    let ch = peek()
    // Handle comments
    if (ch === ';') {
      let comment = ''
      while (peek() && peek() !== '\n') {
        comment += peek()
        advance()
      }
      addToken('COMMENT', comment)
      continue
    }
    // Handle whitespace
    if (isWhitespace(ch)) {
      skipWhitespace()
      continue
    }
    // Handle newlines and indentation
    if (ch === '\n') {
      addToken('NEWLINE')
      advance()
      handleIndentation()
      continue
    }
    // Handle punctuation
    if (ch === ':') { addToken('COLON'); advance(); continue; }
    if (ch === ',') { addToken('COMMA'); advance(); continue; }
    if (ch === '{') { addToken('LBRACE'); advance(); continue; }
    if (ch === '}') { addToken('RBRACE'); advance(); continue; }
    if (ch === '[') {
      // Check for special key: [123]:
      let start = pos
      advance(); // skip [
      while (peek() && peek() !== ']') advance();
      if (peek() === ']') advance(); // skip ]
      let end = pos;
      skipWhitespace();
      if (peek() === ':') {
        // This is a special key
        let key = input.slice(start, end); // includes [ and ]
        addToken('IDENTIFIER', key)
        continue;
      } else {
        // Not a special key, treat as LBRACKET
        pos = start;
        col -= (pos - start);
        addToken('LBRACKET'); advance();
        continue;
      }
    }
    if (ch === ']') { addToken('RBRACKET'); advance(); continue; }
    // Handle quoted keys or strings
    if (ch === '"') {
      // Check for triple-quoted string
      if (peek(1) === '"' && peek(2) === '"') {
        // Triple-quoted string
        advance(3); // skip opening """
        let str = '';
        while (pos < input.length && !(peek() === '"' && peek(1) === '"' && peek(2) === '"')) {
          str += peek();
          advance();
        }
        if (peek() === '"' && peek(1) === '"' && peek(2) === '"') {
          advance(3); // skip closing """
        }
        skipWhitespace();
        if (peek() === ':') {
          addToken('IDENTIFIER', '"""' + str + '"""');
          continue;
        } else {
          addToken('STRING', str);
          continue;
        }
      } else {
        let start = pos;
        advance(); // skip opening "
        readWhile(c => c !== '"')
        advance(); // skip closing "
        let str = input.slice(start, pos); // includes quotes
        skipWhitespace();
        if (peek() === ':') {
          addToken('IDENTIFIER', str)
          continue
        } else {
          addToken('STRING', str.slice(1, -1))
          continue
        }
      }
    }
    // Handle number (int, float, scientific)
    if (isDigit(ch) || (ch === '-' && isDigit(peek(1)))) {
      let num = ''
      if (ch === '-') {
        num += '-'
        advance()
      }
      num += readWhile(c => isDigit(c))
      if (peek() === '.') {
        num += '.'
        advance()
        num += readWhile(c => isDigit(c))
      }
      if (peek() === 'e' || peek() === 'E') {
        num += peek()
        advance()
        if (peek() === '+' || peek() === '-') {
          num += peek()
          advance()
        }
        num += readWhile(c => isDigit(c))
      }
      addToken('NUMBER', num)
      continue
    }
    // Handle identifier, boolean, null
    if (isIdentifierStart(ch)) {
      let id = readWhile(isIdentifierChar)
      if (id === 'true' || id === 'false') {
        addToken('BOOLEAN', id)
      } else if (id === 'null') {
        addToken('NULL', id)
      } else {
        addToken('IDENTIFIER', id)
      }
      continue
    }
    // Unknown character, skip
    advance()
  }
  // Handle dedents at EOF
  while (indentStack.length > 1) {
    indentStack.pop()
    addToken('DEDENT')
  }
  addToken('EOF')
  return tokens
}
