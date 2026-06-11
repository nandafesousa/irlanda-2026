'use client';

interface ErrorPageProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

export default function HospedagensError({ error, reset }: ErrorPageProps): React.JSX.Element {
  return (
    <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
      <div
        style={{
          background: 'var(--glass)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--glass-border)',
          borderRadius: '18px',
          padding: '2.5rem 2rem',
          color: 'white',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏨</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Não foi possível carregar as hospedagens
        </h2>
        <p style={{ opacity: 0.8, fontSize: '0.95rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
          Ocorreu um problema ao buscar os dados da planilha. Verifique sua conexão e tente novamente.
          {error.digest && (
            <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.78rem', opacity: 0.55 }}>
              Ref: {error.digest}
            </span>
          )}
        </p>
        <button
          onClick={reset}
          style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '0.75rem 2rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
