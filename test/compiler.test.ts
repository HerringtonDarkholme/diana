import { describe, it, expect } from 'vitest';
import { compile } from '../src/compiler';
import { parse } from '../src/parser';
import { tokenize } from '../src/tokenizer';

describe('compiler', () => {
  it('should compile an AST', () => {
    const input = 'integer: 123';
    const tokens = tokenize(input);
    const ast = parse(tokens);
    const output = compile(ast);
    expect(output).toBeDefined();
  });
}); 