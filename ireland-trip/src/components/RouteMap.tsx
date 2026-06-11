'use client';

import { useRef, useEffect } from 'react';

export interface RouteChip {
  readonly city: string;
  readonly emoji: string;
  readonly date: string;
  readonly accentVar: string;
}

interface RouteMapProps {
  readonly chips: readonly RouteChip[];
}

export default function RouteMap({ chips }: RouteMapProps) {
  const chipRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // @supports CSS não detecta APIs JS — verificar aqui no ciclo de vida
    if (!('IntersectionObserver' in window)) {
      chipRefs.current.forEach((el) => el?.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 50px 0px 50px',
      }
    );

    // Snapshot do ref para cleanup seguro na desmontagem
    const currentRefs = chipRefs.current;
    currentRefs.forEach((el) => { if (el) observer.observe(el); });

    return () => observer.disconnect();
  }, [chips]);

  return (
    <ol
      aria-label="Percurso da viagem"
      className="flex items-center gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0"
    >
      {chips.flatMap((chip, i) => {
        const chipItem = (
          <li key={`chip-${i}`}>
            <div
              ref={(el) => { if (el) chipRefs.current[i] = el; }}
              className="route-chip glass-card flex-shrink-0 px-4 py-3 flex flex-col items-center gap-1"
              style={{ borderColor: `var(${chip.accentVar})` }}
            >
              <span className="text-xl leading-none">{chip.emoji}</span>
              <span className="text-white font-semibold text-sm whitespace-nowrap">{chip.city}</span>
              <span className="text-white/70 text-xs">{chip.date}</span>
            </div>
          </li>
        );

        if (i < chips.length - 1) {
          return [
            chipItem,
            <li key={`sep-${i}`} aria-hidden="true" className="text-white/60 flex-shrink-0">→</li>,
          ];
        }
        return [chipItem];
      })}
    </ol>
  );
}
