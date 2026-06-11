import type { Hotel } from '@/lib/types';

interface HotelCardProps {
  readonly hotel: Hotel;
  readonly index: number;
}

export default function HotelCard({ hotel, index }: HotelCardProps): React.JSX.Element {
  const isConfirmed = hotel.status === 'confirmado';

  const formatCurrency = (value: number, currency: string) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);

  const perNight = hotel.noites > 0 ? Math.round(hotel.preco_total / hotel.noites) : 0;

  return (
    <div
      className="relative overflow-hidden rounded-[18px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:shadow-[0_18px_52px_rgba(0,0,0,0.14)] transition-all duration-300 h-full flex flex-col justify-between"
      style={{ background: 'white', animation: 'fadeInUp 0.6s ease-out both', animationDelay: `${index * 0.1}s` } as React.CSSProperties}
    >
      {/* Top stripe */}
      <div
        className="absolute top-0 inset-x-0 h-1"
        style={{
          background: isConfirmed
            ? 'linear-gradient(90deg, var(--primary), var(--accent))'
            : 'linear-gradient(90deg, var(--warning), #e9b000)',
        }}
      />

      <div style={{ padding: '1.75rem' }}>
        {/* Hotel header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: 'rgba(108,92,231,0.08)',
                color: 'var(--primary)',
                border: '1px solid rgba(108,92,231,0.2)',
                padding: '0.25rem 0.65rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
              }}
            >
              {hotel.cidade}
            </span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dark)', lineHeight: 1.3, marginBottom: '0.2rem' }}>
              {hotel.nome_hotel}
            </div>
            {hotel.endereco !== '' && (
              <div style={{ fontSize: '0.8rem', color: '#b2bec3' }}>{hotel.endereco}</div>
            )}
          </div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.4rem 0.9rem',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              background: isConfirmed ? 'rgba(0,184,148,0.12)' : 'rgba(253,203,110,0.15)',
              color: isConfirmed ? 'var(--success)' : 'var(--warning-dark)',
              border: isConfirmed ? '1px solid rgba(0,184,148,0.3)' : '1px solid rgba(253,203,110,0.5)',
            }}
          >
            {isConfirmed ? '✅ Confirmado' : '⏳ Pendente'}
          </span>
        </div>

        {/* Date meta grid */}
        <div className="grid grid-cols-2 gap-3" style={{ marginBottom: '1rem', background: 'var(--light)', borderRadius: '10px', padding: '0.75rem' }}>
          {[
            { label: 'Check-in', value: hotel.data_checkin },
            { label: 'Check-out', value: hotel.data_checkout },
            { label: 'Noites', value: `${hotel.noites} noite${hotel.noites !== 1 ? 's' : ''}` },
            { label: 'Hóspedes', value: '2 pessoas' },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: '0.72rem', color: '#b2bec3', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600, marginBottom: '0.3rem' }}>
                {item.label}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--dark)' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Price row + booking — pushed to bottom via flex-col justify-between */}
      <div style={{ padding: '0 1.75rem 1.75rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(108,92,231,0.06), rgba(255,107,138,0.06))',
            border: '1px solid rgba(108,92,231,0.12)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: '#b2bec3', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              {isConfirmed ? 'Total' : 'Estimado'}
            </div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1, marginTop: '0.2rem' }}>
              {formatCurrency(hotel.preco_total, hotel.moeda)}
            </div>
            {perNight > 0 && (
              <div style={{ fontSize: '0.78rem', color: '#b2bec3', marginTop: '0.15rem' }}>
                ~{formatCurrency(perNight, hotel.moeda)}/noite
              </div>
            )}
          </div>
          {hotel.link_booking !== undefined ? (
            <a
              href={hotel.link_booking}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'var(--primary)',
                color: 'white',
                textDecoration: 'none',
                padding: '0.6rem 1.1rem',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              🔗 Booking
            </a>
          ) : (
            <span style={{ fontSize: '0.82rem', color: '#b2bec3', fontStyle: 'italic' }}>A confirmar</span>
          )}
        </div>

        {/* Observations */}
        {hotel.observacoes !== undefined && (
          <div
            style={{
              marginTop: '0.75rem',
              fontSize: '0.8rem',
              color: '#636E72',
              background: 'rgba(0,184,148,0.06)',
              border: '1px solid rgba(0,184,148,0.2)',
              borderRadius: '8px',
              padding: '0.5rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            💚 {hotel.observacoes}
          </div>
        )}
      </div>
    </div>
  );
}
