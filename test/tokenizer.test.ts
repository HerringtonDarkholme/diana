import { describe, it, expect } from 'vitest';
import { tokenize } from '../src/tokenizer';

describe('tokenizer', () => {
  it('should tokenize a simple Diana file', () => {
    const input = 'integer: 123';
    const tokens = tokenize(input);
    expect(tokens).toBeInstanceOf(Array);
  });
}); 