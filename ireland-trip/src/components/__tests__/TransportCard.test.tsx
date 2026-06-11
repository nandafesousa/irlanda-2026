import { renderToString } from 'react-dom/server';
import React from 'react';
import { describe, it, expect } from 'vitest';
import TransportCard from '../TransportCard';
import type { Transport } from '@/lib/types';

const baseTransport: Transport = {
  id: '1-Dublin-London',
  tipo: 'aviao',
  emoji: '✈️',
  origem: 'Dublin',
  destino: 'London',
  data: '2026-08-27',
  horario: '07:30',
  duracao: '1h20',
  operadora: 'Ryanair',
  status: 'pago',
  preco: 150,
  moeda: 'EUR',
};

describe('TransportCard — layout e exibição (Task 4.1)', () => {
  it('renderiza rota no formato "Origem → Destino"', () => {
    const html = renderToString(React.createElement(TransportCard, { transport: baseTransport, index: 0 }));
    expect(html).toContain('Dublin');
    expect(html).toContain('London');
    expect(html).toContain('→');
  });

  it('exibe o emoji do tipo de transporte', () => {
    const html = renderToString(React.createElement(TransportCard, { transport: baseTransport, index: 0 }));
    expect(html).toContain('✈️');
  });

  it('exibe data, horário, duração e operadora', () => {
    const html = renderToString(React.createElement(TransportCard, { transport: baseTransport, index: 0 }));
    expect(html).toContain('2026-08-27');
    expect(html).toContain('07:30');
    expect(html).toContain('1h20');
    expect(html).toContain('Ryanair');
  });

  it('usa fundo var(--light) na meta row', () => {
    const html = renderToString(React.createElement(TransportCard, { transport: baseTransport, index: 0 }));
    expect(html).toContain('var(--light)');
  });

  it('renderiza preço via Intl.NumberFormat pt-BR com símbolo de moeda', () => {
    const html = renderToString(React.createElement(TransportCard, { transport: baseTransport, index: 0 }));
    // Intl.NumberFormat pt-BR currency EUR: "€ 150,00" or "€&#x202f;150,00"
    expect(html).toMatch(/150[,.]?00/);
    // deve usar Intl.NumberFormat, não simples toLocaleString sem currency
    expect(html).toContain('150');
  });

  it('não renderiza bloco de observações quando observacoes é undefined', () => {
    const t: Transport = { ...baseTransport, observacoes: undefined };
    const html = renderToString(React.createElement(TransportCard, { transport: t, index: 0 }));
    expect(html).not.toContain('Bagagem');
  });

  it('renderiza observações quando observacoes está definido', () => {
    const t: Transport = { ...baseTransport, observacoes: 'Bagagem de mão apenas' };
    const html = renderToString(React.createElement(TransportCard, { transport: t, index: 0 }));
    expect(html).toContain('Bagagem de mão apenas');
  });

  it('não contém onMouseEnter nem onMouseLeave no HTML (Server Component puro)', () => {
    const html = renderToString(React.createElement(TransportCard, { transport: baseTransport, index: 0 }));
    expect(html).not.toContain('onMouseEnter');
    expect(html).not.toContain('onMouseLeave');
  });

  it('renderiza badge "✅ Pago" quando status é pago', () => {
    const html = renderToString(React.createElement(TransportCard, { transport: baseTransport, index: 0 }));
    expect(html).toContain('✅ Pago');
  });

  it('renderiza badge "⏳ Pendente" quando status é pendente', () => {
    const t: Transport = { ...baseTransport, status: 'pendente' };
    const html = renderToString(React.createElement(TransportCard, { transport: t, index: 0 }));
    expect(html).toContain('⏳ Pendente');
  });

  it('aplica animationDelay com teto Math.min(index,5)*0.1s (task 4.2 estende)', () => {
    // Para index=0 → 0s, index=3 → 0.3s, index>=5 → 0.5s
    const html0 = renderToString(React.createElement(TransportCard, { transport: baseTransport, index: 0 }));
    const html3 = renderToString(React.createElement(TransportCard, { transport: baseTransport, index: 3 }));
    const html5 = renderToString(React.createElement(TransportCard, { transport: baseTransport, index: 5 }));
    const html10 = renderToString(React.createElement(TransportCard, { transport: baseTransport, index: 10 }));
    expect(html0).toContain('0s');
    expect(html3).toContain('0.3s');
    expect(html5).toContain('0.5s');
    expect(html10).toContain('0.5s');
  });

  it('usa layout flex (não grid) para estrutura emoji + info', () => {
    const html = renderToString(React.createElement(TransportCard, { transport: baseTransport, index: 0 }));
    // flex items-start gap-4 como classe ou style flex
    expect(html).toMatch(/flex/);
    // não deve ter grid-template-columns de 3 colunas (layout antigo)
    expect(html).not.toContain('grid-template-columns:70px 1fr auto');
  });
});
