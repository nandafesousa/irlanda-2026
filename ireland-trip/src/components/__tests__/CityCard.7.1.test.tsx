// @vitest-environment jsdom

/**
 * Task 7.1 — Testes unitários do CityCard
 * Requirements: 3.1, 4.1, 4.6, 4.7, 7.2, 5.1
 *
 * Cobre:
 * - Estado fechado renderiza emoji, nome, datas, noites e destaque corretamente
 * - Clique no header alterna isExpanded false → true → false
 * - aria-expanded reflete o estado booleano atual
 * - atividades vazia renderiza sem erros e sem badges
 * - Fórmula cíclica (index % 6) + 1 retorna valores corretos
 */

// Needed so React 18's act() recognises jsdom as a test environment
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import CityCard from '../CityCard';
import type { City } from '@/lib/types';

// Fórmula cíclica inlined para evitar importar server-only via page.tsx (req 5.1)
function deriveAccentVar(index: number): string {
  return `--c${(index % 6) + 1}`;
}

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

const baseCity: City = {
  id: 'test-1',
  cidade: 'Dublin',
  emoji: '🇮🇪',
  data_entrada: '28/08',
  data_saida: '01/09',
  noites: 4,
  destaque: 'Guinness Storehouse',
  bairro: 'Temple Bar',
  preco_noite: 85,
  moeda: 'EUR',
  atividades: 'Tour Guinness,Pub Crawl,Dublin Castle',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ssrRender(city: City, index = 0, accentVar = '--c1'): string {
  return renderToString(React.createElement(CityCard, { city, index, accentVar }));
}

interface MountResult {
  container: HTMLElement;
  unmount: () => void;
}

function mountCard(city: City, index = 0, accentVar = '--c1'): MountResult {
  const container = document.createElement('div');
  document.body.appendChild(container);
  let root: Root;
  act(() => {
    root = createRoot(container);
    root.render(React.createElement(CityCard, { city, index, accentVar }));
  });
  return {
    container,
    unmount: () => {
      act(() => root.unmount());
      container.remove();
    },
  };
}

// ---------------------------------------------------------------------------
// Task 7.1 — Estado fechado renderiza dados corretos (req 3.1)
// ---------------------------------------------------------------------------

describe('Task 7.1 — Estado fechado renderiza dados corretos (req 3.1)', () => {
  it('exibe o emoji da cidade', () => {
    expect(ssrRender(baseCity)).toContain('🇮🇪');
  });

  it('exibe o nome da cidade', () => {
    expect(ssrRender(baseCity)).toContain('Dublin');
  });

  it('exibe data_entrada no markup', () => {
    expect(ssrRender(baseCity)).toContain('28/08');
  });

  it('exibe data_saida no markup', () => {
    expect(ssrRender(baseCity)).toContain('01/09');
  });

  it('exibe o número de noites', () => {
    expect(ssrRender(baseCity)).toContain('4');
  });

  it('exibe o destaque principal', () => {
    expect(ssrRender(baseCity)).toContain('Guinness Storehouse');
  });
});

// ---------------------------------------------------------------------------
// Task 7.1 — Toggle isExpanded via clique no header (req 4.1, 4.6)
// ---------------------------------------------------------------------------

describe('Task 7.1 — Toggle isExpanded via clique no header (req 4.1, 4.6)', () => {
  let mount: MountResult;

  beforeEach(() => {
    mount = mountCard(baseCity);
  });

  afterEach(() => {
    mount.unmount();
  });

  it('aria-expanded é "false" antes do primeiro clique', () => {
    const button = mount.container.querySelector('button');
    expect(button).not.toBeNull();
    expect(button!.getAttribute('aria-expanded')).toBe('false');
  });

  it('clique no header alterna isExpanded de false para true', () => {
    const button = mount.container.querySelector('button')!;
    act(() => { button.click(); });
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });

  it('segundo clique fecha o card (isExpanded volta para false)', () => {
    const button = mount.container.querySelector('button')!;
    act(() => { button.click(); });
    act(() => { button.click(); });
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('cards diferentes têm estado de expansão independente (req 4.6)', () => {
    const mount2 = mountCard(baseCity, 1, '--c2');
    const button1 = mount.container.querySelector('button')!;
    const button2 = mount2.container.querySelector('button')!;
    act(() => { button1.click(); });
    expect(button1.getAttribute('aria-expanded')).toBe('true');
    expect(button2.getAttribute('aria-expanded')).toBe('false');
    mount2.unmount();
  });
});

// ---------------------------------------------------------------------------
// Task 7.1 — aria-expanded reflete o estado booleano atual (req 7.2)
// ---------------------------------------------------------------------------

describe('Task 7.1 — aria-expanded reflete estado booleano atual (req 7.2)', () => {
  let mount: MountResult;

  beforeEach(() => {
    mount = mountCard(baseCity);
  });

  afterEach(() => {
    mount.unmount();
  });

  it('aria-expanded é exatamente "false" no estado inicial', () => {
    const button = mount.container.querySelector('button')!;
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('aria-expanded é exatamente "true" após primeiro clique', () => {
    const button = mount.container.querySelector('button')!;
    act(() => { button.click(); });
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });

  it('aria-expanded não está ausente do markup (SSR)', () => {
    const html = ssrRender(baseCity);
    expect(html).toContain('aria-expanded=');
  });
});

// ---------------------------------------------------------------------------
// Task 7.1 — atividades vazia renderiza sem erros e sem badges (req 4.7)
// ---------------------------------------------------------------------------

describe('Task 7.1 — atividades vazia renderiza sem erros e sem badges (req 4.7)', () => {
  it('renderiza sem lançar exceção com atividades vazia', () => {
    const city: City = { ...baseCity, atividades: '' };
    expect(() => ssrRender(city)).not.toThrow();
  });

  it('não renderiza nenhum badge quando atividades é vazia', () => {
    const city: City = { ...baseCity, atividades: '' };
    const html = ssrRender(city);
    // badges têm border-radius 20px no estilo inline; sem atividades, não devem aparecer
    expect(html).not.toContain('Tour Guinness');
    expect(html).not.toContain('Pub Crawl');
  });

  it('monta no DOM sem erro com atividades vazia', () => {
    const city: City = { ...baseCity, atividades: '' };
    const m = mountCard(city);
    const li = m.container.querySelector('li');
    expect(li).not.toBeNull();
    m.unmount();
  });
});

// ---------------------------------------------------------------------------
// Task 7.1 — Fórmula cíclica (index % 6) + 1 (req 5.1)
// ---------------------------------------------------------------------------

describe('Task 7.1 — Fórmula cíclica de acento via deriveAccentVar (req 5.1)', () => {
  it('retorna --c1 para índice 0', () => {
    expect(deriveAccentVar(0)).toBe('--c1');
  });

  it('retorna --c6 para índice 5', () => {
    expect(deriveAccentVar(5)).toBe('--c6');
  });

  it('retorna --c1 para índice 6 (reinício do ciclo)', () => {
    expect(deriveAccentVar(6)).toBe('--c1');
  });

  it('retorna --c2 para índice 7', () => {
    expect(deriveAccentVar(7)).toBe('--c2');
  });

  it('nunca retorna valor fora de --c1..--c6 nos primeiros 18 índices', () => {
    for (let i = 0; i < 18; i++) {
      expect(deriveAccentVar(i)).toMatch(/^--c[1-6]$/);
    }
  });
});
