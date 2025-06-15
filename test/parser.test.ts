import { describe, it, expect } from 'vitest';
import { parse } from '../src/parser';
import { tokenize } from '../src/tokenizer';

describe('parser', () => {
  it('should parse tokens into an AST', () => {
    const input = 'integer: 123';
    const tokens = tokenize(input);
    const ast = parse(tokens);
    expect(ast).toHaveProperty('type', 'Program');
  });
}); 