import type { Metadata } from 'next';
import { getHospedagens } from '@/lib/sheets';
import { calculateHospedagensTotals } from '@/lib/finance';
import HotelCard from '@/components/HotelCard';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Hospedagens | Irlanda & UK 2026',
  description: 'Hotéis confirmados e pendentes por cidade.',
};

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);

export default async function HospedagensPage(): Promise<React.JSX.Element> {
  const hotels = await getHospedagens();

  const totalNights = hotels.reduce((sum, h) => sum + h.noites, 0);
  const confirmedCount = hotels.filter(h => h.status === 'confirmado').length;
  const totalsByMoeda = calculateHospedagensTotals(hotels);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideDown { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
      ` }} />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {/* Page header */}
        <div style={{ textAlign: 'center', color: 'white', marginBottom: '3rem', animation: 'slideDown 0.6s ease-out both' }}>
          <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, marginBottom: '0.5rem' }}>
            🏨 Hospedagens
          </h1>
          <p style={{ opacity: 0.85, fontSize: '0.95rem' }}>
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
              {`${hotels.length} ${hotels.length !== 1 ? 'hospedagens' : 'hospedagem'}`}
            </span>
          </p>
        </div>

        {hotels.length === 0 ? (
          <div
            style={{
              background: 'var(--glass)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid var(--glass-border)',
              borderRadius: '18px',
              padding: '3rem 2rem',
              color: 'white',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏨</div>
            <p style={{ opacity: 0.85, fontSize: '1rem', lineHeight: 1.6 }}>
              Nenhuma hospedagem válida encontrada. Verifique o preenchimento da planilha.
            </p>
          </div>
        ) : (
          <>
            {/* Hotels grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
              {hotels.map((hotel, index) => (
                <HotelCard key={hotel.id} hotel={hotel} index={index} />
              ))}
            </div>

            {/* Totals glass panel */}
            <section
              style={{
                background: 'var(--glass)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid var(--glass-border)',
                borderRadius: '18px',
                padding: '2rem',
                color: 'white',
                animation: 'fadeInUp 0.6s 0.5s ease-out both',
              }}
            >
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📊 Resumo Financeiro
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--warning)' }}>{totalNights}</div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.75, marginTop: '0.3rem', fontWeight: 500 }}>noites no total</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--warning)' }}>
                    {confirmedCount} de {hotels.length}
                  </div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.75, marginTop: '0.3rem', fontWeight: 500 }}>confirmadas</div>
                </div>
              </div>

              {Object.entries(totalsByMoeda).map(([moeda, totals]) => (
                <div
                  key={moeda}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '1rem 1.25rem',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{moeda}</span>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                      ✅ {formatCurrency(totals.confirmed, moeda)}
                    </span>
                    <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                      ⏳ {formatCurrency(totals.pending, moeda)}
                    </span>
                    <span style={{ fontWeight: 800, color: 'var(--warning)' }}>
                      Total: {formatCurrency(totals.total, moeda)}
                    </span>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
      </div>
    </>
  );
}
