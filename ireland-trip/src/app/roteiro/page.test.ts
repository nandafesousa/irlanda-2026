import { vi, describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Task 1.1 — deriveAccentVar: fórmula cíclica (index % 6) + 1
// Extraída como função pura para ser testada isoladamente da página.
// ---------------------------------------------------------------------------

// Isola dependências server-only para que o módulo carregue em Vitest (Node)
vi.mock('server-only', () => ({}));
vi.mock('@/lib/sheets', () => ({
  getRoteiro: vi.fn().mockResolvedValue([]),
}));
vi.mock('@/components/CityCard', () => ({
  default: () => null,
}));

import { deriveAccentVar } from '@/lib/accent';

describe('deriveAccentVar (task 1.1)', () => {
  it('retorna --c1 para índice 0', () => {
    expect(deriveAccentVar(0)).toBe('--c1');
  });

  it('retorna --c6 para índice 5', () => {
    expect(deriveAccentVar(5)).toBe('--c6');
  });

  it('reinicia para --c1 no índice 6 (ciclo completo)', () => {
    expect(deriveAccentVar(6)).toBe('--c1');
  });

  it('retorna --c2 para índice 7', () => {
    expect(deriveAccentVar(7)).toBe('--c2');
  });

  it('cobre todos os valores 1–6 nos índices 0–5', () => {
    const results = Array.from({ length: 6 }, (_, i) => deriveAccentVar(i));
    expect(results).toEqual(['--c1', '--c2', '--c3', '--c4', '--c5', '--c6']);
  });

  it('nunca retorna valor com número fora de 1–6 nos 12 primeiros índices', () => {
    for (let i = 0; i < 12; i++) {
      const val = deriveAccentVar(i);
      expect(val).toMatch(/^--c[1-6]$/);
    }
  });
});
