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

  return parseProgram()
}
