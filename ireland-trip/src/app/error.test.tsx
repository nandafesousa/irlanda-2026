import { renderToString } from 'react-dom/server';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import HomeError from './error';

const mockReset = vi.fn();
const mockError = new Error('Unexpected render failure') as Error & { digest?: string };

function render(error = mockError, reset = mockReset) {
  return renderToString(React.createElement(HomeError, { error, reset }));
}

describe('HomeError — Error Boundary raiz', () => {
  it('renderiza sem lançar exceção', () => {
    expect(() => render()).not.toThrow();
  });

  it('exibe mensagem amigável em português', () => {
    const html = render();
    expect(html.toLowerCase()).toMatch(/erro|problema|ocorreu/);
  });

  it('exibe botão "Tentar novamente"', () => {
    const html = render();
    expect(html).toContain('Tentar novamente');
  });

  it('NÃO exibe stack trace ou message do Error', () => {
    const html = render();
    expect(html).not.toContain('Unexpected render failure');
  });

  it('exibe error.digest quando disponível', () => {
    const errorWithDigest = Object.assign(new Error('err'), { digest: 'xyz789' });
    const html = render(errorWithDigest);
    expect(html).toContain('xyz789');
  });

  it('NÃO exibe digest quando ausente', () => {
    const html = render();
    expect(html).not.toContain('Ref:');
  });

  it('aplica estilo glassmorphism (var(--glass))', () => {
    const html = render();
    expect(html).toContain('var(--glass)');
  });

  it('botão está presente no markup', () => {
    const html = render();
    expect(html).toContain('<button');
  });
});
