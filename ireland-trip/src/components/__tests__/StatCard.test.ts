import { renderToString } from 'react-dom/server';
import React from 'react';
import { describe, it, expect } from 'vitest';
import StatCard from '../StatCard';

describe('StatCard', () => {
  it('renders value in output', () => {
    const html = renderToString(React.createElement(StatCard, { value: 18, label: 'dias' }));
    expect(html).toContain('18');
  });

  it('renders label in output', () => {
    const html = renderToString(React.createElement(StatCard, { value: 18, label: 'dias' }));
    expect(html).toContain('dias');
  });

  it('renders string value', () => {
    const html = renderToString(React.createElement(StatCard, { value: '42', label: 'noites' }));
    expect(html).toContain('42');
    expect(html).toContain('noites');
  });

  it('does not render icon when icon prop is absent', () => {
    const html = renderToString(React.createElement(StatCard, { value: 18, label: 'dias' }));
    expect(html).not.toContain('✈️');
    expect(html).not.toContain('🏠');
  });

  it('renders icon when icon prop is provided', () => {
    const html = renderToString(React.createElement(StatCard, { value: 18, label: 'dias', icon: '✈️' }));
    expect(html).toContain('✈️');
  });

  it('applies glass-card class to root element', () => {
    const html = renderToString(React.createElement(StatCard, { value: 18, label: 'dias' }));
    expect(html).toContain('glass-card');
  });
});
