import { describe, it, expect } from 'vitest';
import { startLSP } from '../src/lsp';

describe('lsp', () => {
  it('should start the LSP server (stub)', () => {
    expect(typeof startLSP).toBe('function');
  });
}); 