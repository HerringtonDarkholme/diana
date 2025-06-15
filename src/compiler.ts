// Compiler for Diana language

import type { ASTNode, ProgramNode, KeyValueNode, ObjectNode, ListNode, StringNode, NumberNode, BooleanNode, IdentifierNode } from './parser'

export function compile(ast: ASTNode): any {
  switch (ast.type) {
    case 'Program': {
      // Merge all top-level KeyValue nodes into an object, skip comments
      const obj: Record<string, any> = {};
      for (const child of (ast as ProgramNode).children) {
        if (child.type === 'KeyValue') {
          const kv = compile(child);
          Object.assign(obj, kv);
        }
        // skip comments
      }
      return obj;
    }
    case 'KeyValue': {
      const { key, value } = ast as KeyValueNode;
      const compiledValue = compile(value);

      let processedKey = key;
      if (key.startsWith('"') && key.endsWith('"')) {
        // If the key is quoted, remove the quotes
        processedKey = key.slice(1, -1);
      } else if (key.startsWith('[') && key.endsWith(']')) {
        // If the key is bracketed, remove the brackets
        processedKey = key.slice(1, -1);
        // If the content inside brackets is a string, remove its quotes
        if (processedKey.startsWith('"') && processedKey.endsWith('"')) {
          processedKey = processedKey.slice(1, -1);
        }
      }

      if (processedKey.includes('.') && !key.startsWith('"') && !key.startsWith('[')) {
        // Handle dot notation for unquoted and unbracketed keys
        const keys = processedKey.split('.');
        let currentObj: Record<string, any> = {};
        let rootObj = currentObj;

        for (let i = 0; i < keys.length; i++) {
          const k = keys[i];
          if (i === keys.length - 1) {
            currentObj[k] = compiledValue;
          } else {
            currentObj[k] = {};
            currentObj = currentObj[k];
          }
        }
        return rootObj;
      } else {
        return { [processedKey]: compiledValue };
      }
    }
    case 'Object': {
      const obj: Record<string, any> = {};
      for (const prop of (ast as ObjectNode).properties) {
        const kv = compile(prop);
        Object.assign(obj, kv);
      }
      return obj;
    }
    case 'List': {
      return (ast as ListNode).items.map(compile);
    }
    case 'String': {
      return (ast as StringNode).value;
    }
    case 'Number': {
      return (ast as NumberNode).value;
    }
    case 'Boolean': {
      return (ast as BooleanNode).value;
    }
    case 'Null': {
      return null;
    }
    case 'Identifier': {
      // Treat identifiers as strings in output
      return (ast as IdentifierNode).name;
    }
    case 'Comment': {
      // Omit comments from output
      return undefined;
    }
    default:
      throw new Error(`Unknown AST node type: ${(ast as any).type}`);
  }
}
