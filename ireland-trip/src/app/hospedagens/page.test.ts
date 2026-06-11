import { vi, describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import React from 'react';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/sheets', () => ({
  getHospedagens: vi.fn(),
}));
vi.mock('@/components/HotelCard', () => ({
  default: ({ hotel }: { hotel: { nome_hotel: string } }) =>
    React.createElement('div', { 'data-testid': 'hotel-card' }, hotel.nome_hotel),
}));

import { getHospedagens } from '@/lib/sheets';
import HospedagensPage from './page';
import type { Hotel } from '@/lib/types';

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

const mockGetHospedagens = getHospedagens as ReturnType<typeof vi.fn>;

describe('HospedagensPage', () => {
  it('renderiza glass panel com mensagem de aviso quando array está vazio', async () => {
    mockGetHospedagens.mockResolvedValue([]);
    const html = renderToString(await HospedagensPage());
    expect(html).toContain('Nenhuma hospedagem válida encontrada');
  });

  it('não renderiza seção de totais quando array está vazio', async () => {
    mockGetHospedagens.mockResolvedValue([]);
    const html = renderToString(await HospedagensPage());
    expect(html).not.toContain('Resumo Financeiro');
  });

  it('renderiza HotelCard para cada hotel no array', async () => {
    const hotels = [
      makeHotel({ id: '1-A', nome_hotel: 'Hotel Alpha' }),
      makeHotel({ id: '2-B', nome_hotel: 'Hotel Beta' }),
    ];
    mockGetHospedagens.mockResolvedValue(hotels);
    const html = renderToString(await HospedagensPage());
    expect(html).toContain('Hotel Alpha');
    expect(html).toContain('Hotel Beta');
  });

  it('exibe totais separados para EUR e GBP quando array misto', async () => {
    const hotels = [
      makeHotel({ preco_total: 200, moeda: 'EUR', status: 'confirmado' }),
      makeHotel({ preco_total: 300, moeda: 'GBP', status: 'pendente' }),
    ];
    mockGetHospedagens.mockResolvedValue(hotels);
    const html = renderToString(await HospedagensPage());
    expect(html).toContain('EUR');
    expect(html).toContain('GBP');
  });

  it('exibe contagem X de Y confirmadas', async () => {
    const hotels = [
      makeHotel({ status: 'confirmado' }),
      makeHotel({ status: 'confirmado' }),
      makeHotel({ status: 'pendente' }),
    ];
    mockGetHospedagens.mockResolvedValue(hotels);
    const html = renderToString(await HospedagensPage());
    // 2 confirmed out of 3
    expect(html).toContain('2');
    expect(html).toContain('3');
  });

  it('exibe total de noites somado', async () => {
    const hotels = [
      makeHotel({ noites: 3, status: 'confirmado' }),
      makeHotel({ noites: 5, status: 'pendente' }),
    ];
    mockGetHospedagens.mockResolvedValue(hotels);
    const html = renderToString(await HospedagensPage());
    expect(html).toContain('8');
  });

  it('exibe título "Hospedagens" e subtítulo com total de registros', async () => {
    const hotels = [makeHotel({}), makeHotel({ id: '2-b' })];
    mockGetHospedagens.mockResolvedValue(hotels);
    const html = renderToString(await HospedagensPage());
    expect(html).toContain('Hospedagens');
    expect(html).toContain('2 hospedagens');
  });
});
