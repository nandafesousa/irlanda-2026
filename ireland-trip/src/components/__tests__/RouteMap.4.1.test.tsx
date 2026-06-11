// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import RouteMap, { type RouteChip } from '../RouteMap';

const SIX_CHIPS: readonly RouteChip[] = [
  { city: 'Dublin',    emoji: '🇮🇪', date: '27/08', accentVar: '--c1' },
  { city: 'Belfast',   emoji: '🇬🇧', date: '30/08', accentVar: '--c2' },
  { city: 'Edinburgh', emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', date: '01/09', accentVar: '--c3' },
  { city: 'Liverpool', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', date: '04/09', accentVar: '--c4' },
  { city: 'London',    emoji: '🇬🇧', date: '07/09', accentVar: '--c5' },
  { city: 'Dublin',    emoji: '🇮🇪', date: '11/09', accentVar: '--c6' },
];

// Helper para cast tipado de window sem erro TS
const win = (): Record<string, unknown> => window as unknown as Record<string, unknown>;

// Helper para criar um IntersectionObserverEntry parcial para testes
function makeEntry(target: Element, isIntersecting: boolean): IntersectionObserverEntry {
  return { isIntersecting, target } as unknown as IntersectionObserverEntry;
}

// ─── Req 3.6 / 5.4: Fallback sem IntersectionObserver ────────────────────────

describe('RouteMap — 4.1: IO fallback (cliente, jsdom)', () => {
  let container: HTMLDivElement;
  let root!: ReturnType<typeof createRoot>;
  let originalIO: unknown;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    originalIO = win().IntersectionObserver;
    // jsdom não implementa IO — garantir ausência explícita
    delete win().IntersectionObserver;
  });

  afterEach(() => {
    act(() => { root.unmount(); });
    document.body.removeChild(container);
    if (originalIO !== undefined) {
      win().IntersectionObserver = originalIO;
    }
  });

  it('aplica is-visible a todos os chips imediatamente quando IntersectionObserver não está disponível', async () => {
    await act(async () => {
      root = createRoot(container);
      root.render(React.createElement(RouteMap, { chips: SIX_CHIPS }));
    });

    const chips = container.querySelectorAll('.route-chip');
    expect(chips.length).toBe(6);
    chips.forEach((chip) => {
      expect(chip.classList.contains('is-visible')).toBe(true);
    });
  });
});

// ─── Req 3.6: IO behavior — mock construtor de classe ────────────────────────

describe('RouteMap — 4.1: IO behavior (cliente, jsdom)', () => {
  let container: HTMLDivElement;
  let root!: ReturnType<typeof createRoot>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    act(() => { root.unmount(); });
    document.body.removeChild(container);
    delete win().IntersectionObserver;
    vi.restoreAllMocks();
  });

  it('adiciona is-visible ao chip correto quando observer dispara isIntersecting: true', async () => {
    let capturedCallback: IntersectionObserverCallback | undefined;
    const mockUnobserve = vi.fn();
    const mockObserve = vi.fn();
    const mockDisconnect = vi.fn();

    class MockIO {
      constructor(cb: IntersectionObserverCallback) { capturedCallback = cb; }
      observe = mockObserve;
      unobserve = mockUnobserve;
      disconnect = mockDisconnect;
    }
    win().IntersectionObserver = MockIO;

    await act(async () => {
      root = createRoot(container);
      root.render(React.createElement(RouteMap, { chips: SIX_CHIPS }));
    });

    const chips = container.querySelectorAll<HTMLElement>('.route-chip');
    expect(chips.length).toBe(6);
    expect(chips[0].classList.contains('is-visible')).toBe(false);

    const firstChip = chips[0];
    await act(async () => {
      capturedCallback!(
        [makeEntry(firstChip, true)],
        {} as IntersectionObserver
      );
    });

    expect(firstChip.classList.contains('is-visible')).toBe(true);
    expect(mockUnobserve).toHaveBeenCalledWith(firstChip);
    expect(chips[1].classList.contains('is-visible')).toBe(false);
  });

  it('não adiciona is-visible quando isIntersecting é false', async () => {
    let capturedCallback: IntersectionObserverCallback | undefined;

    class MockIO {
      constructor(cb: IntersectionObserverCallback) { capturedCallback = cb; }
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    win().IntersectionObserver = MockIO;

    await act(async () => {
      root = createRoot(container);
      root.render(React.createElement(RouteMap, { chips: SIX_CHIPS }));
    });

    const chips = container.querySelectorAll<HTMLElement>('.route-chip');
    const firstChip = chips[0];

    await act(async () => {
      capturedCallback!(
        [makeEntry(firstChip, false)],
        {} as IntersectionObserver
      );
    });

    expect(firstChip.classList.contains('is-visible')).toBe(false);
  });

  it('unobserve é chamado exatamente uma vez por chip quando IO dispara', async () => {
    let capturedCallback: IntersectionObserverCallback | undefined;
    const mockUnobserve = vi.fn();

    class MockIO {
      constructor(cb: IntersectionObserverCallback) { capturedCallback = cb; }
      observe = vi.fn();
      unobserve = mockUnobserve;
      disconnect = vi.fn();
    }
    win().IntersectionObserver = MockIO;

    await act(async () => {
      root = createRoot(container);
      root.render(React.createElement(RouteMap, { chips: SIX_CHIPS }));
    });

    const chips = container.querySelectorAll<HTMLElement>('.route-chip');

    await act(async () => {
      capturedCallback!(
        [makeEntry(chips[0], true), makeEntry(chips[1], true)],
        {} as IntersectionObserver
      );
    });

    expect(chips[0].classList.contains('is-visible')).toBe(true);
    expect(chips[1].classList.contains('is-visible')).toBe(true);
    expect(mockUnobserve).toHaveBeenCalledTimes(2);
    expect(mockUnobserve).toHaveBeenCalledWith(chips[0]);
    expect(mockUnobserve).toHaveBeenCalledWith(chips[1]);
  });
});
