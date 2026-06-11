import { renderToString } from 'react-dom/server';
import React from 'react';
import { describe, it, expect } from 'vitest';
import RouteMap, { type RouteChip } from '../RouteMap';

const SIX_CHIPS: readonly RouteChip[] = [
  { city: 'Dublin',    emoji: '🇮🇪', date: '27/08', accentVar: '--c1' },
  { city: 'Belfast',   emoji: '🇬🇧', date: '30/08', accentVar: '--c2' },
  { city: 'Edinburgh', emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', date: '01/09', accentVar: '--c3' },
  { city: 'Liverpool', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', date: '04/09', accentVar: '--c4' },
  { city: 'London',    emoji: '🇬🇧', date: '07/09', accentVar: '--c5' },
  { city: 'Dublin',    emoji: '🇮🇪', date: '11/09', accentVar: '--c6' },
];

const ONE_CHIP: readonly RouteChip[] = [
  { city: 'Dublin', emoji: '🇮🇪', date: '27/08', accentVar: '--c1' },
];

describe('RouteMap — 1.1: estrutura semântica e lista de chips', () => {
  it('renderiza <ol> com aria-label="Percurso da viagem"', () => {
    const html = renderToString(React.createElement(RouteMap, { chips: SIX_CHIPS }));
    expect(html).toContain('aria-label="Percurso da viagem"');
  });

  it('renderiza exatamente 6 chips quando chips.length === 6', () => {
    const html = renderToString(React.createElement(RouteMap, { chips: SIX_CHIPS }));
    const count = (html.match(/route-chip/g) ?? []).length;
    expect(count).toBe(6);
  });

  it('renderiza exatamente 5 separadores quando chips.length === 6', () => {
    const html = renderToString(React.createElement(RouteMap, { chips: SIX_CHIPS }));
    const count = (html.match(/aria-hidden="true"/g) ?? []).length;
    expect(count).toBe(5);
  });

  it('não renderiza separador quando chips.length === 1', () => {
    const html = renderToString(React.createElement(RouteMap, { chips: ONE_CHIP }));
    expect(html).not.toContain('aria-hidden');
  });

  it('cada chip contém nome da cidade, emoji e data', () => {
    const html = renderToString(React.createElement(RouteMap, { chips: SIX_CHIPS }));
    expect(html).toContain('Dublin');
    expect(html).toContain('Belfast');
    expect(html).toContain('Edinburgh');
    expect(html).toContain('Liverpool');
    expect(html).toContain('London');
    expect(html).toContain('27/08');
    expect(html).toContain('30/08');
    expect(html).toContain('11/09');
  });

  it('cada chip tem a classe route-chip', () => {
    const html = renderToString(React.createElement(RouteMap, { chips: ONE_CHIP }));
    expect(html).toContain('route-chip');
  });

  it('separadores têm aria-hidden="true"', () => {
    const html = renderToString(React.createElement(RouteMap, { chips: SIX_CHIPS }));
    const count = (html.match(/aria-hidden="true"/g) ?? []).length;
    expect(count).toBeGreaterThan(0);
  });

  it('container tem overflow-x-auto para scroll horizontal em mobile', () => {
    const html = renderToString(React.createElement(RouteMap, { chips: SIX_CHIPS }));
    expect(html).toContain('overflow-x-auto');
  });

  it('aplica cor de acento via variável CSS na borda de cada chip', () => {
    const html = renderToString(React.createElement(RouteMap, { chips: ONE_CHIP }));
    expect(html).toContain('var(--c1)');
  });

  it('não renderiza separador após o último chip', () => {
    const html = renderToString(React.createElement(RouteMap, { chips: SIX_CHIPS }));
    const separatorCount = (html.match(/aria-hidden="true"/g) ?? []).length;
    expect(separatorCount).toBe(SIX_CHIPS.length - 1);
  });
});
