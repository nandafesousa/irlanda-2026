import type { Transport } from '@/lib/types';

interface TransportCardProps {
  readonly transport: Transport;
  readonly index: number;
}

export default function TransportCard({ transport, index }: TransportCardProps): React.JSX.Element {
  const isPaid = transport.status === 'pago';
  const delay = (Math.min(index, 5) * 0.1).toFixed(1);

  const formatCurrency = (value: number, currency: string) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);

  return (
    <div
      className="relative overflow-hidden rounded-[18px] bg-white/80 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:translate-x-1 hover:shadow-[0_18px_52px_rgba(0,0,0,0.14)] transition-all duration-300"
      style={{
        animationDelay: `${delay}s` as string,
        animation: 'fadeInUp 0.6s ease-out both',
      } as React.CSSProperties}
    >
      {/* Top stripe */}
      <div
        className="absolute top-0 inset-x-0 h-1"
        style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent))' }}
      />

      <div className="flex items-start gap-4" style={{ padding: '1.5rem 1.5rem 1.5rem 1.5rem', paddingTop: '1.75rem' }}>
        {/* Emoji */}
        <div style={{ fontSize: '2.5rem', lineHeight: 1, flexShrink: 0 }}>
          {transport.emoji}
        </div>

        {/* Info block */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Route */}
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--dark)', marginBottom: '0.75rem' }}>
            {transport.origem} → {transport.destino}
          </div>

          {/* Meta row: data, horário, duração, operadora — grid 2-col com fundo var(--light) */}
          <div
            className="grid grid-cols-2 gap-2"
            style={{ background: 'var(--light)', borderRadius: '10px', padding: '0.65rem 0.85rem', marginBottom: '0.75rem' }}
          >
            <div>
              <div style={{ fontSize: '0.7rem', color: '#b2bec3', textTransform: 'uppercase', letterSpacing: '0.7px', fontWeight: 600, marginBottom: '0.2rem' }}>Data</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--dark)' }}>{transport.data}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#b2bec3', textTransform: 'uppercase', letterSpacing: '0.7px', fontWeight: 600, marginBottom: '0.2rem' }}>Horário</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--dark)' }}>{transport.horario}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#b2bec3', textTransform: 'uppercase', letterSpacing: '0.7px', fontWeight: 600, marginBottom: '0.2rem' }}>Duração</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--dark)' }}>{transport.duracao}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#b2bec3', textTransform: 'uppercase', letterSpacing: '0.7px', fontWeight: 600, marginBottom: '0.2rem' }}>Operadora</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--dark)' }}>{transport.operadora}</div>
            </div>
          </div>

          {/* Status badge + price row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: isPaid ? 'rgba(108,92,231,0.1)' : 'rgba(253,203,110,0.15)',
                color: isPaid ? 'var(--primary)' : '#c07900',
                border: isPaid ? '1px solid rgba(108,92,231,0.25)' : '1px solid rgba(253,203,110,0.5)',
                padding: '0.3rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 600,
              }}
            >
              {isPaid ? '✅ Pago' : '⏳ Pendente'}
            </span>

            {transport.preco !== undefined && transport.moeda && (
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--dark)' }}>
                {formatCurrency(transport.preco, transport.moeda)}
              </span>
            )}
          </div>

          {/* Observações — renderizado apenas quando presente */}
          {transport.observacoes && (
            <div style={{ marginTop: '0.65rem', fontSize: '0.8rem', color: '#636E72', fontStyle: 'italic', lineHeight: 1.5 }}>
              {transport.observacoes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
