import { describe, it, expect } from 'vitest';
import { calculateHospedagensTotals, calculateTransportesTotals } from './finance';
import type { Hotel, Transport } from './types';

const makeHotel = (overrides: Partial<Hotel>): Hotel => ({
  id: '1-test',
  cidade: 'Dublin',
  nome_hotel: 'Test Hotel',
  data_checkin: '01/08',
  data_checkout: '03/08',
  noites: 2,
  preco_total: 100,
  moeda: 'EUR',
  status: 'confirmado',
  endereco: '',
  ...overrides,
});

describe('calculateHospedagensTotals', () => {
  it('retorna {} para array vazio sem lançar exceção', () => {
    expect(() => calculateHospedagensTotals([])).not.toThrow();
    expect(calculateHospedagensTotals([])).toEqual({});
  });

  it('calcula confirmed e total para um único hotel confirmado EUR', () => {
    const hotels = [makeHotel({ preco_total: 200, moeda: 'EUR', status: 'confirmado' })];
    const result = calculateHospedagensTotals(hotels);
    expect(result['EUR'].confirmed).toBe(200);
    expect(result['EUR'].pending).toBe(0);
    expect(result['EUR'].total).toBe(200);
  });

  it('calcula pending e total para um único hotel pendente EUR', () => {
    const hotels = [makeHotel({ preco_total: 150, moeda: 'EUR', status: 'pendente' })];
    const result = calculateHospedagensTotals(hotels);
    expect(result['EUR'].confirmed).toBe(0);
    expect(result['EUR'].pending).toBe(150);
    expect(result['EUR'].total).toBe(150);
  });

  it('calcula totais corretos para array misto EUR e GBP com status variados', () => {
    const hotels = [
      makeHotel({ preco_total: 200, moeda: 'EUR', status: 'confirmado' }),
      makeHotel({ preco_total: 80,  moeda: 'EUR', status: 'pendente' }),
      makeHotel({ preco_total: 300, moeda: 'GBP', status: 'confirmado' }),
      makeHotel({ preco_total: 120, moeda: 'GBP', status: 'pendente' }),
    ];
    const result = calculateHospedagensTotals(hotels);

    expect(result['EUR'].confirmed).toBe(200);
    expect(result['EUR'].pending).toBe(80);
    expect(result['EUR'].total).toBe(280);

    expect(result['GBP'].confirmed).toBe(300);
    expect(result['GBP'].pending).toBe(120);
    expect(result['GBP'].total).toBe(420);
  });

  it('invariante: total === confirmed + pending para cada moeda', () => {
    const hotels = [
      makeHotel({ preco_total: 350, moeda: 'EUR', status: 'confirmado' }),
      makeHotel({ preco_total: 100, moeda: 'EUR', status: 'pendente' }),
      makeHotel({ preco_total: 200, moeda: 'GBP', status: 'confirmado' }),
    ];
    const result = calculateHospedagensTotals(hotels);

    for (const moeda of Object.keys(result)) {
      const { confirmed, pending, total } = result[moeda];
      expect(total).toBe(confirmed + pending);
    }
  });

  it('acumula múltiplos hotéis da mesma moeda e status', () => {
    const hotels = [
      makeHotel({ preco_total: 100, moeda: 'EUR', status: 'confirmado' }),
      makeHotel({ preco_total: 200, moeda: 'EUR', status: 'confirmado' }),
      makeHotel({ preco_total: 50,  moeda: 'EUR', status: 'pendente' }),
    ];
    const result = calculateHospedagensTotals(hotels);
    expect(result['EUR'].confirmed).toBe(300);
    expect(result['EUR'].pending).toBe(50);
    expect(result['EUR'].total).toBe(350);
  });

  it('é uma função pura — não modifica o array de entrada', () => {
    const hotels = [makeHotel({ preco_total: 200, moeda: 'EUR', status: 'confirmado' })];
    const copy = [...hotels];
    calculateHospedagensTotals(hotels);
    expect(hotels).toEqual(copy);
  });
});

// ---------------------------------------------------------------------------
// calculateTransportesTotals — Task 3
// ---------------------------------------------------------------------------

const makeTransport = (overrides: Partial<Transport>): Transport => ({
  id: '1-Lisboa-Dublin',
  tipo: 'aviao',
  emoji: '✈️',
  origem: 'Lisboa',
  destino: 'Dublin',
  data: '2026-08-01',
  horario: '07:00',
  duracao: '2h30',
  operadora: 'TAP',
  status: 'pago',
  preco: 250,
  moeda: 'EUR',
  ...overrides,
});

describe('calculateTransportesTotals', () => {
  it('retorna {} para array vazio sem lançar exceção', () => {
    expect(() => calculateTransportesTotals([])).not.toThrow();
    expect(calculateTransportesTotals([])).toEqual({});
  });

  it('agrupa preco por moeda — único transporte pago EUR', () => {
    const transports = [makeTransport({ preco: 200, moeda: 'EUR', status: 'pago' })];
    const result = calculateTransportesTotals(transports);
    expect(result['EUR'].paid).toBe(200);
    expect(result['EUR'].pending).toBe(0);
    expect(result['EUR'].total).toBe(200);
    expect(result['EUR'].count).toBe(1);
  });

  it('agrupa preco por moeda — único transporte pendente EUR', () => {
    const transports = [makeTransport({ preco: 150, moeda: 'EUR', status: 'pendente' })];
    const result = calculateTransportesTotals(transports);
    expect(result['EUR'].paid).toBe(0);
    expect(result['EUR'].pending).toBe(150);
    expect(result['EUR'].total).toBe(150);
    expect(result['EUR'].count).toBe(1);
  });

  it('BRL e EUR ficam em chaves separadas, sem conversão implícita', () => {
    const transports = [
      makeTransport({ preco: 5600, moeda: 'BRL', status: 'pago' }),
      makeTransport({ preco: 420,  moeda: 'EUR', status: 'pago' }),
    ];
    const result = calculateTransportesTotals(transports);
    expect(result['BRL'].paid).toBe(5600);
    expect(result['EUR'].paid).toBe(420);
    expect(Object.keys(result)).toHaveLength(2);
  });

  it('invariante: total === paid + pending para cada moeda', () => {
    const transports = [
      makeTransport({ preco: 200, moeda: 'EUR', status: 'pago' }),
      makeTransport({ preco: 80,  moeda: 'EUR', status: 'pendente' }),
      makeTransport({ preco: 300, moeda: 'GBP', status: 'pago' }),
    ];
    const result = calculateTransportesTotals(transports);
    for (const moeda of Object.keys(result)) {
      const { paid, pending, total } = result[moeda];
      expect(total).toBe(paid + pending);
    }
  });

  it('count reflete o número de registros por moeda', () => {
    const transports = [
      makeTransport({ preco: 100, moeda: 'EUR', status: 'pago' }),
      makeTransport({ preco: 200, moeda: 'EUR', status: 'pendente' }),
      makeTransport({ preco: 300, moeda: 'GBP', status: 'pago' }),
    ];
    const result = calculateTransportesTotals(transports);
    expect(result['EUR'].count).toBe(2);
    expect(result['GBP'].count).toBe(1);
  });

  it('acumula múltiplos transportes da mesma moeda e status', () => {
    const transports = [
      makeTransport({ preco: 100, moeda: 'EUR', status: 'pago' }),
      makeTransport({ preco: 200, moeda: 'EUR', status: 'pago' }),
      makeTransport({ preco: 50,  moeda: 'EUR', status: 'pendente' }),
    ];
    const result = calculateTransportesTotals(transports);
    expect(result['EUR'].paid).toBe(300);
    expect(result['EUR'].pending).toBe(50);
    expect(result['EUR'].total).toBe(350);
    expect(result['EUR'].count).toBe(3);
  });

  it('é uma função pura — não modifica o array de entrada', () => {
    const transports = [makeTransport({ preco: 200, moeda: 'EUR', status: 'pago' })];
    const copy = [...transports];
    calculateTransportesTotals(transports);
    expect(transports).toEqual(copy);
  });
});
