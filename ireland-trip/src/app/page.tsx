import type { Metadata } from 'next';
import StatCard from '@/components/StatCard';
import RouteMap, { type RouteChip } from '@/components/RouteMap';
import { getRoteiro } from '@/lib/sheets';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Home | Irlanda & UK 2026',
  description: 'Visão geral da viagem: 18 dias, 6 cidades, Irlanda e Reino Unido.',
};

interface StatItem {
  readonly value: number | string;
  readonly label: string;
  readonly icon: string;
}

interface NavSectionCard {
  readonly href: string;
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

const NAV_SECTION_CARDS: readonly NavSectionCard[] = [
  {
    href: '/roteiro',
    icon: '🗺️',
    title: 'Roteiro',
    description: 'Dia a dia das 6 cidades — Dublin, Belfast, Edinburgh, Liverpool, London.',
  },
  {
    href: '/hospedagens',
    icon: '🏨',
    title: 'Hospedagens',
    description: 'Hotéis confirmados, check-in, check-out e valores por cidade.',
  },
  {
    href: '/transportes',
    icon: '✈️',
    title: 'Transportes',
    description: 'Voos, trens e transfers entre as cidades do percurso.',
  },
] as const;

const ACCENT_VARS = ['--c1','--c2','--c3','--c4','--c5','--c6'] as const;

export default async function HomePage(): Promise<JSX.Element> {
  const cities = await getRoteiro();

  const STAT_ITEMS: readonly StatItem[] = [
    { value: cities.reduce((s, c) => s + c.noites, 0), label: 'dias',    icon: '📅' },
    { value: cities.length,                             label: 'cidades', icon: '🏙️' },
    { value: 5,                                         label: 'trechos', icon: '✈️' },
    { value: 2,                                         label: 'amigas',  icon: '👭' },
  ];

  const routeChips: RouteChip[] = cities.map((city, i) => ({
    city: city.cidade,
    emoji: city.emoji,
    date: city.data_entrada.slice(0, 5), // dd/mm
    accentVar: ACCENT_VARS[i % ACCENT_VARS.length],
  }));

  return (
    <div>
      <div className="max-w-[1000px] mx-auto px-6">

        {/* Hero Header */}
        <header
          className="rounded-2xl px-8 py-12 mb-8 text-center text-white relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--grad-start) 0%, var(--grad-end) 100%)',
            animation: 'slideDown 0.6s ease forwards',
          }}
        >
          {/* Noise texture overlay */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{ opacity: 0.04 }}
          >
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <filter id="noise">
                <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                <feColorMatrix type="saturate" values="0" />
              </filter>
              <rect width="100%" height="100%" filter="url(#noise)" />
            </svg>
          </div>

          <h1
            className="text-[clamp(1.7rem,4vw,2.5rem)] font-[800] text-white mb-2 leading-tight"
          >
            Irlanda &amp; Reino Unido 2026
          </h1>
          <p className="text-white/85 text-base">
            Ago–Set 2026 &middot; 2 viajantes
          </p>
        </header>

        {/* Stats Grid */}
        <section
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          style={{ animation: 'fadeInUp 0.6s ease forwards', animationDelay: '0.1s', opacity: 0 }}
        >
          {STAT_ITEMS.map((item) => (
            <StatCard key={item.label} value={item.value} label={item.label} icon={item.icon} />
          ))}
        </section>

        {/* RouteMap */}
        <section
          className="mb-8"
          style={{ animation: 'fadeInUp 0.6s ease forwards', animationDelay: '0.2s', opacity: 0 }}
        >
          <h2 className="text-white/80 text-sm font-semibold uppercase tracking-widest mb-4">
            Percurso
          </h2>
          <RouteMap chips={routeChips} />
        </section>

        {/* Navigation Cards */}
        <section
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          style={{ animation: 'fadeInUp 0.6s ease forwards', animationDelay: '0.3s', opacity: 0 }}
        >
          {NAV_SECTION_CARDS.map((card) => (
            <a
              key={card.href}
              href={card.href}
              className="bg-white rounded-[18px] p-6 no-underline flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-200 relative overflow-hidden"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
            >
              {/* Top stripe */}
              <div
                aria-hidden="true"
                className="absolute top-0 left-0 right-0 h-[4px]"
                style={{
                  background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                }}
              />
              <span className="text-3xl leading-none mt-1">{card.icon}</span>
              <div>
                <div className="text-[var(--dark)] font-[800] text-lg mb-1">{card.title}</div>
                <div className="text-sm text-[var(--dark)]/60">{card.description}</div>
              </div>
            </a>
          ))}
        </section>

      </div>
    </div>
  );
}
