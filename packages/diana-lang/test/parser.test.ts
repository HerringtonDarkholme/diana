import { describe, it, expect } from 'vitest';
import { parse, ProgramNode } from '../src/parser';
import { tokenize } from '../src/tokenizer';

describe('parser', () => {
  it('should parse a simple key-value pair', () => {
    const input = 'integer: 123';
    const ast = parse(tokenize(input)) as ProgramNode;
    expect(ast.type).toBe('Program');
    expect(ast.children.length).toBe(1);
    const kv = ast.children[0];
    expect(kv.type).toBe('KeyValue');
    expect((kv as any).key).toBe('integer');
    expect((kv as any).value.type).toBe('Number');
    expect((kv as any).value.value).toBe(123);
  });

  it('should parse a string value', () => {
    const input = 'string: "hello"';
    const ast = parse(tokenize(input)) as ProgramNode;
    const kv = ast.children[0];
    expect((kv as any).value.type).toBe('String');
    expect((kv as any).value.value).toBe('hello');
  });

  it('should parse an object', () => {
    const input = 'obj: { a: 1, b: 2 }';
    const ast = parse(tokenize(input)) as ProgramNode;
    const kv = ast.children[0];
    expect((kv as any).value.type).toBe('Object');
    const props = (kv as any).value.properties;
    expect(props.length).toBe(2);
    expect(props[0].key).toBe('a');
    expect(props[0].value.value).toBe(1);
    expect(props[1].key).toBe('b');
    expect(props[1].value.value).toBe(2);
  });

  it('should parse a list', () => {
    const input = 'list: [1, 2, 3]';
    const ast = parse(tokenize(input)) as ProgramNode;
    const kv = ast.children[0];
    expect((kv as any).value.type).toBe('List');
    const items = (kv as any).value.items;
    expect(items.length).toBe(3);
    expect(items[0].type).toBe('Number');
    expect(items[0].value).toBe(1);
    expect(items[2].value).toBe(3);
  });

  it('should parse booleans and null', () => {
    const input = 'flag: true\nnone: null';
    const ast = parse(tokenize(input)) as ProgramNode;
    expect((ast.children[0] as any).value.type).toBe('Boolean');
    expect((ast.children[0] as any).value.value).toBe(true);
    expect((ast.children[1] as any).value.type).toBe('Null');
  });

  it('should parse comments as AST nodes', () => {
    const input = '; comment\nkey: 1';
    const ast = parse(tokenize(input)) as ProgramNode;
    expect(ast.children[0].type).toBe('Comment');
    expect((ast.children[0] as any).value).toContain('comment');
    expect(ast.children[1].type).toBe('KeyValue');
  });
}); 