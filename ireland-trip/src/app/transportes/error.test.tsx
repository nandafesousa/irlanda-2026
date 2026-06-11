import { renderToString } from 'react-dom/server';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import TransportesError from './error';

const mockReset = vi.fn();
const mockError = new Error('Google Sheets unavailable') as Error & { digest?: string };

function render(error = mockError, reset = mockReset) {
  return renderToString(React.createElement(TransportesError, { error, reset }));
}

describe('TransportesError — Error Boundary', () => {
  it('renderiza sem lançar exceção', () => {
    expect(() => render()).not.toThrow();
  });

  it('exibe mensagem amigável sobre transportes em português', () => {
    const html = render();
    expect(html).toContain('transportes');
  });

  it('exibe botão "Tentar novamente"', () => {
    const html = render();
    expect(html).toContain('Tentar novamente');
  });

  it('NÃO exibe stack trace ou message do Error', () => {
    const html = render();
    expect(html).not.toContain('Google Sheets unavailable');
  });

  it('exibe error.digest quando disponível', () => {
    const errorWithDigest = Object.assign(new Error('err'), { digest: 'abc123' });
    const html = render(errorWithDigest);
    expect(html).toContain('abc123');
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
