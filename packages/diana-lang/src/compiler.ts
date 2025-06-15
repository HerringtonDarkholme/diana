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
      let processedKey: string | number | boolean;
      if (key.type === 'KeyPath') {
        // Handle dot notation for nested keys
        if (key.path.length === 1) {
          processedKey = key.path[0];
          return { [processedKey]: compiledValue };
        } else {
          let currentObj: Record<string, any> = {};
          let rootObj = currentObj;
          for (let i = 0; i < key.path.length; i++) {
            const k = key.path[i];
            if (i === key.path.length - 1) {
              currentObj[k] = compiledValue;
            } else {
              currentObj[k] = {};
              currentObj = currentObj[k];
            }
          }
          return rootObj;
        }
      } else if (key.type === 'StringKey') {
        processedKey = key.value;
        return { [processedKey]: compiledValue };
      } else if (key.type === 'ComputedKey') {
        processedKey = typeof key.value === 'boolean' ? String(key.value) : key.value;
        return { [processedKey]: compiledValue };
      } else {
        throw new Error(`Unknown key type: ${(key as any).type}`);
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
