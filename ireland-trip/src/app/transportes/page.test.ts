import { vi, describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import React from 'react';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/sheets', () => ({
  getTransportes: vi.fn(),
}));
vi.mock('@/lib/finance', () => ({
  calculateTransportesTotals: vi.fn(() => ({})),
}));
vi.mock('@/components/TransportCard', () => ({
  default: ({ transport, index }: { transport: { id: string; origem: string; destino: string }; index: number }) =>
    React.createElement('div', { 'data-testid': 'transport-card', 'data-index': index }, `${transport.origem} → ${transport.destino}`),
}));

import { getTransportes } from '@/lib/sheets';
import { calculateTransportesTotals } from '@/lib/finance';
import TransportesPage from './page';
import type { Transport } from '@/lib/types';

const mockGetTransportes = getTransportes as ReturnType<typeof vi.fn>;
const mockCalcTotals = calculateTransportesTotals as ReturnType<typeof vi.fn>;

const makeTransport = (overrides: Partial<Transport>): Transport => ({
  id: '1-Dublin-Belfast',
  tipo: 'aviao',
  emoji: '✈️',
  origem: 'Dublin',
  destino: 'Belfast',
  data: '2026-08-20',
  horario: '10:00',
  duracao: '1h',
  operadora: 'Aer Lingus',
  status: 'pago',
  preco: 90,
  moeda: 'EUR',
  ...overrides,
});

describe('TransportesPage', () => {
  it('renderiza glass panel com mensagem de aviso quando array está vazio', async () => {
    mockGetTransportes.mockResolvedValue([]);
    mockCalcTotals.mockReturnValue({});
    const html = renderToString(await TransportesPage());
    expect(html).toContain('Nenhum trecho válido encontrado');
  });

  it('não renderiza seção de resumo quando array está vazio', async () => {
    mockGetTransportes.mockResolvedValue([]);
    mockCalcTotals.mockReturnValue({});
    const html = renderToString(await TransportesPage());
    expect(html).not.toContain('Resumo');
  });

  it('renderiza TransportCard para cada transporte no array', async () => {
    const transports = [
      makeTransport({ id: '1-a', origem: 'Dublin', destino: 'Belfast' }),
      makeTransport({ id: '2-b', origem: 'Edinburgh', destino: 'London' }),
    ];
    mockGetTransportes.mockResolvedValue(transports);
    mockCalcTotals.mockReturnValue({});
    const html = renderToString(await TransportesPage());
    expect(html).toContain('Dublin → Belfast');
    expect(html).toContain('Edinburgh → London');
  });

  it('ordena cards em ordem cronológica ascendente independente da ordem do array', async () => {
    const transports = [
      makeTransport({ id: '2-b', data: '2026-08-28', origem: 'Edinburgh', destino: 'London' }),
      makeTransport({ id: '1-a', data: '2026-08-20', origem: 'Dublin', destino: 'Belfast' }),
    ];
    mockGetTransportes.mockResolvedValue(transports);
    mockCalcTotals.mockReturnValue({});
    const html = renderToString(await TransportesPage());
    const dublinPos = html.indexOf('Dublin → Belfast');
    const edinPos = html.indexOf('Edinburgh → London');
    expect(dublinPos).toBeLessThan(edinPos);
  });

  it('exibe cabeçalho com título "Transportes"', async () => {
    mockGetTransportes.mockResolvedValue([makeTransport({})]);
    mockCalcTotals.mockReturnValue({});
    const html = renderToString(await TransportesPage());
    expect(html).toContain('Transportes');
  });

  it('exibe subtítulo com contagem total de trechos', async () => {
    const transports = [makeTransport({}), makeTransport({ id: '2-x' })];
    mockGetTransportes.mockResolvedValue(transports);
    mockCalcTotals.mockReturnValue({});
    const html = renderToString(await TransportesPage());
    expect(html).toContain('2');
  });

  it('exibe resumo de custos com múltiplas moedas separadas', async () => {
    const transports = [
      makeTransport({ moeda: 'EUR', preco: 200 }),
      makeTransport({ id: '2-x', moeda: 'GBP', preco: 150 }),
    ];
    mockGetTransportes.mockResolvedValue(transports);
    mockCalcTotals.mockReturnValue({
      EUR: { paid: 200, pending: 0, total: 200, count: 1 },
      GBP: { paid: 0, pending: 150, total: 150, count: 1 },
    });
    const html = renderToString(await TransportesPage());
    expect(html).toContain('EUR');
    expect(html).toContain('GBP');
  });

  it('exibe contagem de trechos pagos vs. total no resumo', async () => {
    const transports = [
      makeTransport({ status: 'pago' }),
      makeTransport({ id: '2-x', status: 'pendente' }),
    ];
    mockGetTransportes.mockResolvedValue(transports);
    mockCalcTotals.mockReturnValue({
      EUR: { paid: 90, pending: 90, total: 180, count: 2 },
    });
    const html = renderToString(await TransportesPage());
    expect(html).toContain('1');
    expect(html).toContain('2');
  });

  it('não muta o array original ao ordenar', async () => {
    const transports = [
      makeTransport({ id: '2-b', data: '2026-08-28', origem: 'Edinburgh', destino: 'London' }),
      makeTransport({ id: '1-a', data: '2026-08-20', origem: 'Dublin', destino: 'Belfast' }),
    ];
    mockGetTransportes.mockResolvedValue(transports);
    mockCalcTotals.mockReturnValue({});
    await TransportesPage();
    expect(transports[0].origem).toBe('Edinburgh');
  });
});
