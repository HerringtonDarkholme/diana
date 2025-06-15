import { describe, it, expect } from 'vitest';
import { getHighlightTokens } from '../src/highlighting';

describe('highlighting', () => {
  it('should return highlight tokens (stub)', () => {
    const tokens = getHighlightTokens('integer: 123');
    expect(tokens).toBeInstanceOf(Array);
  });
}); 