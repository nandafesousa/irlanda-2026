import type { Metadata, Viewport } from 'next';
import './globals.css';
import Nav from '@/components/Nav';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Ireland & UK Trip',
  description: 'Travel companion for an 18-day trip to Ireland and the United Kingdom',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: -50,
            background: 'linear-gradient(135deg, var(--grad-start) 0%, var(--grad-end) 100%)',
          }}
        />
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: -40,
            opacity: 0.04,
            pointerEvents: 'none',
            backgroundImage: "url('/noise.svg')",
          }}
        />
        <Nav />
        <main className="pb-[calc(var(--nav-height-mobile)_+_env(safe-area-inset-bottom,0px))] md:pb-0">{children}</main>
      </body>
    </html>
  );
}
