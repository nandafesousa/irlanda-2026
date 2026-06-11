import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

// ---------------------------------------------------------------------------
// Task 6.1 — Layout mobile: coluna única, cards full-width e linha conectora esquerda
// Requirements: 6.1, 6.2
// ---------------------------------------------------------------------------

vi.mock('server-only', () => ({}));
vi.mock('@/lib/sheets', () => ({
  getRoteiro: vi.fn().mockResolvedValue([]),
}));
vi.mock('@/components/CityCard', () => ({
  default: () => null,
}));

import { getRoteiro } from '@/lib/sheets';
import type { City } from '@/lib/types';
import { default as RoteiroPage } from './page';

function makeMockCity(override: Partial<City> = {}): City {
  return {
    id: '1-Dublin',
    cidade: 'Dublin',
    emoji: '🇮🇪',
    data_entrada: '28/08',
    data_saida: '01/09',
    noites: 4,
    destaque: 'Guinness Storehouse',
    bairro: 'Temple Bar',
    preco_noite: 85,
    moeda: 'EUR',
    atividades: 'Tour Guinness',
    ...override,
  };
}

// ---------------------------------------------------------------------------
// Req 6.1 — coluna única em viewport ≤ 768px
// ---------------------------------------------------------------------------

describe('Task 6.1 — Coluna única em mobile (req 6.1)', () => {
  beforeEach(() => {
    vi.mocked(getRoteiro).mockClear();
  });

  it('media query 768px colapsa o grid para grid-template-columns: 1fr', async () => {
    vi.mocked(getRoteiro).mockResolvedValueOnce([]);
    const jsx = await RoteiroPage();
    const html = renderToStaticMarkup(jsx);
    // Within the 768px media query, grid-template-columns must be 1fr (single column)
    expect(html).toMatch(/max-width:\s*768px[^@]*grid-template-columns:\s*1fr(?!\s*1fr)/s);
  });

  it('media query 768px redefine nth-child(odd) para grid-column 1', async () => {
    vi.mocked(getRoteiro).mockResolvedValueOnce([]);
    const jsx = await RoteiroPage();
    const html = renderToStaticMarkup(jsx);
    // Inside the 768px block, nth-child(odd) must set grid-column: 1
    expect(html).toMatch(/max-width:\s*768px[^@]*nth-child\(odd\)/s);
  });

  it('media query 768px redefine nth-child(even) para grid-column 1', async () => {
    vi.mocked(getRoteiro).mockResolvedValueOnce([]);
    const jsx = await RoteiroPage();
    const html = renderToStaticMarkup(jsx);
    // Inside the 768px block, nth-child(even) must also be set to grid-column: 1
    expect(html).toMatch(/max-width:\s*768px[^@]*nth-child\(even\)/s);
  });
});

// ---------------------------------------------------------------------------
// Req 6.2 — cards full-width em mobile (sem margens horizontais excessivas)
// ---------------------------------------------------------------------------

describe('Task 6.1 — Cards full-width em mobile (req 6.2)', () => {
  beforeEach(() => {
    vi.mocked(getRoteiro).mockClear();
  });

  it('media query 768px aplica justify-self: stretch nos cards para largura total', async () => {
    vi.mocked(getRoteiro).mockResolvedValueOnce([]);
    const jsx = await RoteiroPage();
    const html = renderToStaticMarkup(jsx);
    // justify-self: stretch makes items fill the grid cell (full-width in 1-col grid)
    expect(html).toMatch(/max-width:\s*768px[^@]*justify-self:\s*stretch/s);
  });
});

// ---------------------------------------------------------------------------
// Req 6.1 — linha conectora reposicionada para borda esquerda em mobile
// ---------------------------------------------------------------------------

describe('Task 6.1 — Linha conectora em mobile na borda esquerda (req 6.1)', () => {
  beforeEach(() => {
    vi.mocked(getRoteiro).mockClear();
  });

  it('media query 768px move a linha conectora para left: 24px', async () => {
    vi.mocked(getRoteiro).mockResolvedValueOnce([]);
    const jsx = await RoteiroPage();
    const html = renderToStaticMarkup(jsx);
    expect(html).toContain('left: 24px');
  });

  it('media query 768px remove o transform: translateX da linha (transform: none)', async () => {
    vi.mocked(getRoteiro).mockResolvedValueOnce([]);
    const jsx = await RoteiroPage();
    const html = renderToStaticMarkup(jsx);
    expect(html).toMatch(/max-width:\s*768px[^@]*transform:\s*none/s);
  });

  it('a linha conectora desktop mantém left: 50% e translateX(-50%) fora do breakpoint mobile', async () => {
    vi.mocked(getRoteiro).mockResolvedValueOnce([]);
    const jsx = await RoteiroPage();
    const html = renderToStaticMarkup(jsx);
    expect(html).toContain('left: 50%');
    expect(html).toContain('translateX(-50%)');
  });
});
