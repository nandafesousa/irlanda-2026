import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock server-only so it doesn't throw in Node test environment
vi.mock('server-only', () => ({}));

// Set env vars before module import to satisfy module-level validation
process.env.GOOGLE_SHEETS_ID = 'test-sheet-id';
process.env.GOOGLE_API_KEY = 'test-api-key';

import { getRoteiro, getHospedagens, getTransportes } from './sheets';

// Fixture helpers
const makeRows = (headers: string[], ...dataRows: string[][]): string[][] => [
  headers,
  ...dataRows,
];

const roteiroHeaders = ['cidade', 'emoji', 'data_entrada', 'data_saida', 'noites', 'destaque', 'bairro', 'preco_noite', 'moeda', 'atividades'];
const hospedagensHeaders = ['cidade', 'nome_hotel', 'data_checkin', 'data_checkout', 'noites', 'preco_total', 'moeda', 'status', 'endereco', 'link_booking', 'observacoes'];
const transportesHeaders = ['tipo', 'emoji', 'origem', 'destino', 'data', 'horario', 'duracao', 'operadora', 'status', 'preco', 'moeda', 'observacoes'];

// ---------------------------------------------------------------------------
// Task 2.1 – Env validation
// ---------------------------------------------------------------------------
describe('Env validation (task 2.1)', () => {
  it('does not throw when NEXT_PHASE=phase-production-build even without env vars', async () => {
    const originalPhase = process.env.NEXT_PHASE;
    const originalId = process.env.GOOGLE_SHEETS_ID;
    const originalKey = process.env.GOOGLE_API_KEY;

    process.env.NEXT_PHASE = 'phase-production-build';
    delete process.env.GOOGLE_SHEETS_ID;
    delete process.env.GOOGLE_API_KEY;

    vi.resetModules();
    await expect(import('./sheets')).resolves.toBeDefined();

    process.env.NEXT_PHASE = originalPhase ?? '';
    if (originalId) process.env.GOOGLE_SHEETS_ID = originalId;
    if (originalKey) process.env.GOOGLE_API_KEY = originalKey;
  });

  it('throws descriptive error when GOOGLE_SHEETS_ID is missing at runtime', async () => {
    const originalId = process.env.GOOGLE_SHEETS_ID;
    const originalKey = process.env.GOOGLE_API_KEY;
    delete process.env.GOOGLE_SHEETS_ID;
    delete process.env.NEXT_PHASE;
    if (originalKey) process.env.GOOGLE_API_KEY = originalKey;

    vi.resetModules();
    await expect(import('./sheets')).rejects.toThrow('GOOGLE_SHEETS_ID');

    if (originalId) process.env.GOOGLE_SHEETS_ID = originalId;
  });

  it('throws descriptive error when GOOGLE_API_KEY is missing at runtime', async () => {
    const originalId = process.env.GOOGLE_SHEETS_ID;
    const originalKey = process.env.GOOGLE_API_KEY;
    if (originalId) process.env.GOOGLE_SHEETS_ID = originalId;
    delete process.env.GOOGLE_API_KEY;
    delete process.env.NEXT_PHASE;

    vi.resetModules();
    await expect(import('./sheets')).rejects.toThrow('GOOGLE_API_KEY');

    if (originalKey) process.env.GOOGLE_API_KEY = originalKey;
  });
});

// ---------------------------------------------------------------------------
// Task 2.2 – fetchSheetRange (tested via public functions)
// ---------------------------------------------------------------------------
describe('fetchSheetRange behaviour (task 2.2)', () => {
  beforeEach(() => {
    process.env.GOOGLE_SHEETS_ID = 'test-sheet-id';
    process.env.GOOGLE_API_KEY = 'test-api-key';
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('constructs URL with GOOGLE_SHEETS_ID and GOOGLE_API_KEY', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ values: makeRows(roteiroHeaders, ['Lisboa', '🇵🇹', '01/07', '03/07', '2', 'sim', 'Baixa', '80', 'EUR', 'Fado']) }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await getRoteiro();

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('test-sheet-id');
    expect(calledUrl).toContain('test-api-key');
    expect(calledUrl).toContain('sheets.googleapis.com');
    expect(calledUrl).toContain('Roteiro');
  });

  it('passes { next: { revalidate: 3600 } } to fetch', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ values: makeRows(roteiroHeaders, ['Lisboa', '🇵🇹', '01/07', '03/07', '2', 'sim', 'Baixa', '80', 'EUR', 'Fado']) }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await getRoteiro();

    const calledOptions = mockFetch.mock.calls[0][1] as RequestInit & { next?: { revalidate?: number } };
    expect(calledOptions?.next?.revalidate).toBe(3600);
  });

  it('throws an error with status and body when API returns HTTP error', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => 'API key not valid',
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(getRoteiro()).rejects.toThrow('403');
  });

  it('emits console.warn and returns [] when response has no values property', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await getRoteiro();

    expect(result).toEqual([]);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Roteiro'));
    warnSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Task 2.3 – mapRowsToType (tested via public functions)
// ---------------------------------------------------------------------------
describe('mapRowsToType behaviour (task 2.3)', () => {
  beforeEach(() => {
    process.env.GOOGLE_SHEETS_ID = 'test-sheet-id';
    process.env.GOOGLE_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps rows to objects using header names as keys', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        values: makeRows(
          roteiroHeaders,
          ['Lisboa', '🇵🇹', '01/07', '03/07', '2', 'sim', 'Baixa', '80', 'EUR', 'Fado'],
        ),
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const cities = await getRoteiro();

    expect(cities).toHaveLength(1);
    expect(cities[0].cidade).toBe('Lisboa');
    expect(cities[0].emoji).toBe('🇵🇹');
    expect(cities[0].atividades).toBe('Fado');
  });

  it('converts numeric fields with Number(raw) || 0', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        values: makeRows(
          roteiroHeaders,
          ['Lisboa', '🇵🇹', '01/07', '03/07', '3', 'sim', 'Baixa', '85', 'EUR', 'Fado'],
        ),
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const cities = await getRoteiro();
    expect(cities[0].noites).toBe(3);
    expect(typeof cities[0].noites).toBe('number');
    expect(cities[0].preco_noite).toBe(85);
    expect(typeof cities[0].preco_noite).toBe('number');
  });

  it('defaults numeric field to 0 when raw value is empty or non-numeric', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        values: makeRows(
          roteiroHeaders,
          ['Lisboa', '🇵🇹', '01/07', '03/07', '', 'sim', 'Baixa', 'N/A', 'EUR', 'Fado'],
        ),
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const cities = await getRoteiro();
    expect(cities[0].noites).toBe(0);
    expect(cities[0].preco_noite).toBe(0);
  });

  it('uses empty string for truncated row cells (null-coalescing)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        values: makeRows(
          roteiroHeaders,
          // Row has fewer cells than headers (API truncates trailing empty cells)
          ['Lisboa', '🇵🇹'],
        ),
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const cities = await getRoteiro();
    expect(cities[0].data_entrada).toBe('');
    expect(cities[0].noites).toBe(0);
  });

  it('throws descriptive error when required header column is missing', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        values: makeRows(
          ['cidade', 'emoji'], // missing many required headers
          ['Lisboa', '🇵🇹'],
        ),
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(getRoteiro()).rejects.toThrow(/data_entrada|Roteiro/);
  });

  it('returns [] when rows array is empty (only headers)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        values: makeRows(roteiroHeaders),
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const cities = await getRoteiro();
    expect(cities).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Task 2.4 – Public fetch functions
// ---------------------------------------------------------------------------
describe('Public functions (task 2.4)', () => {
  beforeEach(() => {
    process.env.GOOGLE_SHEETS_ID = 'test-sheet-id';
    process.env.GOOGLE_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getRoteiro calls Roteiro!A:Z range', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ values: makeRows(roteiroHeaders) }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await getRoteiro();

    expect(mockFetch.mock.calls[0][0]).toContain('Roteiro!A:Z');
  });

  it('getHospedagens calls Hospedagens!A:Z range', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ values: makeRows(hospedagensHeaders) }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await getHospedagens();

    expect(mockFetch.mock.calls[0][0]).toContain('Hospedagens!A:Z');
  });

  it('getTransportes calls Transportes!A:Z range', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ values: makeRows(transportesHeaders) }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await getTransportes();

    expect(mockFetch.mock.calls[0][0]).toContain('Transportes!A:Z');
  });

  it('getHospedagens returns Hotel[] with numeric noites and preco_total', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        values: makeRows(
          hospedagensHeaders,
          ['Lisboa', 'Hotel Alfa', '01/07', '03/07', '2', '180', 'EUR', 'confirmado', 'Rua A', 'http://booking.com', ''],
        ),
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const hotels = await getHospedagens();

    expect(hotels).toHaveLength(1);
    expect(hotels[0].nome_hotel).toBe('Hotel Alfa');
    expect(hotels[0].noites).toBe(2);
    expect(typeof hotels[0].noites).toBe('number');
    expect(hotels[0].preco_total).toBe(180);
    expect(typeof hotels[0].preco_total).toBe('number');
  });

  it('getTransportes returns Transport[] with numeric preco', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        values: makeRows(
          transportesHeaders,
          ['Avião', '✈️', 'Lisboa', 'Dublin', '01/07', '10:00', '2h30', 'TAP', 'pago', '250', 'EUR', ''],
        ),
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const transports = await getTransportes();

    expect(transports).toHaveLength(1);
    expect(transports[0].tipo).toBe('aviao');
    expect(transports[0].preco).toBe(250);
    expect(typeof transports[0].preco).toBe('number');
  });

  it('GOOGLE_API_KEY does not appear in returned City values', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        values: makeRows(
          roteiroHeaders,
          ['Lisboa', '🇵🇹', '01/07', '03/07', '2', 'sim', 'Baixa', '80', 'EUR', 'Fado'],
        ),
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const cities = await getRoteiro();
    const serialized = JSON.stringify(cities);
    expect(serialized).not.toContain('test-api-key');
  });

  it('each returned City has a generated string id', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        values: makeRows(
          roteiroHeaders,
          ['Lisboa', '🇵🇹', '01/07', '03/07', '2', 'sim', 'Baixa', '80', 'EUR', 'Fado'],
          ['Porto', '🇵🇹', '03/07', '05/07', '2', 'sim', 'Ribeira', '70', 'EUR', 'Vinho'],
        ),
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const cities = await getRoteiro();

    expect(typeof cities[0].id).toBe('string');
    expect(cities[0].id.length).toBeGreaterThan(0);
    expect(cities[0].id).not.toBe(cities[1].id);
  });
});

// ---------------------------------------------------------------------------
// Task 1.2 — Integrar normalização em getHospedagens
// ---------------------------------------------------------------------------
describe('getHospedagens integração com normalizeHotelRow (task 1.2)', () => {
  beforeEach(() => {
    process.env.GOOGLE_SHEETS_ID = 'test-sheet-id';
    process.env.GOOGLE_API_KEY = 'test-api-key';
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('aplica .filter(Boolean) removendo entradas nulas sem lançar exceção', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // Row 1: inválida (status "cancelado") → null → filtrada
    // Row 2: válida → incluída
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        values: makeRows(
          hospedagensHeaders,
          ['Dublin', 'Hotel Inv', '01/08', '03/08', '2', '200', 'EUR', 'cancelado', 'Rua X', '', ''],
          ['Dublin', 'Hotel Val', '01/08', '03/08', '3', '300', 'EUR', 'confirmado', 'Rua Y', '', ''],
        ),
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const hotels = await getHospedagens();
    expect(hotels).toHaveLength(1);
    expect(hotels[0].nome_hotel).toBe('Hotel Val');
    warnSpy.mockRestore();
  });

  it('retorna Hotel[] estritamente tipado — id é string gerada corretamente', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        values: makeRows(
          hospedagensHeaders,
          ['Londres', 'Hotel BC', '10/08', '13/08', '3', '450', 'GBP', 'pendente', 'Rua Z', '', ''],
        ),
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const hotels = await getHospedagens();
    expect(hotels).toHaveLength(1);
    const h = hotels[0];
    expect(typeof h.id).toBe('string');
    expect(h.id).toBe('1-Hotel BC');
    expect(typeof h.noites).toBe('number');
    expect(typeof h.preco_total).toBe('number');
    expect(h.status).toBe('pendente');
    expect(h.moeda).toBe('GBP');
  });

  it('chama fetchSheetRange com "Hospedagens!A:Z"', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ values: makeRows(hospedagensHeaders) }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await getHospedagens();
    expect(mockFetch.mock.calls[0][0]).toContain('Hospedagens!A:Z');
  });

  it('retorna array vazio quando todas as linhas são inválidas', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        values: makeRows(
          hospedagensHeaders,
          ['Dublin', 'Hotel Bad', '01/08', '03/08', '2', 'NaN', 'EUR', 'confirmado', '', '', ''],
        ),
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const hotels = await getHospedagens();
    expect(hotels).toHaveLength(0);
    warnSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Task 1.1 — normalizeHotelRow (tested via getHospedagens with fetch mock)
// ---------------------------------------------------------------------------
describe('normalizeHotelRow via getHospedagens (task 1.1)', () => {
  beforeEach(() => {
    process.env.GOOGLE_SHEETS_ID = 'test-sheet-id';
    process.env.GOOGLE_API_KEY = 'test-api-key';
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('normaliza status " CONFIRMADO " para "confirmado"', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        values: makeRows(
          hospedagensHeaders,
          ['Dublin', 'Hotel A', '01/08', '03/08', '2', '200', 'EUR', ' CONFIRMADO ', 'Rua B', '', ''],
        ),
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const hotels = await getHospedagens();
    expect(hotels).toHaveLength(1);
    expect(hotels[0].status).toBe('confirmado');
  });

  it('normaliza status "Pendente" para "pendente"', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        values: makeRows(
          hospedagensHeaders,
          ['Dublin', 'Hotel B', '01/08', '03/08', '2', '200', 'EUR', 'Pendente', 'Rua B', '', ''],
        ),
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const hotels = await getHospedagens();
    expect(hotels).toHaveLength(1);
    expect(hotels[0].status).toBe('pendente');
  });

  it('descarta silenciosamente linha com preco_total = "abc"', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        values: makeRows(
          hospedagensHeaders,
          ['Dublin', 'Hotel C', '01/08', '03/08', '2', 'abc', 'EUR', 'confirmado', 'Rua C', '', ''],
          ['Dublin', 'Hotel D', '04/08', '06/08', '2', '150', 'EUR', 'confirmado', 'Rua D', '', ''],
        ),
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const hotels = await getHospedagens();
    expect(hotels).toHaveLength(1);
    expect(hotels[0].nome_hotel).toBe('Hotel D');
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('descarta silenciosamente linha com noites = "" (NaN)', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        values: makeRows(
          hospedagensHeaders,
          ['Dublin', 'Hotel E', '01/08', '03/08', '', '200', 'EUR', 'confirmado', 'Rua E', '', ''],
        ),
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const hotels = await getHospedagens();
    expect(hotels).toHaveLength(0);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('retorna undefined para link_booking ausente ou vazio', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        values: makeRows(
          hospedagensHeaders,
          ['Dublin', 'Hotel F', '01/08', '03/08', '2', '200', 'EUR', 'confirmado', 'Rua F', '', ''],
        ),
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const hotels = await getHospedagens();
    expect(hotels[0].link_booking).toBeUndefined();
  });

  it('retorna link_booking quando presente', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        values: makeRows(
          hospedagensHeaders,
          ['Dublin', 'Hotel G', '01/08', '03/08', '2', '200', 'EUR', 'confirmado', 'Rua G', 'https://booking.com/hotel-g', ''],
        ),
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const hotels = await getHospedagens();
    expect(hotels[0].link_booking).toBe('https://booking.com/hotel-g');
  });

  it('normaliza moeda para uppercase (EUR)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        values: makeRows(
          hospedagensHeaders,
          ['Dublin', 'Hotel H', '01/08', '03/08', '2', '200', 'eur', 'confirmado', 'Rua H', '', ''],
        ),
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const hotels = await getHospedagens();
    expect(hotels[0].moeda).toBe('EUR');
  });

  it('descarta linha com status inválido ("cancelado")', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        values: makeRows(
          hospedagensHeaders,
          ['Dublin', 'Hotel I', '01/08', '03/08', '2', '200', 'EUR', 'cancelado', 'Rua I', '', ''],
        ),
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const hotels = await getHospedagens();
    expect(hotels).toHaveLength(0);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
