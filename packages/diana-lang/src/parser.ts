// Parser for Diana language

import type { Token } from './tokenizer'

export type ASTNode =
  | ProgramNode
  | KeyValueNode
  | ObjectNode
  | ListNode
  | StringNode
  | NumberNode
  | BooleanNode
  | NullNode
  | IdentifierNode
  | CommentNode
  | LetBindingNode

export type KeyNode = 
  | { type: 'KeyPath', path: string[] } // keypath: single or nested.level.key
  | { type: 'StringKey', value: string } // string key: "in quote" or "dot.allowed.in.key"
  | { type: 'ComputedKey', value: number | boolean } // computed key: [123] or [true]/[false]

export interface ProgramNode {
  type: 'Program'
  children: ASTNode[]
}

export interface KeyValueNode {
  type: 'KeyValue'
  key: KeyNode
  value: ASTNode
}

export interface ObjectNode {
  type: 'Object'
  properties: KeyValueNode[]
}

export interface ListNode {
  type: 'List'
  items: ASTNode[]
}

export interface StringNode {
  type: 'String'
  value: string
}

export interface NumberNode {
  type: 'Number'
  value: number
}

export interface BooleanNode {
  type: 'Boolean'
  value: boolean
}

export interface NullNode {
  type: 'Null'
}

export interface IdentifierNode {
  type: 'Identifier'
  name: string
}

export interface CommentNode {
  type: 'Comment'
  value: string
}

export interface LetBindingNode {
  type: 'LetBinding'
  name: string
  value: ASTNode
  annotation?: ASTNode // type annotation, optional
  params?: string[] // for function definitions, optional
}

export function parse(tokens: Token[]): ASTNode {
  let pos = 0

  function peek(n = 0): Token {
    return tokens[pos + n]
  }

  function next(): Token {
    return tokens[pos++]
  }

  function expect(type: string, value?: string) {
    const token = next()
    if (token.type !== type || (value !== undefined && token.value !== value)) {
      throw new Error(`Expected ${type}${value ? `(${value})` : ''} but got ${token.type}${token.value ? `(${token.value})` : ''}`)
    }
    return token
  }

  function skipNewlines() {
    while (peek() && peek().type === 'NEWLINE') next()
  }

  function parseProgram(): ProgramNode {
    const children: ASTNode[] = []
    skipNewlines()
    while (peek() && peek().type !== 'EOF') {
      if (peek().type === 'COMMENT') {
        children.push(parseComment())
        skipNewlines()
      } else if (peek().type === 'LET') {
        children.push(parseLetBinding())
        skipNewlines()
      } else if (peek().type === 'IDENTIFIER') {
        children.push(parseKeyValue())
        skipNewlines()
      } else {
        next() // skip unknown
      }
    }
    return { type: 'Program', children }
  }

  function parseComment(): CommentNode {
    const token = expect('COMMENT')
    return { type: 'Comment', value: token.value || '' }
  }

  function parseKeyValue(): KeyValueNode {
    const keyToken = expect('IDENTIFIER')
    let key: KeyNode
    const raw = keyToken.value || ''
    if (raw.startsWith('[') && raw.endsWith(']')) {
      // Bracketed key: could be string, number, or boolean
      const inner = raw.slice(1, -1)
      if (inner.startsWith('"') && inner.endsWith('"')) {
        // Bracketed string key: ["name.value.test"]
        key = { type: 'StringKey', value: inner.slice(1, -1) }
      } else if (inner === 'true' || inner === 'false') {
        key = { type: 'ComputedKey', value: inner === 'true' }
      } else if (!isNaN(Number(inner))) {
        key = { type: 'ComputedKey', value: Number(inner) }
      } else {
        throw new Error(`Invalid computed key: ${raw}`)
      }
    } else if (raw.startsWith('"') && raw.endsWith('"')) {
      // String key: "in quote" or "dot.allowed.in.key"
      key = { type: 'StringKey', value: raw.slice(1, -1) }
    } else {
      // KeyPath: single or nested.level.key
      key = { type: 'KeyPath', path: raw.split('.') }
    }
    skipNewlines()
    expect('COLON')
    skipNewlines()
    const value = parseValue()
    return { type: 'KeyValue', key, value }
  }

  function parseValue(): ASTNode {
    const token = peek()
    if (!token) throw new Error('Unexpected end of input')
    switch (token.type) {
      case 'STRING':
        next()
        return { type: 'String', value: token.value || '' }
      case 'NUMBER':
        next()
        return { type: 'Number', value: Number(token.value) }
      case 'BOOLEAN':
        next()
        return { type: 'Boolean', value: token.value === 'true' }
      case 'NULL':
        next()
        return { type: 'Null' }
      case 'LBRACE':
        return parseObject()
      case 'LBRACKET':
        return parseList()
      case 'INDENT':
        return parseIndentedList()
      case 'IDENTIFIER':
        // For onelineObj: { a.b.c: 2, c.d: 1 }
        // or for topLevel.nested.value: "of course"
        // treat as string or identifier node
        next()
        return { type: 'Identifier', name: token.value || '' }
      default:
        throw new Error(`Unexpected token: ${token.type}`)
    }
  }

  function parseObject(): ObjectNode {
    expect('LBRACE')
    skipNewlines()
    const properties: KeyValueNode[] = []
    while (peek() && peek().type !== 'RBRACE' && peek().type !== 'EOF') {
      if (peek().type === 'IDENTIFIER') {
        properties.push(parseKeyValue())
        skipNewlines()
        if (peek().type === 'COMMA') {
          next()
          skipNewlines()
        }
      } else {
        next(); // skip unknown
      }
    }
    expect('RBRACE')
    return { type: 'Object', properties }
  }

  function parseList(): ListNode {
    expect('LBRACKET')
    skipNewlines()
    const items: ASTNode[] = []
    while (peek() && peek().type !== 'RBRACKET' && peek().type !== 'EOF') {
      if (peek().type === 'NUMBER' || peek().type === 'STRING' || peek().type === 'BOOLEAN' || peek().type === 'NULL' || peek().type === 'IDENTIFIER') {
        items.push(parseValue())
        skipNewlines()
        if (peek().type === 'COMMA') {
          next()
          skipNewlines()
        }
      } else {
        next(); // skip unknown
      }
    }
    expect('RBRACKET')
    return { type: 'List', items }
  }

  function parseIndentedList(): ListNode {
    expect('INDENT')
    const items: ASTNode[] = []
    
    while (peek() && peek().type !== 'DEDENT' && peek().type !== 'EOF') {
      if (peek().type === 'ASTERISK') {
        next() // consume the *
        skipNewlines()
        
        // Parse the item after the *
        // This could be a simple value or an object with key-value pairs
        const item = parseListItem()
        items.push(item)
        skipNewlines()
      } else {
        next() // skip unknown tokens
      }
    }
    
    if (peek() && peek().type === 'DEDENT') {
      next() // consume DEDENT
    }
    
    return { type: 'List', items }
  }

  function parseListItem(): ASTNode {
    // Check if this is a key-value pair or just a simple value
    const token = peek()
    if (!token) throw new Error('Unexpected end of input in list item')
    
    if (token.type === 'IDENTIFIER' && peek(1) && peek(1).type === 'COLON') {
      // This is a key-value pair, parse as object
      const properties: KeyValueNode[] = []
      
      // Parse the first key-value pair
      properties.push(parseKeyValue())
      skipNewlines()
      
      // Check for additional indented key-value pairs
      while (peek() && peek().type === 'INDENT') {
        next() // consume INDENT
        if (peek() && peek().type === 'IDENTIFIER' && peek(1) && peek(1).type === 'COLON') {
          properties.push(parseKeyValue())
          skipNewlines()
        }
        if (peek() && peek().type === 'DEDENT') {
          next() // consume DEDENT
        }
      }
      
      return { type: 'Object', properties }
    } else {
      // Simple value
      return parseValue()
    }
  }

  function parseLetBinding(): LetBindingNode {
    expect('LET')
    skipNewlines()
    // Parse name
    const nameToken = expect('IDENTIFIER')
    const name = nameToken.value || ''
    skipNewlines()
    let annotation: ASTNode | undefined = undefined
    let params: string[] | undefined = undefined
    // Optional type annotation or function params
    if (peek().type === 'COLON') {
      next() // consume ':'
      skipNewlines()
      // Parse type annotation (as identifier or type expression)
      const typeToken = next()
      annotation = { type: 'Identifier', name: typeToken.value || '' }
      skipNewlines()
    } else if (peek().type === 'LBRACKET' || (peek().type === 'IDENTIFIER' && peek().value === '(')) {
      // Function params (not fully implemented, just collect names for now)
      next()
      while (peek().type !== 'RBRACKET' && !(peek().type === 'IDENTIFIER' && peek().value === ')') && peek().type !== 'EOF') {
        if (peek().type === 'IDENTIFIER' && peek().value !== ')') {
          if (!params) params = []
          params.push(peek().value || '')
        }
        next()
      }
      if (peek().type === 'RBRACKET' || (peek().type === 'IDENTIFIER' && peek().value === ')')) next()
      skipNewlines()
    }
    // Expect '='
    if (peek().type === 'IDENTIFIER' && peek().value === '=') {
      next()
    } else if (peek().type === 'COLON') {
      // fallback, allow 'let x: type = ...'
      next()
    } else {
      expect('IDENTIFIER', '=') // fallback, will error
    }
    skipNewlines()
    // Parse value
    let value: ASTNode
    const nextToken = peek()
    if (nextToken && (nextToken.type === 'STRING' || nextToken.type === 'NUMBER' || nextToken.type === 'BOOLEAN' || nextToken.type === 'NULL' || nextToken.type === 'LBRACE' || nextToken.type === 'LBRACKET' || nextToken.type === 'INDENT' || (nextToken.type === 'IDENTIFIER' && nextToken.value && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(nextToken.value)))) {
      value = parseValue()
    } else {
      // Collect all tokens until NEWLINE or EOF as a string expression
      let expr = ''
      while (peek() && peek().type !== 'NEWLINE' && peek().type !== 'EOF') {
        expr += (expr ? ' ' : '') + (peek().value || '')
        next()
      }
      value = { type: 'String', value: expr }
    }
    return { type: 'LetBinding', name, value, annotation, params }
  }

  return parseProgram()
}
