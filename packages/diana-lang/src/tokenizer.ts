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
  | 'ERROR'
  | 'EOF'

export interface Token {
  type: TokenType
  value?: string
  line: number
  column: number
}

function isWhitespace(ch: string) {
  return ch === ' ' || ch === '\t'
}

function isDigit(ch: string) {
  return /[0-9]/.test(ch)
}

function isIdentifierStart(ch: string) {
  // Only allow identifiers to start with a letter, underscore, or quote (for quoted keys)
  return /[A-Za-z_"]/i.test(ch)
}

function isIdentifierChar(ch: string) {
  // Allow letters, digits, underscores, dots, and quotes in identifiers
  // Note: brackets are handled separately for computed keys
  return /[A-Za-z0-9_."'-]/i.test(ch)
}

function isNumberStart(ch: string, next: string) {
  // Accepts .5, 0.5, -0.5, -.5, etc.
  return isDigit(ch) || (ch === '-' && (isDigit(next) || next === '.')) || (ch === '.' && isDigit(next))
}

function readTripleQuotedString(input: string, pos: number, line: number, col: number) {
  // Helper to read triple-quoted strings, returns {str, newPos, newLine, newCol, error}
  let str = ''
  pos += 3; col += 3
  while (pos < input.length && !(input[pos] === '"' && input[pos+1] === '"' && input[pos+2] === '"')) {
    if (input[pos] === '\n') { line++; col = 1; } else { col++; }
    str += input[pos]
    pos++
  }
  if (input[pos] === '"' && input[pos+1] === '"' && input[pos+2] === '"') {
    pos += 3; col += 3
    return { str, newPos: pos, newLine: line, newCol: col, error: null }
  } else {
    return { str, newPos: pos, newLine: line, newCol: col, error: `Unclosed triple-quoted string at ${line}:${col}` }
  }
}

function readQuotedString(input: string, pos: number, line: number, col: number, quoteChar: string) {
  // Helper to read single or double quoted strings (not triple-quoted)
  // Returns {str, newPos, newLine, newCol, error, closed}
  let str = ''
  let startLine = line
  let startCol = col
  pos += 1; col += 1 // skip opening quote
  let closed = false
  while (pos < input.length && input[pos] !== quoteChar) {
    if (input[pos] === '\n') { line++; col = 1; } else { col++; }
    str += input[pos]
    pos++
  }
  if (input[pos] === quoteChar) {
    pos += 1; col += 1
    closed = true
  }
  let error = closed ? null : `Unclosed string at ${startLine}:${startCol}`
  return { str, newPos: pos, newLine: line, newCol: col, error, closed }
}

function readNumber(input: string, pos: number, line: number, col: number) {
  // Handles int, float, scientific, .5, -.5, etc. Allows underscores as digit separators.
  // Returns {num, newPos, newLine, newCol, error}
  let num = ''
  let ch = input[pos]
  if (ch === '-') {
    num += '-'
    pos++
    col++
    ch = input[pos]
  }
  if (ch === '.') {
    num += '.'
    pos++
    col++
  }
  // Integer part
  while (isDigit(input[pos]) || input[pos] === '_') {
    num += input[pos]
    pos++
    col++
  }
  // Fractional part
  if (input[pos] === '.') {
    num += '.'
    pos++
    col++
    while (isDigit(input[pos]) || input[pos] === '_') {
      num += input[pos]
      pos++
      col++
    }
  }
  // Exponent part
  if (input[pos] === 'e' || input[pos] === 'E') {
    num += input[pos]
    pos++
    col++
    if (input[pos] === '+' || input[pos] === '-') {
      num += input[pos]
      pos++
      col++
    }
    while (isDigit(input[pos]) || input[pos] === '_') {
      num += input[pos]
      pos++
      col++
    }
  }
  // Remove underscores for the token value
  let cleanNum = num.replace(/_/g, '');
  return { num: cleanNum, newPos: pos, newLine: line, newCol: col, error: null }
}

function readComment(input: string, pos: number, line: number, col: number) {
  // Handles both line and block comments
  // Returns {comment, newPos, newLine, newCol, error, isBlock}
  let startLine = line
  let startCol = col
  if (input[pos + 1] === ';' && input[pos + 2] === ';') {
    // Block comment
    pos += 3; col += 3
    let comment = ';;;'
    let closed = false
    while (pos < input.length) {
      if (input[pos] === ';' && input[pos + 1] === ';' && input[pos + 2] === ';') {
        comment += ';;;'
        pos += 3; col += 3
        closed = true
        break
      }
      if (input[pos] === '\n') { line++; col = 1; } else { col++; }
      comment += input[pos]
      pos++
    }
    let error = closed ? null : `Unclosed block comment at ${startLine}:${startCol}`
    return { comment, newPos: pos, newLine: line, newCol: col, error, isBlock: true }
  } else {
    // Line comment
    pos += 1; col += 1
    let comment = ''
    while (pos < input.length && input[pos] !== '\n') {
      comment += input[pos]
      pos++
      col++
    }
    return { comment, newPos: pos, newLine: line, newCol: col, error: null, isBlock: false }
  }
}

function readQuotedKeyOrString(input: string, pos: number, line: number, col: number) {
  // Handles triple, double, and single quoted keys/strings
  // Returns {value, type, newPos, newLine, newCol, error}
  let ch = input[pos]
  if (ch === '"') {
    if (input[pos + 1] === '"' && input[pos + 2] === '"') {
      // Triple-quoted string
      const { str, newPos, newLine, newCol, error } = readTripleQuotedString(input, pos, line, col)
      if (error) {
        return { value: undefined, type: 'ERROR', newPos, newLine, newCol, error }
      }
      pos = newPos
      line = newLine
      col = newCol
      // Check for quoted key (triple-quoted key)
      let after = input[pos]
      while (after === ' ' || after === '\t') {
        pos++
        col++
        after = input[pos]
      }
      if (after === ':') {
        return { value: '"""' + str + '"""', type: 'IDENTIFIER', newPos: pos, newLine: line, newCol: col, error: undefined }
      } else {
        return { value: str, type: 'STRING', newPos: pos, newLine: line, newCol: col, error: undefined }
      }
    } else {
      // Double-quoted string
      const { str, newPos, newLine, newCol, error, closed } = readQuotedString(input, pos, line, col, '"')
      pos = newPos
      line = newLine
      col = newCol
      // Check for quoted key (double-quoted key)
      let after = input[pos]
      while (after === ' ' || after === '\t') {
        pos++
        col++
        after = input[pos]
      }
      if (!closed) {
        return { value: undefined, type: 'ERROR', newPos: pos, newLine: line, newCol: col, error }
      }
      if (after === ':') {
        return { value: '"' + str + '"', type: 'IDENTIFIER', newPos: pos, newLine: line, newCol: col, error: undefined }
      } else {
        return { value: str, type: 'STRING', newPos: pos, newLine: line, newCol: col, error: undefined }
      }
    }
  } else if (ch === "'") {
    // Single-quoted string
    const { str, newPos, newLine, newCol, error, closed } = readQuotedString(input, pos, line, col, "'")
    pos = newPos
    line = newLine
    col = newCol
    if (!closed) {
      return { value: undefined, type: 'ERROR', newPos: pos, newLine: line, newCol: col, error }
    }
    return { value: str, type: 'STRING', newPos: pos, newLine: line, newCol: col, error: undefined }
  }
  // Not a quoted string
  return { value: undefined, type: 'ERROR', newPos: pos, newLine: line, newCol: col, error: 'Not a quoted string' }
}

function readBracketOrKey(input: string, pos: number, line: number, col: number) {
  // Handles '[', ']', and special bracketed keys like [key]:
  // Returns {type, value, newPos, newLine, newCol, error}
  let ch = input[pos]
  if (ch === '[') {
    let bracketStart = pos
    let bracketLine = line
    let bracketCol = col
    pos++;
    col++;
    while (pos < input.length && input[pos] !== ']') {
      if (input[pos] === '\n') { line++; col = 1; } else { col++; }
      pos++;
    }
    if (input[pos] === ']') {
      pos++;
      col++;
    }
    let bracketEnd = pos;
    // Skip whitespace after ]
    while (input[pos] === ' ' || input[pos] === '\t') {
      pos++;
      col++;
    }
    if (input[pos] === ':') {
      // This is a special key
      let key = input.slice(bracketStart, bracketEnd); // includes [ and ]
      return { type: 'IDENTIFIER', value: key, newPos: pos, newLine: line, newCol: col, error: undefined }
    } else {
      // Not a special key, treat as LBRACKET
      return { type: 'LBRACKET', value: undefined, newPos: bracketStart + 1, newLine: bracketLine, newCol: bracketCol + 1, error: undefined }
    }
  } else if (ch === ']') {
    return { type: 'RBRACKET', value: undefined, newPos: pos + 1, newLine: line, newCol: col + 1, error: undefined }
  }
  return { type: 'ERROR', value: undefined, newPos: pos, newLine: line, newCol: col, error: 'Not a bracket' }
}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let pos = 0
  let line = 1
  let col = 1
  let indentStack = [0]

  function addToken(type: TokenType, value?: string, startLine?: number, startCol?: number) {
    tokens.push({ type, value, line: startLine ?? line, column: startCol ?? col })
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
    let startLine = line
    let startCol = col
    // Handle comments
    if (ch === ';') {
      const { comment, newPos, newLine, newCol, error } = readComment(input, pos, line, col)
      pos = newPos
      line = newLine
      col = newCol
      if (error) {
        addToken('ERROR', error || undefined, startLine, startCol)
      } else {
        addToken('COMMENT', comment, startLine, startCol)
      }
      continue
    }
    // Handle whitespace
    if (isWhitespace(ch)) {
      skipWhitespace()
      continue
    }
    // Handle newlines and indentation
    if (ch === '\n') {
      addToken('NEWLINE', undefined, startLine, startCol)
      advance()
      handleIndentation()
      continue
    }
    // Handle punctuation
    if (ch === ':') { addToken('COLON', undefined, startLine, startCol); advance(); continue; }
    if (ch === ',') { addToken('COMMA', undefined, startLine, startCol); advance(); continue; }
    if (ch === '{') { addToken('LBRACE', undefined, startLine, startCol); advance(); continue; }
    if (ch === '}') { addToken('RBRACE', undefined, startLine, startCol); advance(); continue; }
    // Handle brackets and special keys
    if (ch === '[' || ch === ']') {
      const { type, value, newPos, newLine, newCol, error } = readBracketOrKey(input, pos, line, col)
      pos = newPos
      line = newLine
      col = newCol
      if (type === 'ERROR') {
        addToken('ERROR', error || undefined, startLine, startCol)
        continue
      }
      addToken(type as TokenType, value, startLine, startCol)
      continue
    }
    if (ch === '*') { addToken('ASTERISK', undefined, startLine, startCol); advance(); continue; }
    // Handle quoted keys or strings
    if (ch === '"' || ch === "'") {
      const { value, type, newPos, newLine, newCol, error } = readQuotedKeyOrString(input, pos, line, col)
      pos = newPos
      line = newLine
      col = newCol
      if (type === 'ERROR') {
        addToken('ERROR', error || undefined, startLine, startCol)
        continue
      }
      addToken(type as TokenType, value, startLine, startCol)
      continue
    }
    // Handle number (int, float, scientific, .5, -.5)
    if (isNumberStart(ch, peek(1))) {
      const { num, newPos, newLine, newCol, error } = readNumber(input, pos, line, col)
      pos = newPos
      line = newLine
      col = newCol
      if (error) {
        addToken('ERROR', error || undefined, startLine, startCol)
        continue
      }
      addToken('NUMBER', num, startLine, startCol)
      continue
    }
    // Handle identifier, boolean, null (case-sensitive)
    if (isIdentifierStart(ch)) {
      let id = readWhile(isIdentifierChar)
      if (id === 'true' || id === 'false') {
        addToken('BOOLEAN', id, startLine, startCol)
      } else if (id === 'null') {
        addToken('NULL', id, startLine, startCol)
      } else {
        addToken('IDENTIFIER', id, startLine, startCol)
      }
      continue
    }
    // Unknown character, emit error
    addToken('ERROR', `Unknown character: ${ch}`, startLine, startCol)
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
