import { describe, it, expect } from 'vitest';
import { parse, ProgramNode, KeyValueNode } from '../src/parser';
import { tokenize } from '../src/tokenizer';

describe('parser', () => {
  it('should parse a simple key-value pair', () => {
    const input = 'integer: 123';
    const ast = parse(tokenize(input)) as ProgramNode;
    expect(ast.type).toBe('Program');
    expect(ast.children.length).toBe(1);
    const kv = ast.children[0] as KeyValueNode;
    expect(kv.type).toBe('KeyValue');
    if (kv.key.type === 'KeyPath') {
      expect(kv.key.path).toEqual(['integer']);
    } else {
      throw new Error('Expected KeyPath');
    }
    if (kv.value.type === 'Number') {
      expect(kv.value.value).toBe(123);
    } else {
      throw new Error('Expected Number');
    }
  });

  it('should parse a string value', () => {
    const input = 'string: "hello"';
    const ast = parse(tokenize(input)) as ProgramNode;
    const kv = ast.children[0] as KeyValueNode;
    if (kv.value.type === 'String') {
      expect(kv.value.value).toBe('hello');
    } else {
      throw new Error('Expected String');
    }
  });

  it('should parse an object', () => {
    const input = 'obj: { a: 1, b: 2 }';
    const ast = parse(tokenize(input)) as ProgramNode;
    const kv = ast.children[0] as KeyValueNode;
    if (kv.value.type === 'Object') {
      const props = kv.value.properties;
      expect(props.length).toBe(2);
      if (props[0].key.type === 'KeyPath') {
        expect(props[0].key.path).toEqual(['a']);
      } else {
        throw new Error('Expected KeyPath');
      }
      if (props[0].value.type === 'Number') {
        expect(props[0].value.value).toBe(1);
      } else {
        throw new Error('Expected Number');
      }
      if (props[1].key.type === 'KeyPath') {
        expect(props[1].key.path).toEqual(['b']);
      } else {
        throw new Error('Expected KeyPath');
      }
      if (props[1].value.type === 'Number') {
        expect(props[1].value.value).toBe(2);
      } else {
        throw new Error('Expected Number');
      }
    } else {
      throw new Error('Expected Object');
    }
  });

  it('should parse a list', () => {
    const input = 'list: [1, 2, 3]';
    const ast = parse(tokenize(input)) as ProgramNode;
    const kv = ast.children[0] as KeyValueNode;
    if (kv.value.type === 'List') {
      const items = kv.value.items;
      expect(items.length).toBe(3);
      if (items[0].type === 'Number') {
        expect(items[0].value).toBe(1);
      } else {
        throw new Error('Expected Number');
      }
      if (items[2].type === 'Number') {
        expect(items[2].value).toBe(3);
      } else {
        throw new Error('Expected Number');
      }
    } else {
      throw new Error('Expected List');
    }
  });

  it('should parse booleans and null', () => {
    const input = 'flag: true\nnone: null';
    const ast = parse(tokenize(input)) as ProgramNode;
    const kv1 = ast.children[0] as KeyValueNode;
    const kv2 = ast.children[1] as KeyValueNode;
    if (kv1.value.type === 'Boolean') {
      expect(kv1.value.value).toBe(true);
    } else {
      throw new Error('Expected Boolean');
    }
    if (kv2.value.type === 'Null') {
      expect(kv2.value.type).toBe('Null');
    } else {
      throw new Error('Expected Null');
    }
  });

  it('should parse comments as AST nodes', () => {
    const input = '; comment\nkey: 1';
    const ast = parse(tokenize(input)) as ProgramNode;
    const commentNode = ast.children[0];
    if (commentNode.type === 'Comment') {
      expect(commentNode.value).toContain('comment');
    } else {
      throw new Error('Expected Comment');
    }
    const kv = ast.children[1] as KeyValueNode;
    expect(kv.type).toBe('KeyValue');
  });

  it('should parse indented lists with asterisk syntax', () => {
    const input = `pets:
  * object: 'obj'
    inList: true
  * name: "Fluffy"
    type: "cat"`;
    
    const ast = parse(tokenize(input)) as ProgramNode;
    expect(ast.type).toBe('Program');
    expect(ast.children.length).toBe(1);
    
    const kv = ast.children[0] as KeyValueNode;
    expect(kv.type).toBe('KeyValue');
    
    // Check the key
    if (kv.key.type === 'KeyPath') {
      expect(kv.key.path).toEqual(['pets']);
    } else {
      throw new Error('Expected KeyPath for key');
    }
    
    // Check the value is a list
    if (kv.value.type === 'List') {
      const items = kv.value.items;
      expect(items.length).toBe(2);
      
      // Check first list item
      if (items[0].type === 'Object') {
        const props = items[0].properties;
        expect(props.length).toBe(2);
        
        // Check first property: object: 'obj'
        if (props[0].key.type === 'KeyPath') {
          expect(props[0].key.path).toEqual(['object']);
        } else {
          throw new Error('Expected KeyPath for first property');
        }
        if (props[0].value.type === 'String') {
          expect(props[0].value.value).toBe('obj');
        } else {
          throw new Error('Expected String for first property value');
        }
        
        // Check second property: inList: true
        if (props[1].key.type === 'KeyPath') {
          expect(props[1].key.path).toEqual(['inList']);
        } else {
          throw new Error('Expected KeyPath for second property');
        }
        if (props[1].value.type === 'Boolean') {
          expect(props[1].value.value).toBe(true);
        } else {
          throw new Error('Expected Boolean for second property value');
        }
      } else {
        throw new Error('Expected Object for first list item');
      }
      
      // Check second list item
      if (items[1].type === 'Object') {
        const props = items[1].properties;
        expect(props.length).toBe(2);
        
        // Check first property: name: "Fluffy"
        if (props[0].key.type === 'KeyPath') {
          expect(props[0].key.path).toEqual(['name']);
        } else {
          throw new Error('Expected KeyPath for name property');
        }
        if (props[0].value.type === 'String') {
          expect(props[0].value.value).toBe('Fluffy');
        } else {
          throw new Error('Expected String for name property value');
        }
        
        // Check second property: type: "cat"
        if (props[1].key.type === 'KeyPath') {
          expect(props[1].key.path).toEqual(['type']);
        } else {
          throw new Error('Expected KeyPath for type property');
        }
        if (props[1].value.type === 'String') {
          expect(props[1].value.value).toBe('cat');
        } else {
          throw new Error('Expected String for type property value');
        }
      } else {
        throw new Error('Expected Object for second list item');
      }
    } else {
      throw new Error('Expected List for value');
    }
  });

  it('should parse indented lists with simple values', () => {
    const input = `items:
  * "item1"
  * "item2"
  * "item3"`;
    
    const ast = parse(tokenize(input)) as ProgramNode;
    expect(ast.type).toBe('Program');
    expect(ast.children.length).toBe(1);
    
    const kv = ast.children[0] as KeyValueNode;
    expect(kv.type).toBe('KeyValue');
    
    // Check the key
    if (kv.key.type === 'KeyPath') {
      expect(kv.key.path).toEqual(['items']);
    } else {
      throw new Error('Expected KeyPath for key');
    }
    
    // Check the value is a list
    if (kv.value.type === 'List') {
      const items = kv.value.items;
      expect(items.length).toBe(3);
      
             // Check all items are strings
       for (let i = 0; i < items.length; i++) {
         if (items[i].type === 'String') {
           expect((items[i] as any).value).toBe(`item${i + 1}`);
         } else {
           throw new Error(`Expected String for item ${i + 1}`);
         }
       }
    } else {
      throw new Error('Expected List for value');
    }
  });

  it('should parse let variable binding', () => {
    const input = 'let x = 1';
    const ast = parse(tokenize(input)) as ProgramNode;
    expect(ast.type).toBe('Program');
    expect(ast.children.length).toBe(1);
    const letNode = ast.children[0];
    expect(letNode.type).toBe('LetBinding');
    if (letNode.type === 'LetBinding') {
      expect(letNode.name).toBe('x');
      expect(letNode.value.type).toBe('Number');
      if (letNode.value.type === 'Number') {
        expect(letNode.value.value).toBe(1);
      }
    }
  });

  it('should parse let variable binding with type annotation', () => {
    const input = 'let y: int = 2';
    const ast = parse(tokenize(input)) as ProgramNode;
    const letNode = ast.children[0];
    expect(letNode.type).toBe('LetBinding');
    if (letNode.type === 'LetBinding') {
      expect(letNode.name).toBe('y');
      expect(letNode.annotation).toBeDefined();
      if (letNode.annotation && letNode.annotation.type === 'Identifier') {
        expect(letNode.annotation.name).toBe('int');
      }
      expect(letNode.value.type).toBe('Number');
      if (letNode.value.type === 'Number') {
        expect(letNode.value.value).toBe(2);
      }
    }
  });

  it('should parse let function binding', () => {
    const input = 'let add(a, b) = a';
    const ast = parse(tokenize(input)) as ProgramNode;
    const letNode = ast.children[0];
    expect(letNode.type).toBe('LetBinding');
    if (letNode.type === 'LetBinding') {
      expect(letNode.name).toBe('add');
      expect(letNode.params).toEqual(['a', 'b']);
      // The value will be parsed as an Identifier or expression, just check type for now
      expect(letNode.value).toBeDefined();
    }
  });

  it('should parse let with annotation and value', () => {
    const input = 'let annotated: int = 123';
    const ast = parse(tokenize(input)) as ProgramNode;
    const letNode = ast.children[0];
    expect(letNode.type).toBe('LetBinding');
    if (letNode.type === 'LetBinding') {
      expect(letNode.name).toBe('annotated');
      expect(letNode.annotation).toBeDefined();
      if (letNode.annotation && letNode.annotation.type === 'Identifier') {
        expect(letNode.annotation.name).toBe('int');
      }
      expect(letNode.value.type).toBe('Number');
      if (letNode.value.type === 'Number') {
        expect(letNode.value.value).toBe(123);
      }
    }
  });
});

describe('KeyValueNode key types', () => {
  it('should parse a keypath (dot notation)', () => {
    const input = 'a.b.c: 42';
    const ast = parse(tokenize(input)) as ProgramNode;
    const kv = ast.children[0] as KeyValueNode;
    expect(kv.type).toBe('KeyValue');
    expect(kv.key.type).toBe('KeyPath');
    if (kv.key.type === 'KeyPath') {
      expect(kv.key.path).toEqual(['a', 'b', 'c']);
    } else {
      throw new Error('Expected KeyPath');
    }
    if (kv.value.type === 'Number') {
      expect(kv.value.value).toBe(42);
    } else {
      throw new Error('Expected Number');
    }
  });

  it('should parse a string key (quoted)', () => {
    const input = '"dot.allowed.in.key": 99';
    const ast = parse(tokenize(input)) as ProgramNode;
    const kv = ast.children[0] as KeyValueNode;
    expect(kv.type).toBe('KeyValue');
    expect(kv.key.type).toBe('StringKey');
    if (kv.key.type === 'StringKey') {
      expect(kv.key.value).toBe('dot.allowed.in.key');
    } else {
      throw new Error('Expected StringKey');
    }
    if (kv.value.type === 'Number') {
      expect(kv.value.value).toBe(99);
    } else {
      throw new Error('Expected Number');
    }
  });

  it('should parse a computed key (number)', () => {
    const input = '[123]: "numkey"';
    const ast = parse(tokenize(input)) as ProgramNode;
    const kv = ast.children[0] as KeyValueNode;
    expect(kv.type).toBe('KeyValue');
    expect(kv.key.type).toBe('ComputedKey');
    if (kv.key.type === 'ComputedKey') {
      expect(kv.key.value).toBe(123);
    } else {
      throw new Error('Expected ComputedKey');
    }
    if (kv.value.type === 'String') {
      expect(kv.value.value).toBe('numkey');
    } else {
      throw new Error('Expected String');
    }
  });

  it('should parse a computed key (boolean)', () => {
    const input = '[true]: "boolkey"';
    const ast = parse(tokenize(input)) as ProgramNode;
    const kv = ast.children[0] as KeyValueNode;
    expect(kv.type).toBe('KeyValue');
    expect(kv.key.type).toBe('ComputedKey');
    if (kv.key.type === 'ComputedKey') {
      expect(kv.key.value).toBe(true);
    } else {
      throw new Error('Expected ComputedKey');
    }
    if (kv.value.type === 'String') {
      expect(kv.value.value).toBe('boolkey');
    } else {
      throw new Error('Expected String');
    }
  });
}); 