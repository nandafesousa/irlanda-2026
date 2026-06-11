import type { Metadata } from 'next';
import { getRoteiro } from '@/lib/sheets';
import CityCard from '@/components/CityCard';

export const metadata: Metadata = {
  title: 'Roteiro | Irlanda & UK 2026',
  description: 'Timeline completa da viagem — cidades, datas, destaques e atividades.',
};

export function deriveAccentVar(index: number): string {
  return `--c${(index % 6) + 1}`;
}

export default async function RoteiroPage(): Promise<React.JSX.Element> {
  const cities = await getRoteiro();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .roteiro-timeline {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem 3rem;
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .roteiro-timeline::before {
          content: '';
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 3px;
          height: 100%;
          background: linear-gradient(to bottom, var(--primary), var(--accent));
          border-radius: 2px;
          z-index: 0;
        }
        .roteiro-timeline > li:nth-child(odd) {
          grid-column: 1;
          justify-self: end;
        }
        .roteiro-timeline > li:nth-child(even) {
          grid-column: 2;
          justify-self: start;
        }
        @media (max-width: 768px) {
          .roteiro-timeline {
            grid-template-columns: 1fr;
          }
          .roteiro-timeline::before {
            left: 24px;
            transform: none;
          }
          .roteiro-timeline > li:nth-child(odd),
          .roteiro-timeline > li:nth-child(even) {
            grid-column: 1;
            justify-self: stretch;
          }
        }
      ` }} />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {/* Page header */}
        <div
          style={{
            textAlign: 'center',
            color: 'white',
            marginBottom: '3rem',
            animation: 'slideDown 0.6s ease-out both',
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(1.7rem, 4vw, 2.5rem)',
              fontWeight: 800,
              marginBottom: '0.5rem',
            }}
          >
            🗺️ Roteiro
          </h1>
          <p style={{ opacity: 0.85, fontSize: '0.95rem' }}>
            Ago–Set 2026 &nbsp;·&nbsp;{' '}
            <span
              style={{
                background: 'var(--glass)',
                border: '1px solid var(--glass-border)',
                borderRadius: '20px',
                padding: '0.15rem 0.75rem',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              {cities.length} cidade{cities.length !== 1 ? 's' : ''}
            </span>
          </p>
        </div>

        {/* Timeline */}
        <ol className="roteiro-timeline">
          {cities.map((city, index) => (
            <CityCard
              key={city.id}
              city={city}
              index={index}
              accentVar={deriveAccentVar(index)}
            />
          ))}
        </ol>
      </div>
    </>
  );
}
