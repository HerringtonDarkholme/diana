import { describe, it, expect } from 'vitest';
import { compile } from '../src/compiler';
import { parse } from '../src/parser';
import { tokenize } from '../src/tokenizer';

describe('compiler', () => {
  it('should compile a simple key-value pair', () => {
    const input = 'integer: 123';
    const output = compile(parse(tokenize(input)));
    expect(output).toEqual({ integer: 123 });
  });

  it('should compile a string value', () => {
    const input = 'string: "hello"';
    const output = compile(parse(tokenize(input)));
    expect(output).toEqual({ string: 'hello' });
  });

  it('should compile an object', () => {
    const input = 'obj: { a: 1, b: 2 }';
    const output = compile(parse(tokenize(input)));
    expect(output).toEqual({ obj: { a: 1, b: 2 } });
  });

  it('should compile a list', () => {
    const input = 'list: [1, 2, 3]';
    const output = compile(parse(tokenize(input)));
    expect(output).toEqual({ list: [1, 2, 3] });
  });

  it('should compile booleans and null', () => {
    const input = 'flag: true\nnone: null';
    const output = compile(parse(tokenize(input)));
    expect(output).toEqual({ flag: true, none: null });
  });

  it('should ignore comments in output', () => {
    const input = '; comment\nkey: 1';
    const output = compile(parse(tokenize(input)));
    expect(output).toEqual({ key: 1 });
  });

  it('should compile nested objects', () => {
    const input = 'object: { key: "value", nested: { nest1: 42, nest2: { moreNested: "nest" } } }';
    const output = compile(parse(tokenize(input)));
    expect(output).toEqual({ object: { key: 'value', nested: { nest1: 42, nest2: { moreNested: 'nest' } } } });
  });

  it('should compile multi-line strings', () => {
    const input = 'multiple: """multiple line is\nsupported\n"""';
    const output = compile(parse(tokenize(input)));
    expect(output).toEqual({ multiple: 'multiple line is\nsupported\n' });
  });

  it('should compile oneline object', () => {
    const input = 'onelineObj: { a.b.c: 2, c.d: 1 }';
    const output = compile(parse(tokenize(input)));
    expect(output).toEqual({ onelineObj: { 'a.b.c': 2, 'c.d': 1 } });
  });

  it('should compile oneline list', () => {
    const input = 'oneline: [1, 2, 3, 4]';
    const output = compile(parse(tokenize(input)));
    expect(output).toEqual({ oneline: [1, 2, 3, 4] });
  });
}); 