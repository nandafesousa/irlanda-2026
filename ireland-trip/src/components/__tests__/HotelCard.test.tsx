import { renderToString } from 'react-dom/server';
import React from 'react';
import { describe, it, expect } from 'vitest';
import HotelCard from '../HotelCard';
import type { Hotel } from '@/lib/types';

const baseHotel: Hotel = {
  id: '1-test',
  cidade: 'Dublin',
  nome_hotel: 'Grand Canal Hotel',
  data_checkin: '01/08',
  data_checkout: '03/08',
  noites: 2,
  preco_total: 200,
  moeda: 'EUR',
  status: 'confirmado',
  endereco: 'Grand Canal St, Dublin',
};

describe('HotelCard', () => {
  it('renderiza "✅ Confirmado" quando status é confirmado', () => {
    const html = renderToString(React.createElement(HotelCard, { hotel: baseHotel, index: 0 }));
    expect(html).toContain('✅ Confirmado');
  });

  it('renderiza "⏳ Pendente" quando status é pendente', () => {
    const hotel: Hotel = { ...baseHotel, status: 'pendente' };
    const html = renderToString(React.createElement(HotelCard, { hotel, index: 0 }));
    expect(html).toContain('⏳ Pendente');
  });

  it('não renderiza elemento <a> de reserva quando link_booking é undefined', () => {
    const hotel: Hotel = { ...baseHotel, link_booking: undefined };
    const html = renderToString(React.createElement(HotelCard, { hotel, index: 0 }));
    expect(html).not.toContain('<a ');
  });

  it('renderiza link <a> quando link_booking está definido', () => {
    const hotel: Hotel = { ...baseHotel, link_booking: 'https://booking.com/hotel' };
    const html = renderToString(React.createElement(HotelCard, { hotel, index: 0 }));
    expect(html).toContain('<a ');
    expect(html).toContain('https://booking.com/hotel');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('renderiza nome_hotel e cidade', () => {
    const html = renderToString(React.createElement(HotelCard, { hotel: baseHotel, index: 0 }));
    expect(html).toContain('Grand Canal Hotel');
    expect(html).toContain('Dublin');
  });

  it('não renderiza observações quando observacoes é undefined', () => {
    const hotel: Hotel = { ...baseHotel, observacoes: undefined };
    const html = renderToString(React.createElement(HotelCard, { hotel, index: 0 }));
    expect(html).not.toContain('💚');
  });

  it('renderiza observações quando observacoes está definido', () => {
    const hotel: Hotel = { ...baseHotel, observacoes: 'Café da manhã incluído' };
    const html = renderToString(React.createElement(HotelCard, { hotel, index: 0 }));
    expect(html).toContain('Café da manhã incluído');
  });

  it('não renderiza endereço quando endereco é string vazia', () => {
    const hotel: Hotel = { ...baseHotel, endereco: '' };
    const html = renderToString(React.createElement(HotelCard, { hotel, index: 0 }));
    expect(html).not.toContain('Grand Canal St');
  });

  it('aplica animationDelay baseado no index', () => {
    const html = renderToString(React.createElement(HotelCard, { hotel: baseHotel, index: 2 }));
    expect(html).toContain('0.2s');
  });

  it('não contém onMouseEnter nem onMouseLeave no HTML renderizado', () => {
    const html = renderToString(React.createElement(HotelCard, { hotel: baseHotel, index: 0 }));
    expect(html).not.toContain('onMouseEnter');
    expect(html).not.toContain('onMouseLeave');
  });
});
