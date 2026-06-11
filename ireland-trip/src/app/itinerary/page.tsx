import { getRoteiro } from '@/lib/sheets';
import CityCard from '@/components/CityCard';

export default async function ItineraryPage() {
  const cities = await getRoteiro();
  const totalNights = cities.reduce((sum, c) => sum + c.noites, 0);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideDown { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        .timeline::before {
          content: '';
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 3px;
          height: 100%;
          background: linear-gradient(to bottom, var(--primary), var(--accent));
          border-radius: 2px;
        }
        @media (max-width: 768px) {
          .timeline::before { left: 0 !important; }
          .city-card-wrapper-odd,
          .city-card-wrapper-even {
            margin-left: 46px !important;
            margin-right: 0 !important;
            text-align: left !important;
          }
        }
      ` }} />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2.5rem 1.5rem 6rem' }}>
        {/* Page header */}
        <div style={{ textAlign: 'center', color: 'white', marginBottom: '3rem', animation: 'slideDown 0.6s ease-out both' }}>
          <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, marginBottom: '0.5rem' }}>
            🗺️ Roteiro da Viagem
          </h1>
          <p style={{ opacity: 0.85, fontSize: '0.95rem' }}>
            {cities.length} cidades · {totalNights} dias · clique nos cards para expandir
          </p>
        </div>

        {/* Timeline */}
        <div className="timeline" style={{ position: 'relative' }}>
          {cities.map((city, i) => (
            <CityCard key={city.id} city={city} index={i} />
          ))}
        </div>
      </div>
    </>
  );
}
