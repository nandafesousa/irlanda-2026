import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('server-only', () => ({}));

process.env.GOOGLE_SHEETS_ID = 'test-sheet-id';
process.env.GOOGLE_API_KEY = 'test-api-key';

import { getTransportes } from './sheets';

const transportesHeaders = ['tipo', 'emoji', 'origem', 'destino', 'data', 'horario', 'duracao', 'operadora', 'status', 'preco', 'moeda', 'observacoes'];

const makeRows = (headers: string[], ...dataRows: string[][]): string[][] => [headers, ...dataRows];

const mockFetchWith = (rows: string[][]) => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ values: rows }),
  }));
};

// ---------------------------------------------------------------------------
// Task 2.1 — fetchSheetRange aceita e repassa init (revalidate)
// ---------------------------------------------------------------------------
describe('fetchSheetRange — repassa { next: { revalidate } } ao fetch nativo (task 2.1)', () => {
  beforeEach(() => {
    process.env.GOOGLE_SHEETS_ID = 'test-sheet-id';
    process.env.GOOGLE_API_KEY = 'test-api-key';
  });
  afterEach(() => vi.unstubAllGlobals());

  it('getTransportes chama fetch com { next: { revalidate: 3600 } }', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ values: makeRows(transportesHeaders) }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await getTransportes();

    const opts = mockFetch.mock.calls[0][1] as RequestInit & { next?: { revalidate?: number } };
    expect(opts?.next?.revalidate).toBe(3600);
  });
});

// ---------------------------------------------------------------------------
// Task 2.2 — normalizeTransportDate (tested via getTransportes)
// ---------------------------------------------------------------------------
describe('normalizeTransportDate via getTransportes (task 2.2)', () => {
  beforeEach(() => {
    process.env.GOOGLE_SHEETS_ID = 'test-sheet-id';
    process.env.GOOGLE_API_KEY = 'test-api-key';
  });
  afterEach(() => vi.unstubAllGlobals());

  it('"27/08" → "2026-08-27"', async () => {
    mockFetchWith(makeRows(transportesHeaders, ['avião', '✈️', 'Dublin', 'Edimburgo', '27/08', '10:00', '1h10', 'Ryanair', 'pago', '120', 'EUR', '']));
    const result = await getTransportes();
    expect(result[0].data).toBe('2026-08-27');
  });

  it('"27/08/2026" → "2026-08-27"', async () => {
    mockFetchWith(makeRows(transportesHeaders, ['avião', '✈️', 'Dublin', 'Edimburgo', '27/08/2026', '10:00', '1h10', 'Ryanair', 'pago', '120', 'EUR', '']));
    const result = await getTransportes();
    expect(result[0].data).toBe('2026-08-27');
  });

  it('"2026-08-27" passthrough — permanece "2026-08-27"', async () => {
    mockFetchWith(makeRows(transportesHeaders, ['avião', '✈️', 'Dublin', 'Edimburgo', '2026-08-27', '10:00', '1h10', 'Ryanair', 'pago', '120', 'EUR', '']));
    const result = await getTransportes();
    expect(result[0].data).toBe('2026-08-27');
  });

  it('data inválida descarta linha silenciosamente e emite console.warn', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockFetchWith(makeRows(
      transportesHeaders,
      ['avião', '✈️', 'Dublin', 'Edimburgo', 'NAO-UMA-DATA', '10:00', '1h10', 'Ryanair', 'pago', '120', 'EUR', ''],
      ['trem', '🚂', 'Edimburgo', 'Londres', '28/08', '09:00', '4h30', 'Scotrail', 'pago', '80', 'GBP', ''],
    ));
    const result = await getTransportes();
    expect(result).toHaveLength(1);
    expect(result[0].tipo).toBe('trem');
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Task 2.3 — normalizeTransportRow
// ---------------------------------------------------------------------------
describe('normalizeTransportRow via getTransportes (task 2.3)', () => {
  beforeEach(() => {
    process.env.GOOGLE_SHEETS_ID = 'test-sheet-id';
    process.env.GOOGLE_API_KEY = 'test-api-key';
  });
  afterEach(() => vi.unstubAllGlobals());

  it('mapeia "AVIÃO" (case-insensitive) para tipo "aviao" e emoji ✈️', async () => {
    mockFetchWith(makeRows(transportesHeaders, ['AVIÃO', '✈️', 'Lisboa', 'Dublin', '01/08', '07:00', '2h30', 'TAP', 'pago', '250', 'EUR', '']));
    const result = await getTransportes();
    expect(result[0].tipo).toBe('aviao');
    expect(result[0].emoji).toBe('✈️');
  });

  it('mapeia "Trem" para tipo "trem" e emoji 🚂', async () => {
    mockFetchWith(makeRows(transportesHeaders, ['Trem', '🚂', 'Edimburgo', 'Londres', '28/08', '09:00', '4h30', 'Scotrail', 'pago', '80', 'GBP', '']));
    const result = await getTransportes();
    expect(result[0].tipo).toBe('trem');
    expect(result[0].emoji).toBe('🚂');
  });

  it('mapeia "ferry" para tipo "ferry" e emoji ⛴️', async () => {
    mockFetchWith(makeRows(transportesHeaders, ['ferry', '⛴️', 'Dublin', 'Holyhead', '15/08', '14:00', '3h30', 'Stena', 'pago', '60', 'EUR', '']));
    const result = await getTransportes();
    expect(result[0].tipo).toBe('ferry');
    expect(result[0].emoji).toBe('⛴️');
  });

  it('mapeia "ônibus" para tipo "onibus" e emoji 🚌', async () => {
    mockFetchWith(makeRows(transportesHeaders, ['ônibus', '🚌', 'Dublin', 'Galway', '10/08', '08:00', '2h15', 'Bus Éireann', 'pendente', '15', 'EUR', '']));
    const result = await getTransportes();
    expect(result[0].tipo).toBe('onibus');
    expect(result[0].emoji).toBe('🚌');
  });

  it('tipo desconhecido (ex.: "táxi") → tipo "outro", emoji 🚗, linha preservada', async () => {
    mockFetchWith(makeRows(transportesHeaders, ['táxi', '🚗', 'Aeroporto', 'Hotel', '05/08', '12:00', '30min', 'Uber', 'pago', '25', 'EUR', '']));
    const result = await getTransportes();
    expect(result).toHaveLength(1);
    expect(result[0].tipo).toBe('outro');
    expect(result[0].emoji).toBe('🚗');
  });

  it('status " PAGO " normalizado para "pago"', async () => {
    mockFetchWith(makeRows(transportesHeaders, ['avião', '✈️', 'Dublin', 'Belfast', '20/08', '11:00', '1h', 'Aer Lingus', ' PAGO ', '90', 'EUR', '']));
    const result = await getTransportes();
    expect(result[0].status).toBe('pago');
  });

  it('status "Pendente" normalizado para "pendente"', async () => {
    mockFetchWith(makeRows(transportesHeaders, ['trem', '🚂', 'Dublin', 'Cork', '12/08', '10:30', '2h45', 'Irish Rail', 'Pendente', '45', 'EUR', '']));
    const result = await getTransportes();
    expect(result[0].status).toBe('pendente');
  });

  it('preco "abc" descarta linha silenciosamente, mantém linha válida', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockFetchWith(makeRows(
      transportesHeaders,
      ['avião', '✈️', 'Lisboa', 'Dublin', '01/08', '07:00', '2h30', 'TAP', 'pago', 'abc', 'EUR', ''],
      ['trem', '🚂', 'Edimburgo', 'Londres', '28/08', '09:00', '4h30', 'Scotrail', 'pago', '80', 'GBP', ''],
    ));
    const result = await getTransportes();
    expect(result).toHaveLength(1);
    expect(result[0].tipo).toBe('trem');
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('observacoes ausente (vazio) → undefined', async () => {
    mockFetchWith(makeRows(transportesHeaders, ['avião', '✈️', 'Dublin', 'Edimburgo', '27/08', '10:00', '1h10', 'Ryanair', 'pago', '120', 'EUR', '']));
    const result = await getTransportes();
    expect(result[0].observacoes).toBeUndefined();
  });

  it('observacoes presente → string trimada', async () => {
    mockFetchWith(makeRows(transportesHeaders, ['avião', '✈️', 'Dublin', 'Edimburgo', '27/08', '10:00', '1h10', 'Ryanair', 'pago', '120', 'EUR', '  Conexão em Heathrow  ']));
    const result = await getTransportes();
    expect(result[0].observacoes).toBe('Conexão em Heathrow');
  });
});

// ---------------------------------------------------------------------------
// Task 2.4 — getTransportes: fetch, id generation, sorting
// ---------------------------------------------------------------------------
describe('getTransportes completo (task 2.4)', () => {
  beforeEach(() => {
    process.env.GOOGLE_SHEETS_ID = 'test-sheet-id';
    process.env.GOOGLE_API_KEY = 'test-api-key';
  });
  afterEach(() => vi.unstubAllGlobals());

  it('chama fetchSheetRange com "Transportes!A:Z"', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ values: makeRows(transportesHeaders) }),
    });
    vi.stubGlobal('fetch', mockFetch);
    await getTransportes();
    expect(mockFetch.mock.calls[0][0]).toContain('Transportes!A:Z');
  });

  it('retorna Transport[] com preco estritamente numérico', async () => {
    mockFetchWith(makeRows(transportesHeaders, ['avião', '✈️', 'Lisboa', 'Dublin', '01/08', '07:00', '2h30', 'TAP', 'pago', '250', 'EUR', '']));
    const result = await getTransportes();
    expect(typeof result[0].preco).toBe('number');
    expect(result[0].preco).toBe(250);
  });

  it('id gerado no formato "${idx+1}-${origem}-${destino}"', async () => {
    mockFetchWith(makeRows(transportesHeaders, ['avião', '✈️', 'Lisboa', 'Dublin', '01/08', '07:00', '2h30', 'TAP', 'pago', '250', 'EUR', '']));
    const result = await getTransportes();
    expect(result[0].id).toBe('1-Lisboa-Dublin');
  });

  it('GOOGLE_API_KEY não aparece no retorno serializado', async () => {
    mockFetchWith(makeRows(transportesHeaders, ['avião', '✈️', 'Lisboa', 'Dublin', '01/08', '07:00', '2h30', 'TAP', 'pago', '250', 'EUR', '']));
    const result = await getTransportes();
    expect(JSON.stringify(result)).not.toContain('test-api-key');
  });

  it('retorna array vazio para sheet com apenas cabeçalho', async () => {
    mockFetchWith(makeRows(transportesHeaders));
    const result = await getTransportes();
    expect(result).toEqual([]);
  });

  it('descarta todas as linhas inválidas sem lançar exceção', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockFetchWith(makeRows(
      transportesHeaders,
      ['avião', '✈️', 'A', 'B', 'data-ruim', '10:00', '1h', 'X', 'pago', '100', 'EUR', ''],
      ['trem', '🚂', 'C', 'D', '01/08', '09:00', '2h', 'Y', 'pago', 'NaN', 'GBP', ''],
    ));
    const result = await getTransportes();
    expect(result).toHaveLength(0);
    warnSpy.mockRestore();
  });

  it('moeda normalizada para uppercase (ex.: "eur" → "EUR")', async () => {
    mockFetchWith(makeRows(transportesHeaders, ['avião', '✈️', 'Lisboa', 'Dublin', '01/08', '07:00', '2h30', 'TAP', 'pago', '250', 'eur', '']));
    const result = await getTransportes();
    expect(result[0].moeda).toBe('EUR');
  });
});
