"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavRoute {
  href: string;
  label: string;
  icon: string;
}

const NAVIGATION_ROUTES: readonly NavRoute[] = [
  { href: '/',            label: 'Home',       icon: '🏠' },
  { href: '/roteiro',     label: 'Roteiro',    icon: '🗺️' },
  { href: '/hospedagens', label: 'Hospedagem', icon: '🏨' },
  { href: '/transportes', label: 'Transporte', icon: '🚂' },
] as const;

export function isItemActive(
  pathname: string,
  href: string,
  anyNonHomeMatched: boolean,
): boolean {
  if (href === '/') return pathname === '/' || !anyNonHomeMatched;
  return pathname.startsWith(href);
}

export interface NavProps {}

export default function Nav(_props: NavProps) {
  const pathname = usePathname();

  const anyNonHomeMatched = NAVIGATION_ROUTES.some(
    (r) => r.href !== '/' && pathname.startsWith(r.href),
  );

  return (
    <>
      {/* Desktop top nav */}
      <nav
        aria-label="Navegação principal"
        className="hidden md:flex items-center px-6 sticky top-0 z-50 h-[60px]"
        style={{ background: 'var(--nav-bg-desktop)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center gap-1">
          {NAVIGATION_ROUTES.map((link) => {
            const active = isItemActive(pathname, link.href, anyNonHomeMatched);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  'px-4 py-2 text-sm font-medium transition-all',
                  'hover:bg-[var(--nav-hover-desktop)] hover:rounded-[8px]',
                  'focus-visible:outline-2 focus-visible:outline-white focus-visible:outline focus-visible:rounded-[8px]',
                  active ? 'text-white' : 'text-white/65',
                ].join(' ')}
              >
                <span className="mr-1">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav
        aria-label="Navegação principal"
        className="nav-mobile flex md:hidden fixed bottom-0 w-full z-50 grid grid-cols-4"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {NAVIGATION_ROUTES.map((link) => {
          const active = isItemActive(pathname, link.href, anyNonHomeMatched);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={[
                'flex flex-col items-start pt-3 pb-2 px-2 text-xs font-medium transition-colors active:opacity-80',
                'focus-visible:outline-2 focus-visible:outline-white focus-visible:outline',
                active ? 'text-white' : 'text-white/65',
              ].join(' ')}
            >
              <span className="text-xl mb-1">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
