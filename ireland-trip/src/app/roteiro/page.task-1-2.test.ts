import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

// ---------------------------------------------------------------------------
// Task 1.2 — Cabeçalho: título, período, badge de cidades, metadados SEO,
//            container max-width 1000px
// Requirements: 2.4, 2.6, 5.6, 7.4
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
import { metadata, default as RoteiroPage } from './page';

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
    atividades: 'Tour Guinness, Pub Crawl',
    ...override,
  };
}

describe('Task 1.2 — Metadados SEO (req 7.4)', () => {
  it('metadata.title inclui "Roteiro"', () => {
    expect(String(metadata.title)).toContain('Roteiro');
  });

  it('metadata.description é uma string não vazia relevante para a rota', () => {
    expect(typeof metadata.description).toBe('string');
    expect((metadata.description as string).length).toBeGreaterThan(10);
  });
});

describe('Task 1.2 — Cabeçalho da página', () => {
  beforeEach(() => {
    vi.mocked(getRoteiro).mockClear();
  });

  it('renderiza o título "Roteiro" na página (req 2.4)', async () => {
    vi.mocked(getRoteiro).mockResolvedValueOnce([makeMockCity()]);
    const jsx = await RoteiroPage();
    const html = renderToStaticMarkup(jsx);
    expect(html).toContain('Roteiro');
  });

  it('renderiza o período "Ago" e "2026" no subtítulo (req 2.4)', async () => {
    vi.mocked(getRoteiro).mockResolvedValueOnce([makeMockCity()]);
    const jsx = await RoteiroPage();
    const html = renderToStaticMarkup(jsx);
    expect(html).toContain('Ago');
    expect(html).toContain('2026');
  });

  it('exibe badge "1 cidade" para um único resultado (req 2.6)', async () => {
    vi.mocked(getRoteiro).mockResolvedValueOnce([makeMockCity()]);
    const jsx = await RoteiroPage();
    const html = renderToStaticMarkup(jsx);
    expect(html).toContain('1 cidade');
  });

  it('exibe badge "3 cidades" para três resultados (req 2.6)', async () => {
    const cities = [
      makeMockCity({ id: '1-Dublin', cidade: 'Dublin' }),
      makeMockCity({ id: '2-Belfast', cidade: 'Belfast', emoji: '🇬🇧' }),
      makeMockCity({ id: '3-Edinburgh', cidade: 'Edinburgh', emoji: '🏴' }),
    ];
    vi.mocked(getRoteiro).mockResolvedValueOnce(cities);
    const jsx = await RoteiroPage();
    const html = renderToStaticMarkup(jsx);
    expect(html).toContain('3 cidades');
  });

  it('badge usa plural "cidades" para zero resultados (req 2.6)', async () => {
    vi.mocked(getRoteiro).mockResolvedValueOnce([]);
    const jsx = await RoteiroPage();
    const html = renderToStaticMarkup(jsx);
    expect(html).toContain('0 cidades');
  });

  it('aplica container com max-width 1000px (req 5.6)', async () => {
    vi.mocked(getRoteiro).mockResolvedValueOnce([]);
    const jsx = await RoteiroPage();
    const html = renderToStaticMarkup(jsx);
    expect(html).toContain('1000px');
  });
});
