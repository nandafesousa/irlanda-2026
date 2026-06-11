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

describe('TransportCard — identidade visual (Task 4.2)', () => {
  it('aplica top stripe com gradiente var(--primary) → var(--accent)', () => {
    const html = renderToString(React.createElement(TransportCard, { transport: baseTransport, index: 0 }));
    expect(html).toContain('linear-gradient(90deg, var(--primary), var(--accent))');
  });

  it('card raiz tem rounded-[18px] e bg-white/80 backdrop-blur-md', () => {
    const html = renderToString(React.createElement(TransportCard, { transport: baseTransport, index: 0 }));
    expect(html).toContain('rounded-[18px]');
    expect(html).toContain('bg-white/80');
    expect(html).toContain('backdrop-blur-md');
  });

  it('card raiz tem shadow-[0_8px_32px_rgba(0,0,0,0.1)]', () => {
    const html = renderToString(React.createElement(TransportCard, { transport: baseTransport, index: 0 }));
    expect(html).toContain('shadow-[0_8px_32px_rgba(0,0,0,0.1)]');
  });

  it('card raiz tem hover:translate-x-1 e transition-all duration-300', () => {
    const html = renderToString(React.createElement(TransportCard, { transport: baseTransport, index: 0 }));
    expect(html).toContain('hover:translate-x-1');
    expect(html).toContain('transition-all');
    expect(html).toContain('duration-300');
  });

  it('badge "✅ Pago" tem background rgba(108,92,231,0.1) e color var(--primary)', () => {
    const html = renderToString(React.createElement(TransportCard, { transport: baseTransport, index: 0 }));
    expect(html).toContain('rgba(108,92,231,0.1)');
    expect(html).toContain('var(--primary)');
    expect(html).toContain('rgba(108,92,231,0.25)');
    expect(html).toContain('✅ Pago');
  });

  it('badge "⏳ Pendente" tem background rgba(253,203,110,0.15) e color #c07900', () => {
    const t: Transport = { ...baseTransport, status: 'pendente' };
    const html = renderToString(React.createElement(TransportCard, { transport: t, index: 0 }));
    expect(html).toContain('rgba(253,203,110,0.15)');
    expect(html).toContain('#c07900');
    expect(html).toContain('rgba(253,203,110,0.5)');
    expect(html).toContain('⏳ Pendente');
  });

  it('ambos os badges têm border-radius: 20px, font-size: 0.78rem, font-weight: 600', () => {
    const htmlPago = renderToString(React.createElement(TransportCard, { transport: baseTransport, index: 0 }));
    expect(htmlPago).toContain('20px');
    expect(htmlPago).toContain('0.78rem');
    expect(htmlPago).toContain('600');

    const t: Transport = { ...baseTransport, status: 'pendente' };
    const htmlPendente = renderToString(React.createElement(TransportCard, { transport: t, index: 0 }));
    expect(htmlPendente).toContain('20px');
    expect(htmlPendente).toContain('0.78rem');
    expect(htmlPendente).toContain('600');
  });

  it('animationDelay com teto: index=0 → 0.0s, index=3 → 0.3s, index=5 → 0.5s, index=10 → 0.5s', () => {
    const html0 = renderToString(React.createElement(TransportCard, { transport: baseTransport, index: 0 }));
    const html3 = renderToString(React.createElement(TransportCard, { transport: baseTransport, index: 3 }));
    const html5 = renderToString(React.createElement(TransportCard, { transport: baseTransport, index: 5 }));
    const html10 = renderToString(React.createElement(TransportCard, { transport: baseTransport, index: 10 }));

    // renderToString serializa camelCase para kebab-case: animationDelay → animation-delay
    expect(html0).toContain('animation-delay:0.0s');
    expect(html3).toContain('animation-delay:0.3s');
    expect(html5).toContain('animation-delay:0.5s');
    expect(html10).toContain('animation-delay:0.5s');
  });

  it('animation fadeInUp 0.6s ease-out both aplicado via style inline', () => {
    const html = renderToString(React.createElement(TransportCard, { transport: baseTransport, index: 0 }));
    expect(html).toContain('fadeInUp 0.6s ease-out both');
  });

  it('card raiz tem hover:shadow-[0_18px_52px_rgba(0,0,0,0.14)]', () => {
    const html = renderToString(React.createElement(TransportCard, { transport: baseTransport, index: 0 }));
    expect(html).toContain('hover:shadow-[0_18px_52px_rgba(0,0,0,0.14)]');
  });

  it('top stripe tem h-1 e absolute top-0 inset-x-0', () => {
    const html = renderToString(React.createElement(TransportCard, { transport: baseTransport, index: 0 }));
    expect(html).toContain('h-1');
    expect(html).toContain('absolute');
    expect(html).toContain('top-0');
    expect(html).toContain('inset-x-0');
  });
});
