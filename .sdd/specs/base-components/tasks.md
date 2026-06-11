# Implementation Plan

- [x] 1. Extend globals.css with semantic variables and glass utility class
- [x] 1.1 Add 4 semantic CSS variables to :root
  - Append `--nav-bg-desktop`, `--nav-bg-mobile`, `--nav-hover-desktop`, and `--glass-hover` to the existing `:root` block in `globals.css`, after the `--glass-border` token
  - Exact values: `--nav-bg-desktop: rgba(102, 126, 234, 0.4)`, `--nav-bg-mobile: rgba(80, 60, 180, 0.92)`, `--nav-hover-desktop: rgba(255, 255, 255, 0.18)`, `--glass-hover: rgba(255, 255, 255, 0.20)`
  - No existing token may be renamed or removed
  - _Requirements: 1.2, 1.4, 2.3, 5.5, 7.3_

- [x] 1.2 Add .glass-card component class with hover state
  - After the existing `@tailwind utilities` directive, add an `@layer components` block containing `.glass-card` and `.glass-card:hover`
  - `.glass-card` must apply `background: var(--glass)`, `backdrop-filter: blur(16px)`, `border: 1px solid var(--glass-border)`, `border-radius: 16px`, and `transition: background 0.2s ease`
  - `.glass-card:hover` must apply `background: var(--glass-hover)`
  - No hex or rgba values may appear inside the class — all values must reference CSS custom properties
  - _Requirements: 5.1, 5.5_

- [x] 2. (P) Implement StatCard component
- [x] 2.1 Build the StatCard with glassmorphism, typed props and Tailwind JIT typography
  - Replace the placeholder body in `StatCard.tsx` with the full server component; no `"use client"` directive
  - Export a `StatCardProps` interface with `value: string | number` (required), `label: string` (required), and `icon?: string` (optional); TypeScript strict mode must reject calls that omit either required prop
  - Apply the `.glass-card` class to the root wrapper div; no other color or background styling on that element
  - Render the value using Tailwind JIT classes `text-[2.4rem] font-[800] text-[var(--warning)]`; no inline `style` attribute for these properties
  - Render the label below the value with `className="text-white"`
  - Conditionally render the icon in a `<span>` above the value only when the `icon` prop is provided — omit the span entirely when absent
  - No hardcoded hex or rgba values anywhere in the file; no data-fetching calls or side effects
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.5_

- [x]* 2.2 Add StatCard unit test coverage
  - Verify the component renders the `value` and `label` from props in the output
  - Verify the icon `<span>` is absent from the rendered output when `icon` prop is not provided
  - Verify TypeScript compilation fails when `value` or `label` is omitted (use `@ts-expect-error` comment technique or a separate type-check-only test file)
  - _Requirements: 6.1, 6.5_

- [x] 3. (P) Implement Nav component
- [x] 3.1 Define NAVIGATION_ROUTES constant and isItemActive helper
  - Add `"use client"` directive at the top of `Nav.tsx` and import `usePathname` from `next/navigation` and `Link` from `next/link`
  - Declare a `NavRoute` interface with `href: string`, `label: string`, and `icon: string`
  - Declare a `readonly NAVIGATION_ROUTES` array of type `NavRoute` with the 4 entries: `{ href: '/', label: 'Home', icon: '🏠' }`, `{ href: '/roteiro', label: 'Roteiro', icon: '🗺️' }`, `{ href: '/hospedagens', label: 'Hospedagem', icon: '🏨' }`, `{ href: '/transportes', label: 'Transporte', icon: '🚂' }`
  - Declare `isItemActive(pathname: string, href: string, anyNonHomeMatched: boolean): boolean` — if `href === '/'` return `pathname === '/' || !anyNonHomeMatched`; otherwise return `pathname.startsWith(href)`
  - Keep the exported `NavProps` interface as an empty interface (no props)
  - _Requirements: 3.3, 3.4, 3.5, 4.1, 4.4_

- [x] 3.2 Build top nav desktop layout
  - Render a `<nav>` element that is hidden on mobile and visible as a flex row on desktop (`hidden md:flex`); height must be 60px
  - Apply `background: var(--nav-bg-desktop)` and `backdropFilter: 'blur(20px)'` via inline `style` (CSS variable references are acceptable in inline style; no hardcoded rgba)
  - Iterate over `NAVIGATION_ROUTES` to render each `Link`; each link item must carry `hover:bg-[var(--nav-hover-desktop)] hover:rounded-[8px]` Tailwind classes
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 7.2_

- [x] 3.3 Build bottom tab bar mobile with safe-area handling
  - Render a second `<nav>` element hidden on desktop and visible as a fixed bar on mobile (`flex md:hidden fixed bottom-0 w-full`)
  - Apply `background: var(--nav-bg-mobile)` and `backdropFilter: 'blur(20px)'` via inline `style`
  - Apply `paddingBottom: 'env(safe-area-inset-bottom)'` to the nav container for notched device support
  - Lay out the 4 route items in a 4-column grid (`grid grid-cols-4`); each column must use `flex-col items-start pt-3` so icon and label anchor at the top of the column regardless of how much safe-area inset the OS injects at the bottom
  - Iterate over `NAVIGATION_ROUTES` to render each item's `icon` and `label`
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 7.2_

- [x] 3.4 Wire active state detection, active styles and accessibility
  - Call `usePathname()` at the top of the component function and derive `anyNonHomeMatched` by filtering `NAVIGATION_ROUTES` with `pathname.startsWith(r.href)` for all non-home entries
  - Pass `anyNonHomeMatched` to `isItemActive` for every link in both nav elements; active links receive `text-white`, inactive links receive `text-white/65`
  - Add `aria-label="Navegação principal"` to both `<nav>` elements
  - Add `focus-visible:outline-2 focus-visible:outline-white` to every link for visible keyboard focus
  - _Requirements: 3.1, 3.2, 3.3, 3.5, 4.2, 4.3_

- [x] 4. Validate type safety and build integrity
  - Run `tsc --noEmit` and confirm zero TypeScript errors across `Nav.tsx` and `StatCard.tsx`
  - Run `npm run build` and confirm it exits with code 0
  - Confirm `Nav.tsx` and `StatCard.tsx` contain no hardcoded hex or rgba color values outside CSS variable references
  - Confirm neither file imports from any external UI component library
  - Confirm both files reside at `src/components/Nav.tsx` and `src/components/StatCard.tsx` (PascalCase convention)
  - _Requirements: 7.1, 7.4, 7.5, 7.6_
