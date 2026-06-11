// @vitest-environment jsdom
import React from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import CityCard from './CityCard';
import type { City } from '@/lib/types';

const mockCity: City = {
  id: '1',
  cidade: 'Dublin',
  emoji: '🇮🇪',
  data_entrada: '27/08',
  data_saida: '30/08',
  noites: 3,
  destaque: 'Whiskey tasting',
  bairro: 'Temple Bar',
  preco_noite: 120,
  moeda: 'EUR',
  atividades: 'Pub crawl, Guinness Storehouse',
};

// jsdom does not implement scrollIntoView — define it so spyOn works
if (!HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = () => {};
}

describe('CityCard — scroll-into-view ao expandir (Task 2 / Req 3.3)', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;
  let scrollIntoViewSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    scrollIntoViewSpy = vi
      .spyOn(HTMLElement.prototype, 'scrollIntoView')
      .mockImplementation(() => {});
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => { root.unmount(); });
    document.body.removeChild(container);
    vi.useRealTimers();
    scrollIntoViewSpy.mockRestore();
  });

  it('<li> raiz possui classe scroll-mt-4', () => {
    act(() => {
      root.render(<CityCard city={mockCity} index={0} accentVar="--c1" />);
    });
    const li = container.querySelector('li');
    expect(li?.className).toContain('scroll-mt-4');
  });

  it('chama scrollIntoView com {behavior:"smooth",block:"start"} após 150ms ao expandir', () => {
    act(() => {
      root.render(<CityCard city={mockCity} index={0} accentVar="--c1" />);
    });

    const button = container.querySelector('button')!;
    act(() => { button.click(); });

    expect(scrollIntoViewSpy).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(150); });

    expect(scrollIntoViewSpy).toHaveBeenCalledOnce();
    expect(scrollIntoViewSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('NÃO chama scrollIntoView ao colapsar o card', () => {
    act(() => {
      root.render(<CityCard city={mockCity} index={0} accentVar="--c1" />);
    });
    const button = container.querySelector('button')!;

    // expand
    act(() => { button.click(); });
    act(() => { vi.advanceTimersByTime(150); });
    scrollIntoViewSpy.mockClear();

    // collapse
    act(() => { button.click(); });
    act(() => { vi.advanceTimersByTime(150); });

    expect(scrollIntoViewSpy).not.toHaveBeenCalled();
  });
});
