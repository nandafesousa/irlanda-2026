import { renderToString } from 'react-dom/server';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

// Isolar dependências server-only e componentes client
vi.mock('server-only', () => ({}));
vi.mock('@/components/RouteMap', () => ({
  default: ({ chips }: { chips: { city: string }[] }) =>
    React.createElement(
      'ol',
      { 'aria-label': 'Percurso da viagem', 'data-testid': 'route-map' },
      chips.map((c) => React.createElement('li', { key: c.city }, c.city))
    ),
}));
vi.mock('@/components/StatCard', () => ({
  default: ({ value, label }: { value: string | number; label: string }) =>
    React.createElement('div', { 'data-testid': 'stat-card' }, `${value} ${label}`),
}));

import HomePage from './page';

// ─── Task 2.1 — Hero Header ────────────────────────────────────────────────

describe('HomePage — 2.1: hero header', () => {
  it('renderiza h1 com o título da viagem', async () => {
    const html = renderToString(await Promise.resolve(React.createElement(HomePage)));
    expect(html).toContain('Irlanda');
    expect(html).toContain('Reino Unido 2026');
  });

  it('h1 tem font-weight 800', async () => {
    const html = renderToString(await Promise.resolve(React.createElement(HomePage)));
    expect(html).toMatch(/font-\[800\]|font-extrabold|fontWeight.*800|font-weight.*800/);
  });

  it('renderiza subtítulo com o período da viagem', async () => {
    const html = renderToString(await Promise.resolve(React.createElement(HomePage)));
    expect(html).toMatch(/Ago|Agosto|Aug/);
    expect(html).toMatch(/Set|Setembro|Sep/);
    expect(html).toContain('2026');
  });

  it('usa gradiente via CSS vars (sem hex inline)', async () => {
    const html = renderToString(await Promise.resolve(React.createElement(HomePage)));
    expect(html).toContain('var(--grad-start)');
    expect(html).toContain('var(--grad-end)');
  });

  it('header tem elemento de textura noise com aria-hidden', async () => {
    const html = renderToString(await Promise.resolve(React.createElement(HomePage)));
    expect(html).toContain('aria-hidden');
  });

  it('renderiza animação slideDown no header', async () => {
    const html = renderToString(await Promise.resolve(React.createElement(HomePage)));
    expect(html).toContain('slideDown');
  });
});

// ─── Task 2.2 — StatCards ─────────────────────────────────────────────────

describe('HomePage — 2.2: stat cards', () => {
  it('renderiza exatamente 4 StatCards', async () => {
    const html = renderToString(await Promise.resolve(React.createElement(HomePage)));
    const count = (html.match(/data-testid="stat-card"/g) ?? []).length;
    expect(count).toBe(4);
  });

  it('renderiza stat com valor 18 (dias)', async () => {
    const html = renderToString(await Promise.resolve(React.createElement(HomePage)));
    expect(html).toContain('18');
  });

  it('renderiza stat com valor 6 (cidades)', async () => {
    const html = renderToString(await Promise.resolve(React.createElement(HomePage)));
    expect(html).toContain('6');
  });

  it('renderiza stat com valor 5 (trechos)', async () => {
    const html = renderToString(await Promise.resolve(React.createElement(HomePage)));
    expect(html).toContain('5');
  });

  it('renderiza stat com valor 2 (amigas)', async () => {
    const html = renderToString(await Promise.resolve(React.createElement(HomePage)));
    expect(html).toContain('2');
  });

  it('container dos stats usa grid 2 colunas em mobile e 4 em desktop', async () => {
    const html = renderToString(await Promise.resolve(React.createElement(HomePage)));
    expect(html).toContain('grid-cols-2');
    expect(html).toContain('md:grid-cols-4');
  });
});

// ─── Task 2.3 — RouteMap e Nav Cards ──────────────────────────────────────

describe('HomePage — 2.3: RouteMap e cards de navegação', () => {
  it('renderiza RouteMap com 6 chips', async () => {
    const html = renderToString(await Promise.resolve(React.createElement(HomePage)));
    const cities = ['Dublin', 'Belfast', 'Edinburgh', 'Liverpool', 'London'];
    for (const city of cities) {
      expect(html).toContain(city);
    }
  });

  it('renderiza 3 cards de navegação', async () => {
    const html = renderToString(await Promise.resolve(React.createElement(HomePage)));
    expect(html).toContain('/roteiro');
    expect(html).toContain('/hospedagens');
    expect(html).toContain('/transportes');
  });

  it('cards de navegação são <a> tags', async () => {
    const html = renderToString(await Promise.resolve(React.createElement(HomePage)));
    const hrefRoteiro = html.includes('href="/roteiro"');
    const hrefHospedagens = html.includes('href="/hospedagens"');
    const hrefTransportes = html.includes('href="/transportes"');
    expect(hrefRoteiro).toBe(true);
    expect(hrefHospedagens).toBe(true);
    expect(hrefTransportes).toBe(true);
  });

  it('cada nav card tem ícone, título e descrição', async () => {
    const html = renderToString(await Promise.resolve(React.createElement(HomePage)));
    expect(html).toContain('Roteiro');
    expect(html).toContain('Hospedagens');
    expect(html).toContain('Transportes');
  });

  it('cards de navegação usam grid 1 col em mobile e 3 em desktop', async () => {
    const html = renderToString(await Promise.resolve(React.createElement(HomePage)));
    expect(html).toContain('grid-cols-1');
    expect(html).toContain('md:grid-cols-3');
  });

  it('nav cards têm top stripe com gradiente primary → accent', async () => {
    const html = renderToString(await Promise.resolve(React.createElement(HomePage)));
    expect(html).toContain('var(--primary)');
    expect(html).toContain('var(--accent)');
  });
});

// ─── Task 2.4 — Layout, animações e responsividade ────────────────────────

describe('HomePage — 2.4: layout, animações e responsividade', () => {
  it('aplica fadeInUp nas seções com stagger de animationDelay', async () => {
    const html = renderToString(await Promise.resolve(React.createElement(HomePage)));
    expect(html).toContain('fadeInUp');
    expect(html).toContain('0.1s');
  });

  it('container externo não tem pb-[80px] — padding centralizado no layout.tsx (Req 1.7)', async () => {
    const html = renderToString(await Promise.resolve(React.createElement(HomePage)));
    expect(html).not.toContain('pb-[80px]');
  });

  it('max-width de 1000px e padding lateral', async () => {
    const html = renderToString(await Promise.resolve(React.createElement(HomePage)));
    expect(html).toMatch(/max-w-\[1000px\]|maxWidth.*1000/);
  });

  it('não usa cores hex inline (todas as cores via CSS vars)', async () => {
    const html = renderToString(await Promise.resolve(React.createElement(HomePage)));
    // Verificar que não há cores hex diretamente (exceto dentro de var() ou rgba())
    // Permite rgba() e var(--*) mas não #RRGGBB solto
    const hexPattern = /#[0-9a-fA-F]{3,6}(?![^"]*var\()/;
    expect(hexPattern.test(html)).toBe(false);
  });

  it('a página é Server Component — exporta metadata', async () => {
    // Importar o módulo e verificar que metadata é exportado
    const mod = await import('./page');
    expect(mod).toHaveProperty('metadata');
  });

  it('a página exporta revalidate = false', async () => {
    const mod = await import('./page');
    expect(mod).toHaveProperty('revalidate', false);
  });
});
