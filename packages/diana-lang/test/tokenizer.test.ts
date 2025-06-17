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

  it('should tokenize block comments', () => {
    const input = ';;; this is a\nmulti-line\nblock comment ;;;\nkey: 1';
    const tokens = tokenize(input);
    const comment = tokens.find(t => t.type === 'COMMENT');
    expect(comment).toBeDefined();
    expect(comment?.value).toBe(';;; this is a\nmulti-line\nblock comment ;;;');
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

  it('should handle numbers with underscores as digit separators', () => {
    const input = `a: 1_000
b: 3.14_159
c: 6.02e+23_000
d: -1_234.5_678e-9_876`;
    const tokens = tokenize(input);
    expect(tokens.find(t => t.value === '1000')).toBeDefined();
    expect(tokens.find(t => t.value === '3.14159')).toBeDefined();
    expect(tokens.find(t => t.value === '6.02e+23000')).toBeDefined();
    expect(tokens.find(t => t.value === '-1234.5678e-9876')).toBeDefined();
  });

  it('should tokenize let as LET keyword', () => {
    const input = 'let x = 1';
    const tokens = tokenize(input);
    expect(tokens.some(t => t.type === 'LET')).toBe(true);
    // Should not be an IDENTIFIER for 'let'
    expect(tokens.find(t => t.value === 'let')?.type).toBe('LET');
  });
});

describe('tokenizer (edge cases and errors)', () => {
  it('should emit ERROR for unclosed block comment', () => {
    const input = ';;; unclosed block comment';
    const tokens = tokenize(input);
    expect(tokens.some(t => t.type === 'ERROR' && t.value?.includes('Unclosed block comment'))).toBe(true);
  });

  it('should emit ERROR for unclosed string', () => {
    const input = 'key: "unclosed string';
    const tokens = tokenize(input);
    expect(tokens.some(t => t.type === 'ERROR' && t.value?.includes('Unclosed string'))).toBe(true);
  });

  it('should handle .5 and -.5 as numbers', () => {
    const input = `a: .5\nb: -.5`;
    const tokens = tokenize(input);
    expect(tokens.filter(t => t.type === 'NUMBER').map(t => t.value)).toEqual(['.5', '-.5']);
  });

  it('should handle triple-quoted keys and strings', () => {
    const input = `"""triple key""": 1\ntriple: """multi\nline\nstring"""`;
    const tokens = tokenize(input);
    expect(tokens.some(t => t.value === '"""triple key"""')).toBe(true);
    expect(tokens.some(t => t.type === 'STRING' && t.value?.includes('multi'))).toBe(true);
  });

  it('should handle bracketed keys with and without colon', () => {
    const input = `[abc]: 1\n[def] 2`;
    const tokens = tokenize(input);
    expect(tokens.some(t => t.type === 'IDENTIFIER' && t.value === '[abc]')).toBe(true);
    expect(tokens.filter(t => t.type === 'LBRACKET').length).toBeGreaterThan(0);
  });

  it('should record correct line and column for tokens', () => {
    const input = `a: 1\n  b: 2`;
    const tokens = tokenize(input);
    const bToken = tokens.find(t => t.value === 'b');
    expect(bToken?.line).toBe(2);
    expect(bToken?.column).toBe(3);
  });
}); 