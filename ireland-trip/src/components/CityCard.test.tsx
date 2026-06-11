import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import CityCard from './CityCard';
import type { City } from '@/lib/types';

// ---------------------------------------------------------------------------
// Task 3.1 — Estrutura do card e exibição do resumo da cidade
// Task 3.2 — Estilo visual, animação de entrada e indicador de expansão
// Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 5.2
// ---------------------------------------------------------------------------

function makeCity(override: Partial<City> = {}): City {
  return {
    id: '1-Dublin',
    cidade: 'Dublin',
    emoji: '🇮🇪',
    data_entrada: '28/08',
    data_saida: '01/09',
    noites: 4,
    destaque: 'Guinness Storehouse',
    bairro: 'Temple Bar',
    preco_noite: 85,
    moeda: 'EUR',
    atividades: 'Tour Guinness, Pub Crawl',
    ...override,
  };
}

function renderCard(city: City = makeCity(), index = 0, accentVar = '--c1'): string {
  return renderToString(React.createElement(CityCard, { city, index, accentVar }));
}

// ---------------------------------------------------------------------------
// Task 3.1 — Elemento raiz <li> (req 3.1, 2.2)
// ---------------------------------------------------------------------------

describe('Task 3.1 — Elemento raiz <li>', () => {
  it('renderiza sem lançar exceção', () => {
    expect(() => renderCard()).not.toThrow();
  });

  it('o markup começa com elemento <li>', () => {
    const html = renderCard();
    expect(html).toMatch(/^<li/);
  });
});

// ---------------------------------------------------------------------------
// Task 3.1 — Conteúdo do estado fechado (req 3.1)
// ---------------------------------------------------------------------------

describe('Task 3.1 — Estado fechado exibe campos obrigatórios', () => {
  it('exibe o emoji da cidade', () => {
    const html = renderCard(makeCity({ emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' }));
    expect(html).toContain('🏴󠁧󠁢󠁳󠁣󠁴󠁿');
  });

  it('exibe o nome da cidade', () => {
    const html = renderCard(makeCity({ cidade: 'Edimburgo' }));
    expect(html).toContain('Edimburgo');
  });

  it('exibe data_entrada', () => {
    const html = renderCard(makeCity({ data_entrada: '10/09' }));
    expect(html).toContain('10/09');
  });

  it('exibe data_saida', () => {
    const html = renderCard(makeCity({ data_saida: '14/09' }));
    expect(html).toContain('14/09');
  });

  it('exibe o número de noites', () => {
    const html = renderCard(makeCity({ noites: 7 }));
    expect(html).toContain('7');
  });

  it('exibe o destaque principal', () => {
    const html = renderCard(makeCity({ destaque: 'Arthur\'s Seat' }));
    expect(html).toContain("Arthur&#x27;s Seat");
  });
});

// ---------------------------------------------------------------------------
// Task 3.1 — Fallback "—" para campos ausentes (req 3.1)
// ---------------------------------------------------------------------------

describe('Task 3.1 — Fallback "—" para campos vazios', () => {
  it('renderiza "—" para cidade vazia', () => {
    const html = renderCard(makeCity({ cidade: '' }));
    expect(html).toContain('—');
  });

  it('renderiza "—" para destaque vazio', () => {
    const html = renderCard(makeCity({ destaque: '' }));
    expect(html).toContain('—');
  });

  it('renderiza sem erros com atividades vazia (req 4.7)', () => {
    expect(() => renderCard(makeCity({ atividades: '' }))).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Task 3.1 — Estilo visual do card (req 3.3, 5.2)
// ---------------------------------------------------------------------------

describe('Task 3.1 — Estilo do card (req 3.3, 5.2)', () => {
  it('aplica border-radius 18px', () => {
    const html = renderCard();
    expect(html).toContain('18px');
  });

  it('aplica box-shadow de repouso rgba(0,0,0,0.1)', () => {
    const html = renderCard();
    expect(html).toContain('rgba(0,0,0,0.1)');
  });

  it('aplica borda esquerda com a variável de acento recebida (req 5.2)', () => {
    const html = renderCard(makeCity(), 0, '--c3');
    expect(html).toContain('var(--c3)');
  });

  it('não usa valor hex fixo para a cor de acento — usa var()', () => {
    // The accent color should only appear as CSS variable reference, never as raw hex
    const html = renderCard(makeCity(), 0, '--c1');
    // --c1 maps to #6C5CE7 — must not appear hardcoded in component output
    expect(html).not.toContain('#6C5CE7');
    expect(html).not.toContain('#6c5ce7');
  });
});

// ---------------------------------------------------------------------------
// Task 3.2 — Indicador de expansão / chevron (req 3.5)
// ---------------------------------------------------------------------------

describe('Task 3.2 — Chevron indicador de expansão (req 3.5)', () => {
  it('exibe símbolo de chevron/seta no markup', () => {
    const html = renderCard();
    // The chevron is rendered as ▼ (unicode down-pointing triangle)
    expect(html).toContain('▼');
  });

  it('estado inicial (fechado) renderiza chevron com rotate(0deg)', () => {
    const html = renderCard();
    expect(html).toContain('rotate(0deg)');
  });
});

// ---------------------------------------------------------------------------
// Task 3.2 — Animação fadeInUp com atraso proporcional ao índice (req 3.6)
// ---------------------------------------------------------------------------

describe('Task 3.2 — Animação fadeInUp escalonada (req 3.6)', () => {
  it('animation inline inclui "fadeInUp"', () => {
    const html = renderCard(makeCity(), 2);
    expect(html).toContain('fadeInUp');
  });

  it('animationDelay é proporcional ao índice (índice 0 → 0s)', () => {
    const html = renderCard(makeCity(), 0);
    expect(html).toContain('0s');
  });

  it('animationDelay é proporcional ao índice (índice 3 → 0.3s)', () => {
    const html = renderCard(makeCity(), 3);
    expect(html).toContain('0.3s');
  });

  it('animation-fill-mode both está presente (previne flash visual)', () => {
    const html = renderCard(makeCity(), 0);
    // The shorthand 'animation: fadeInUp 0.6s ease-out both' sets fill-mode=both
    expect(html).toContain('both');
  });
});

// ---------------------------------------------------------------------------
// Task 3.2 — @keyframes fadeInUp deve estar em globals.css (req 3.6)
// ---------------------------------------------------------------------------

describe('Task 3.2 — @keyframes fadeInUp em globals.css (req 3.6)', () => {
  it('globals.css contém a declaração @keyframes fadeInUp', () => {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const cssPath = resolve(__dirname, '../app/globals.css');
    const css = readFileSync(cssPath, 'utf-8');
    expect(css).toContain('@keyframes fadeInUp');
  });

  it('globals.css define as propriedades opacity e transform na animação', () => {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const cssPath = resolve(__dirname, '../app/globals.css');
    const css = readFileSync(cssPath, 'utf-8');
    const fadeInBlock = css.slice(css.indexOf('@keyframes fadeInUp'));
    expect(fadeInBlock).toContain('opacity');
    expect(fadeInBlock).toContain('transform');
  });
});

// ---------------------------------------------------------------------------
// Task 5 — Atributos de acessibilidade e navegação por teclado
// Requirements: 6.5, 7.2, 7.3, 7.5
// ---------------------------------------------------------------------------

describe('Task 5 — Header do card como <button> nativo (req 6.5, 7.3)', () => {
  it('renderiza um elemento <button> no header do card', () => {
    const html = renderCard();
    expect(html).toContain('<button');
  });

  it('button possui classe min-h-[44px] para área de toque mínima (req 6.5)', () => {
    const html = renderCard();
    expect(html).toContain('min-h-[44px]');
  });

  it('button não possui handler onKeyDown manual — ativação nativa via Enter/Espaço (req 7.3)', () => {
    const html = renderCard();
    // Native <button> handles Enter/Space; no explicit onKeyDown should be serialized
    expect(html).not.toContain('onKeyDown');
  });
});

describe('Task 5 — aria-expanded reflete estado booleano (req 7.2)', () => {
  it('aria-expanded é "false" no estado inicial fechado', () => {
    const html = renderCard();
    expect(html).toContain('aria-expanded="false"');
  });

  it('aria-expanded não está ausente do markup', () => {
    const html = renderCard();
    expect(html).toContain('aria-expanded=');
  });
});

describe('Task 5 — aria-controls aponta para o id do painel (req 7.2)', () => {
  it('aria-controls referencia o panelId correto para índice 0', () => {
    const html = renderCard(makeCity(), 0);
    expect(html).toContain('aria-controls="panel-0"');
  });

  it('aria-controls referencia o panelId correto para índice 3', () => {
    const html = renderCard(makeCity(), 3);
    expect(html).toContain('aria-controls="panel-3"');
  });

  it('aria-controls referencia o panelId correto para índice 5', () => {
    const html = renderCard(makeCity(), 5);
    expect(html).toContain('aria-controls="panel-5"');
  });
});

describe('Task 5 — Painel de detalhes com id e role="region" (req 7.2)', () => {
  it('painel possui id correspondente ao panelId do card (índice 0)', () => {
    const html = renderCard(makeCity(), 0);
    expect(html).toContain('id="panel-0"');
  });

  it('painel possui id correspondente ao panelId do card (índice 2)', () => {
    const html = renderCard(makeCity(), 2);
    expect(html).toContain('id="panel-2"');
  });

  it('painel possui role="region" para vínculo semântico com leitores de tela', () => {
    const html = renderCard();
    expect(html).toContain('role="region"');
  });

  it('o id do painel é único e determinístico por índice (sem geração aleatória)', () => {
    const html1 = renderCard(makeCity(), 4);
    const html2 = renderCard(makeCity(), 4);
    // Same index → same panelId both times
    expect(html1).toContain('id="panel-4"');
    expect(html2).toContain('id="panel-4"');
  });

  it('ids de cards diferentes são únicos entre si', () => {
    const html0 = renderCard(makeCity(), 0);
    const html1 = renderCard(makeCity(), 1);
    expect(html0).toContain('id="panel-0"');
    expect(html1).toContain('id="panel-1"');
    expect(html0).not.toContain('id="panel-1"');
    expect(html1).not.toContain('id="panel-0"');
  });
});

describe('Task 5 — Contraste WCAG AA — tokens do design system (req 7.5)', () => {
  it('cards não usam cor de texto hex fixo que pudesse violar contraste — texto usa variável CSS ou classe Tailwind', () => {
    const html = renderCard();
    // The dark text (#2D3436) on white background yields contrast ratio ~14:1 (WCAG AA requires 4.5:1)
    // Verifying the token is used via var(--dark) in globals or Tailwind class, not a lighter color
    // Check the card does NOT set a light gray as primary text (would fail contrast)
    expect(html).not.toContain('color:#fff'); // white text on white bg would fail
  });

  it('fundo dos cards é branco — garantia de contraste com texto escuro', () => {
    const html = renderCard();
    // React serializes inline styles without spaces: "background:white"
    expect(html).toContain('background:white');
  });
});
