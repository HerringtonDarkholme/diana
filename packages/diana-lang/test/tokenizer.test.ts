import { describe, it, expect } from 'vitest';
import { tokenize } from '../src/tokenizer';

describe('tokenizer', () => {
  it('should tokenize a simple key-value pair', () => {
    const input = 'integer: 123';
    const tokens = tokenize(input);
    expect(tokens.map(t => t.type)).toContain('IDENTIFIER');
    expect(tokens.map(t => t.type)).toContain('COLON');
    expect(tokens.map(t => t.type)).toContain('NUMBER');
  });

  it('should tokenize comments', () => {
    const input = '; this is a comment\nkey: 1';
    const tokens = tokenize(input);
    expect(tokens.some(t => t.type === 'COMMENT')).toBe(true);
  });

  it('should tokenize strings', () => {
    const input = 'string: "value"';
    const tokens = tokenize(input);
    expect(tokens.some(t => t.type === 'STRING')).toBe(true);
  });

  it('should tokenize multi-line strings', () => {
    const input = 'multi: """multi\nline\nstring"""';
    const tokens = tokenize(input);
    expect(tokens.some(t => t.type === 'STRING')).toBe(true);
  });

  it('should tokenize objects and lists', () => {
    const input = 'obj: { key: "v" }\nlist: [1, 2, 3]';
    const tokens = tokenize(input);
    expect(tokens.some(t => t.type === 'LBRACE')).toBe(true);
    expect(tokens.some(t => t.type === 'RBRACE')).toBe(true);
    expect(tokens.some(t => t.type === 'LBRACKET')).toBe(true);
    expect(tokens.some(t => t.type === 'RBRACKET')).toBe(true);
  });

  it('should tokenize indentation and dedentation', () => {
    const input = 'a:\n  b: 1\n  c: 2\nd: 3';
    const tokens = tokenize(input);
    expect(tokens.some(t => t.type === 'INDENT')).toBe(true);
    expect(tokens.some(t => t.type === 'DEDENT')).toBe(true);
  });

  it('should tokenize special keys', () => {
    const input = '[123]: "number key"\n"name.value.test": "quoted key"';
    const tokens = tokenize(input);
    expect(tokens.some(t => t.value === '[123]')).toBe(true);
    expect(tokens.some(t => t.value === '"name.value.test"')).toBe(true);
  });

  it('should tokenize booleans and null', () => {
    const input = 'flag: true\nnone: null';
    const tokens = tokenize(input);
    expect(tokens.some(t => t.type === 'BOOLEAN')).toBe(true);
    expect(tokens.some(t => t.type === 'NULL')).toBe(true);
  });
}); 