import { describe, it, expect } from 'vitest';

// isItemActive is a pure function — test it directly.
// It will be exported from Nav.tsx as a named export for testability.
import { isItemActive } from '../Nav';

describe('isItemActive', () => {
  it('returns true for Home when pathname is /', () => {
    expect(isItemActive('/', '/', false)).toBe(true);
  });

  it('returns false for Home when another non-home route is matched', () => {
    expect(isItemActive('/roteiro', '/', true)).toBe(false);
  });

  it('returns true for Home as fallback when pathname is not mapped (anyNonHomeMatched=false)', () => {
    expect(isItemActive('/perfil', '/', false)).toBe(true);
  });

  it('returns true for /roteiro when pathname is /roteiro', () => {
    expect(isItemActive('/roteiro', '/roteiro', true)).toBe(true);
  });

  it('returns true for /roteiro when pathname is a sub-route /roteiro/dia-1', () => {
    expect(isItemActive('/roteiro/dia-1', '/roteiro', true)).toBe(true);
  });

  it('returns false for /roteiro when pathname is /hospedagens', () => {
    expect(isItemActive('/hospedagens', '/roteiro', true)).toBe(false);
  });

  it('returns true for /hospedagens when pathname is /hospedagens', () => {
    expect(isItemActive('/hospedagens', '/hospedagens', true)).toBe(true);
  });

  it('returns true for /transportes when pathname is /transportes', () => {
    expect(isItemActive('/transportes', '/transportes', true)).toBe(true);
  });

  it('returns false for /transportes when pathname is /', () => {
    expect(isItemActive('/', '/transportes', false)).toBe(false);
  });
});
