'use client';

import { useState, useRef, useEffect } from 'react';
import type { City } from '@/lib/types';

interface CityCardProps {
  readonly city: City;
  readonly index: number;
  readonly accentVar: string; // ex.: "--c1", "--c2" ... "--c6"
}

export default function CityCard({ city, index, accentVar }: CityCardProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const cardRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!isExpanded) return;
    const timer = setTimeout(() => {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
    return () => clearTimeout(timer);
  }, [isExpanded]);

  const panelId = `panel-${index}`;

  // Adjacent color in the 6-slot cycle for the highlight bar gradient
  const adjNum = ((index + 1) % 6) + 1;
  const adjVar = `--c${adjNum}`;
  const highlightGradient = `linear-gradient(90deg, var(${accentVar}), var(${adjVar}))`;

  const animationStyle: React.CSSProperties = {
    animation: 'fadeInUp 0.6s ease-out both',
    animationDelay: `${index * 0.1}s`,
  };

  const activities: string[] = city.atividades
    ? city.atividades.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <li ref={cardRef} className="scroll-mt-4" style={{ listStyle: 'none', marginBottom: '2.5rem', ...animationStyle }}>
      <div
        style={{
          background: 'white',
          borderRadius: '18px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderLeft: `4px solid var(${accentVar})`,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 18px 52px rgba(0,0,0,0.14)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = '';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
        }}
      >
        {/* Card header — native button for keyboard + a11y */}
        <button
          className="min-h-[44px]"
          aria-expanded={isExpanded}
          aria-controls={panelId}
          onClick={() => setIsExpanded(prev => !prev)}
          style={{
            width: '100%',
            padding: '1.75rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.2rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '2.5rem', lineHeight: 1, flexShrink: 0 }}>{city.emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2
                style={{
                  fontSize: '1.55rem',
                  color: `var(${accentVar})`,
                  fontWeight: 800,
                  margin: '0 0 0.2rem',
                }}
              >
                {city.cidade || '—'}
              </h2>
              <div style={{ fontSize: '0.88rem', color: '#636E72', fontWeight: 500 }}>
                {city.data_entrada} – {city.data_saida}&nbsp;·&nbsp;
                {city.noites} noite{city.noites !== 1 ? 's' : ''}
              </div>
            </div>
            <span
              style={{
                display: 'inline-block',
                transition: 'transform 0.3s',
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                color: '#b2bec3',
                fontSize: '0.9rem',
                flexShrink: 0,
                marginTop: '0.25rem',
              }}
            >
              ▼
            </span>
          </div>

          {/* Highlight bar */}
          <div
            style={{
              background: highlightGradient,
              color: 'white',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.88rem',
            }}
          >
            {city.destaque || '—'}
          </div>
        </button>

        {/* Expandable details — CSS Grid row expansion (no max-height ghost delay) */}
        <div
          id={panelId}
          role="region"
          className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
            isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <div style={{ padding: '0 1.75rem 1.75rem' }}>
              <div
                style={{
                  height: '2px',
                  background: '#F0F0F0',
                  borderRadius: '2px',
                  marginBottom: '1.25rem',
                }}
              />

              {/* Bairro */}
              {city.bairro && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      color: `var(${accentVar})`,
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    📍 Bairro
                  </div>
                  <div
                    style={{
                      background: 'var(--light)',
                      padding: '0.9rem 1rem',
                      borderRadius: '10px',
                      borderLeft: `3px solid var(${accentVar})`,
                      lineHeight: 1.75,
                      fontSize: '0.9rem',
                      color: '#444',
                    }}
                  >
                    {city.bairro}
                  </div>
                </div>
              )}

              {/* Preço por noite */}
              {city.preco_noite > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      color: `var(${accentVar})`,
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    💰 Preço médio
                  </div>
                  <div
                    style={{
                      background: 'var(--light)',
                      padding: '0.9rem 1rem',
                      borderRadius: '10px',
                      borderLeft: `3px solid var(${accentVar})`,
                      fontSize: '0.9rem',
                      color: '#444',
                    }}
                  >
                    {city.moeda} {city.preco_noite}/noite
                  </div>
                </div>
              )}

              {/* Atividades */}
              {activities.length > 0 && (
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      color: `var(${accentVar})`,
                      marginBottom: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    ⭐ Atividades
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {activities.map(activity => (
                      <span
                        key={activity}
                        style={{
                          background: 'rgba(108,92,231,0.1)',
                          color: 'var(--primary)',
                          border: '1px solid rgba(108,92,231,0.25)',
                          borderRadius: '20px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          padding: '0.25rem 0.75rem',
                        }}
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
