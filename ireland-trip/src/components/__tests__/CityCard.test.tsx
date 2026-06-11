import { renderToString } from 'react-dom/server';
import React from 'react';
import { describe, it, expect } from 'vitest';
import CityCard from '../CityCard';
import type { City } from '@/lib/types';

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

const baseCity: City = {
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
  atividades: 'Tour Guinness,Pub Crawl,Dublin Castle',
};

function render(city: City, index = 0, accentVar = '--c1') {
  return renderToString(
    React.createElement(CityCard, { city, index, accentVar }),
  );
}

// ---------------------------------------------------------------------------
// Task 4 — Estado fechado (estado inicial SSR)
// ---------------------------------------------------------------------------

describe('CityCard — estado fechado (SSR)', () => {
  it('renderiza emoji da cidade', () => {
    expect(render(baseCity)).toContain('🇮🇪');
  });

  it('renderiza o nome da cidade', () => {
    expect(render(baseCity)).toContain('Dublin');
  });

  it('renderiza data de entrada e saída', () => {
    const html = render(baseCity);
    expect(html).toContain('28/08');
    expect(html).toContain('01/09');
  });

  it('renderiza número de noites', () => {
    expect(render(baseCity)).toContain('4');
  });

  it('renderiza destaque principal', () => {
    expect(render(baseCity)).toContain('Guinness Storehouse');
  });

  it('renderiza fallback "—" para nome vazio', () => {
    const city: City = { ...baseCity, cidade: '' };
    expect(render(city)).toContain('—');
  });

  it('renderiza fallback "—" para destaque vazio', () => {
    const city: City = { ...baseCity, destaque: '' };
    expect(render(city)).toContain('—');
  });

  it('elemento raiz é <li> para compatibilidade com nth-child do container', () => {
    const html = render(baseCity);
    expect(html.trimStart()).toMatch(/^<li/);
  });

  it('aplica borda esquerda via variável CSS de acento recebida como prop', () => {
    const html = render(baseCity, 0, '--c3');
    expect(html).toContain('var(--c3)');
    expect(html).not.toContain('var(--c1)');
  });

  it('aplica animationDelay proporcional ao index', () => {
    const html = render(baseCity, 3, '--c4');
    expect(html).toContain('0.3s');
  });

  it('index 0 aplica animationDelay 0s', () => {
    const html = render(baseCity, 0, '--c1');
    expect(html).toContain('0s');
  });

  it('exibe chevron indicativo de expansão', () => {
    const html = render(baseCity);
    // deve conter algum símbolo de chevron ou ícone de seta
    expect(html.toLowerCase()).toMatch(/▼|chevron|›|▾|⌄/);
  });
});

// ---------------------------------------------------------------------------
// Task 4 — Detalhes (visíveis apenas quando expandido — não aparecem em SSR)
// ---------------------------------------------------------------------------

describe('CityCard — seção de detalhes (não visível em SSR)', () => {
  it('não exibe bairro no estado inicial SSR', () => {
    const html = render(baseCity);
    // o bairro está no estado expandido; no SSR o grid-rows é 0fr → conteúdo presente no DOM mas colapsado
    // verificamos que o wrapper de expansão existe mas com grid-rows-[0fr]
    expect(html).toContain('grid-rows-[0fr]');
    expect(html).not.toContain('grid-rows-[1fr]');
  });

  it('contém o bairro no markup (presente no DOM para SEO, oculto via CSS)', () => {
    const html = render(baseCity);
    expect(html).toContain('Temple Bar');
  });

  it('contém preço por noite no markup', () => {
    const html = render(baseCity);
    expect(html).toContain('85');
  });
});

// ---------------------------------------------------------------------------
// Task 4 — Badges de atividades
// ---------------------------------------------------------------------------

describe('CityCard — badges de atividades', () => {
  it('renderiza cada atividade como badge individual', () => {
    const html = render(baseCity);
    expect(html).toContain('Tour Guinness');
    expect(html).toContain('Pub Crawl');
    expect(html).toContain('Dublin Castle');
  });

  it('lista vazia de atividades renderiza sem erros', () => {
    const city: City = { ...baseCity, atividades: '' };
    expect(() => render(city)).not.toThrow();
  });

  it('atividades com espaços em volta são trimadas', () => {
    const city: City = { ...baseCity, atividades: ' Fado , Pastéis de Belém ' };
    const html = render(city);
    expect(html).toContain('Fado');
    expect(html).toContain('Pastéis de Belém');
  });
});

// ---------------------------------------------------------------------------
// Task 4 — Highlight bar
// ---------------------------------------------------------------------------

describe('CityCard — highlight bar', () => {
  it('aplica gradiente com a variável de acento recebida como prop', () => {
    const html = render(baseCity, 0, '--c1');
    expect(html).toContain('var(--c1)');
  });

  it('gradiente usa cor adjacente cíclica (index 5 → --c6 e --c1)', () => {
    const html = render(baseCity, 5, '--c6');
    expect(html).toContain('var(--c6)');
    expect(html).toContain('var(--c1)');
  });

  it('gradiente usa cor adjacente cíclica (index 0 → --c1 e --c2)', () => {
    const html = render(baseCity, 0, '--c1');
    expect(html).toContain('var(--c1)');
    expect(html).toContain('var(--c2)');
  });
});

// ---------------------------------------------------------------------------
// Task 4 — Acessibilidade
// ---------------------------------------------------------------------------

describe('CityCard — acessibilidade', () => {
  it('botão header tem aria-expanded="false" no estado inicial', () => {
    const html = render(baseCity);
    expect(html).toContain('aria-expanded="false"');
  });

  it('botão header tem aria-controls apontando para o painel', () => {
    const html = render(baseCity, 2);
    expect(html).toContain('aria-controls="panel-2"');
    expect(html).toContain('id="panel-2"');
  });

  it('painel tem role="region"', () => {
    const html = render(baseCity);
    expect(html).toContain('role="region"');
  });

  it('botão header tem min-height de 44px', () => {
    const html = render(baseCity);
    expect(html).toMatch(/min-h-\[44px\]|minHeight.*44px|min-height.*44/);
  });
});

// ---------------------------------------------------------------------------
// Task 7.1 — Fórmula cíclica (testada isoladamente)
// ---------------------------------------------------------------------------

describe('Fórmula cíclica de acento (req 5.1)', () => {
  function accentVar(index: number) {
    return `--c${(index % 6) + 1}`;
  }

  it('retorna --c1 para índice 0', () => {
    expect(accentVar(0)).toBe('--c1');
  });

  it('retorna --c6 para índice 5', () => {
    expect(accentVar(5)).toBe('--c6');
  });

  it('retorna --c1 para índice 6 (ciclo completo)', () => {
    expect(accentVar(6)).toBe('--c1');
  });

  it('nunca retorna valor fora de --c1..--c6 nos primeiros 12 índices', () => {
    for (let i = 0; i < 12; i++) {
      expect(accentVar(i)).toMatch(/^--c[1-6]$/);
    }
  });
});
