import type { Metadata } from 'next';
import { getTransportes } from '@/lib/sheets';
import { calculateTransportesTotals } from '@/lib/finance';
import TransportCard from '@/components/TransportCard';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Transportes | Irlanda & UK 2026',
  description: 'Todos os trechos da viagem em ordem cronológica.',
};

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);

export default async function TransportesPage(): Promise<React.JSX.Element> {
  const transports = await getTransportes();
  const sorted = [...transports].sort((a, b) => a.data.localeCompare(b.data));
  const totalsByMoeda = calculateTransportesTotals(sorted);
  const paidCount = sorted.filter(t => t.status === 'pago').length;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideDown { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      ` }} />

      <div className="max-w-[1000px] mx-auto px-6 pt-10">
        {/* Page header */}
        <div style={{ textAlign: 'center', color: 'white', marginBottom: '2.5rem', animation: 'slideDown 0.6s ease-out both' }}>
          <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, marginBottom: '0.5rem' }}>
            Transportes
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
              {sorted.length} {sorted.length !== 1 ? 'trechos' : 'trecho'}
            </span>
          </p>
        </div>

        {sorted.length === 0 ? (
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
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚂</div>
            <p style={{ opacity: 0.85, fontSize: '1rem', lineHeight: 1.6 }}>
              Nenhum trecho válido encontrado. Verifique o preenchimento da planilha.
            </p>
          </div>
        ) : (
          <>
            {/* Transport list */}
            <div className="flex flex-col gap-4 mb-12">
              {sorted.map((t, i) => (
                <TransportCard key={t.id} transport={t} index={i} />
              ))}
            </div>

            {/* Cost summary glass panel */}
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
                💰 Resumo de Custos
              </h2>

              <div
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <span style={{ fontSize: '0.88rem', opacity: 0.8 }}>Trechos pagos</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--warning)' }}>
                  {paidCount} de {sorted.length}
                </span>
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
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                      ✅ {formatCurrency(totals.paid, moeda)}
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
