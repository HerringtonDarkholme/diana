import fs from 'fs'
import path from 'path'

interface Token<T extends string> {
  type: T
}

interface Indent extends Token<'indent'> {}
interface Deindent extends Token<'deindent'> {}
interface Key extends Token<'key'> {
  path: string[]
}
interface Str extends Token<'str'> {
  delimiter: string
  content: string[]
}
interface Value extends Token<'value'> {
  value: number | string | boolean
}
interface Item extends Token<'item'> {}

type Tokens = Array<
  | Indent
  | Deindent
  | Key
  | Str
  | Value
  | Item
>

function convert(filePath: string) {
  const absolutePath = path.resolve(process.cwd(), filePath)
  const content = fs.readFileSync(absolutePath, 'utf8')
  const tokens = tokenize(content)
  const object = parse(tokens)
  return object
}

const INDENT_SIZE = 2
function tokenize(src: string): Tokens {
  let i = 0
  let tokens: Tokens = []
  let lines = src.split('\n')
  let level = 0
  let inList = false
  while (i < lines.length) {
    let [_, indentation, content = ''] = lines[i].match(/^(\s*)(.+)/) || []
    content = content.replace(/;.*/g, '')
    if (!content) {
      i += 1;
      continue;
    }
    let currentLevel = indentation.length / INDENT_SIZE
    if (currentLevel === level + 1) {
      tokens.push({type: 'indent'})
    } else {
      while (currentLevel < level) {
        if (inList) {
          inList = false
        } else {
          tokens.push({type: 'deindent'})
        }
        level -= 1
      }
    }
    level = currentLevel
    if (content.startsWith('* ')) {
      inList = true
      tokens.push({type: 'item'})
      content = content.slice(2)
      level += 1
    }
    let key = /^([^: ]+)\s*:\s*/.exec(content)
    if (key) {
      tokens.push({
        type: 'key',
        path: key[1].split('.')
      })
      content = content.slice(key[0].length)
    }
    // multiline string
    if (content.startsWith('"""') || content.startsWith("'''")) {
      let delimiter = content.slice(0, 3)
      let strContent = content.slice(3)
      while (!lines[++i].includes(delimiter)) {
        strContent += lines[i]
      }
      let idx = lines[i].indexOf(delimiter)
      strContent += lines[i].slice(0, idx)
      tokens.push({
        type: 'str',
        delimiter,
        content: [strContent],
      })
    }
    if (content) {
      tokens.push({
        type: 'value',
        value: JSON.parse(content.replace(/^'|'$/g, '"')) as any,
      })
    }
    i += 1
  }
  return tokens
}

function parse(tokens: Tokens) {
  if (tokens.length === 0) {
    return null
  }
  const token = tokens[0]
  switch (token.type) {
    case 'key':
      return parseObject(tokens)
    case 'item':
      return parseList(tokens)
    case 'value':
      tokens.shift()
      return token.value
    case 'str':
      tokens.shift()
      return token.content[0]
    default:
      throw new Error('unexpected indent')
  }
}

function parseObject(tokens: Tokens) {
  let obj: Record<string, unknown> = {}
  while (tokens[0]?.type === 'key') {
    let path = tokens[0].path
    let value
    tokens.shift()
    let nextToken = tokens.at(0)
    if (!nextToken) {
      value = null
    } else if (nextToken.type === 'indent') {
      tokens.shift()
      value = parse(tokens)
      if (tokens.at(0)?.type === 'deindent') {
        tokens.shift()
      }
    } else {
      value = parse(tokens)
    }
    deepSet(obj, path, value)
  }
  return obj
}

function deepSet(obj: Record<string, any>, path: string[], value: unknown): unknown {
  if (path.length === 0) {
    return value
  }
  const key = path[0]
  obj[key] = deepSet(obj[key] ?? {}, path.slice(1), value)
  return obj
}

function parseList(tokens: Tokens) {
  let list: unknown[] = []
  while (tokens[0]?.type === 'item') {
    let value
    tokens.shift()
    let nextToken = tokens.at(0)
    if (!nextToken) {
      break
    } else if (nextToken.type === 'indent') {
      tokens.shift()
      value = parse(tokens)
      if (tokens.at(0)?.type === 'deindent') {
        tokens.shift()
      }
    } else {
      value = parse(tokens)
    }
    list.push(value)
  }
  return list
}

console.log(JSON.stringify(convert(process.argv[2]), null, 2))
