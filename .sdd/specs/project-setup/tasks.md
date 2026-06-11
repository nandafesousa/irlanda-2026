# Implementation Plan

- [x] 1. Bootstrap the Next.js project
- [x] 1.1 Initialize the project with create-next-app
  - Run `npx create-next-app@14 ireland-trip` selecting App Router, TypeScript, ESLint, Tailwind CSS, and `src/` directory layout options
  - Confirm the project root contains only configuration files (`package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `.gitignore`) and no source code at root level
  - Verify `npm run dev` starts the development server without errors on the freshly scaffolded project
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 1.2 Add Node.js engine constraint to package.json
  - Add `"engines": { "node": ">=18" }` field to `package.json`
  - Confirm `npm run dev` and `npm run build` scripts are present and correct
  - _Requirements: 1.5_

- [x] 2. (P) Configure TypeScript strict settings
  - Set `"strict": true` in `tsconfig.json` to enable all strict-mode checks (`noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, etc.)
  - Set `"moduleResolution": "bundler"` for Next.js 14 App Router compatibility — do not use `"node"` (incompatible with server/client component conventions)
  - Set `"baseUrl": "."` alongside `"paths": { "@/*": ["./src/*"] }` so the `@/` alias resolves to `src/` at compile time
  - Ensure `"include"` covers `["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]`
  - _Requirements: 1.3, 2.1, 2.2, 2.3, 2.4_

- [x] 3. Define the CSS design system
- [x] 3.1 (P) Write CSS custom property tokens in globals.css
  - Define brand color tokens in `:root` as both hex variables and space-separated RGB-channel variables: `--primary / --primary-rgb`, `--primary-dark / --primary-dark-rgb`, `--accent / --accent-rgb`, `--success / --success-rgb`, `--warning / --warning-rgb`, `--dark / --dark-rgb`, `--light / --light-rgb`
  - Define glassmorphism tokens: `--glass: rgba(255,255,255,0.12)` and `--glass-border: rgba(255,255,255,0.25)`
  - Define gradient tokens: `--grad-start: #667eea` and `--grad-end: #764ba2`
  - Define city accent tokens `--c1` through `--c6` for Dublin (1st stay), Belfast, Edinburgh, Liverpool, London, and Dublin (2nd stay) respectively
  - Set `body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; }` — no external web font imports
  - Use space-separated channel values (e.g., `108 92 231`) not comma-separated — comma syntax silently disables Tailwind opacity modifiers
  - _Requirements: 3.1, 3.2, 3.4_

- [x] 3.2 (P) Configure Tailwind with RGB-channel color theme extension
  - Set `content` array to `['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}']` — exclude `src/lib/` (no Tailwind classes in logic files)
  - Extend `theme.colors` using the RGB-channel variable pattern for `primary`, `primary-dark`, `accent`, `success`, `warning`, `dark`, and `light` — each using the `'rgb(var(--X-rgb) / <alpha-value>)'` syntax
  - Do not add city accent tokens (`--c1`–`--c6`) to Tailwind; they are consumed only via CSS `var()` in component styles
  - Do not override default Tailwind spacing, typography, or responsive breakpoint scales
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 4. Build the data layer stubs
- [x] 4.1 (P) Create domain type interfaces
  - Create `src/lib/types.ts` exporting three interfaces: `City`, `Hotel`, and `Transport`, each with a single `id: string` field
  - A single `id` field per interface avoids `@typescript-eslint/no-empty-interface` warnings and provides an extension anchor for the data-layer spec
  - _Requirements: 2.1, 5.3_

- [x] 4.2 Create Sheets service stubs with error-fallback
  - Create `src/lib/sheets.ts` with `import 'server-only'` as the first line — build-time guard preventing client-side import
  - Import `City`, `Hotel`, `Transport` from `./types` and export three async functions: `getCities(): Promise<City[]>`, `getHotels(): Promise<Hotel[]>`, `getTransports(): Promise<Transport[]>`
  - Each function body is `try { return [] } catch { return [] }` — never throws, always resolves to an array regardless of credential presence or network state
  - Include `{ next: { revalidate: 3600 } }` as a comment inside each stub body indicating where ISR revalidation belongs in the future fetch call
  - Read `GOOGLE_SHEETS_ID` and `GOOGLE_API_KEY` from `process.env` only — never prefixed with `NEXT_PUBLIC_`, never passed to client props
  - _Requirements: 6.3, 6.4, 7.2, 7.4_

- [x] 5. (P) Set up environment variable template
  - Create `.env.local.example` (safe to commit) with two placeholder variables: `GOOGLE_SHEETS_ID=` and `GOOGLE_API_KEY=`, each with an inline comment describing its purpose
  - Add `.env.local` to `.gitignore` so actual credentials are never committed
  - _Requirements: 6.1, 6.2_

- [x] 6. Create UI component placeholder files
- [x] 6.1 (P) Create Nav and StatCard stubs
  - Create `src/components/Nav.tsx` exporting a default server component with an empty `NavProps` interface and a `<div>Nav</div>` placeholder return
  - Create `src/components/StatCard.tsx` with `StatCardProps { label: string; value: string | number }` and a `<div>StatCard</div>` placeholder return
  - No `'use client'` directive, no inline styles, no hardcoded hex values in either file
  - _Requirements: 3.5, 5.3_

- [x] 6.2 (P) Create CityCard, HotelCard, and TransportCard stubs
  - Create `src/components/CityCard.tsx` with `CityCardProps { cityIndex: 1 | 2 | 3 | 4 | 5 | 6; name: string }` and a `<div>CityCard</div>` placeholder return
  - Create `src/components/HotelCard.tsx` with `HotelCardProps { name: string; confirmed: boolean }` and a `<div>HotelCard</div>` placeholder return
  - Create `src/components/TransportCard.tsx` with `TransportCardProps { operator: string; from: string; to: string }` and a `<div>TransportCard</div>` placeholder return
  - No `'use client'` directive, no inline styles, no hardcoded hex values in any file
  - _Requirements: 3.5, 5.3_

- [x] 7. Assemble the route structure
- [x] 7.1 (P) Create placeholder pages for all four routes
  - Create `src/app/page.tsx` — default async server component returning `<main>Home</main>`
  - Create `src/app/itinerary/page.tsx` — default async server component returning `<main>Itinerary</main>`
  - Create `src/app/accommodations/page.tsx` — default async server component returning `<main>Accommodations</main>`
  - Create `src/app/transports/page.tsx` — default async server component returning `<main>Transports</main>`
  - No data fetching calls at this phase; no `'use client'` directives
  - _Requirements: 5.1, 5.3_

- [x] 7.2 (P) Build the root layout
  - Create/replace `src/app/layout.tsx` importing `'./globals.css'` — the only import point for the design system in the entire application
  - Export `metadata: Metadata` with `title: 'Ireland & UK Trip'` and an 18-day trip description; wrap the document in `<html lang="en">`
  - Render two fixed `div` background layers as the first children of `<body>` before `<Nav />` and `<main>{children}</main>`:
    - Layer 1 (`z-index: -50`): `position: fixed; inset: 0; background: linear-gradient(135deg, var(--grad-start) 0%, var(--grad-end) 100%)`
    - Layer 2 (`z-index: -40`): `position: fixed; inset: 0; opacity: 0.04; pointer-events: none; background-image: url('/noise.svg')`
  - Do NOT use `background-attachment: fixed` on `body` — fixed `div` layers are required for iOS Safari scroll-repaint compatibility
  - `<body>` sets no background styles of its own
  - _Requirements: 3.3, 5.2, 5.4_

- [x] 8. Verify build and type safety
- [x] 8.1 Validate the clean build
  - Run `npm run build` with no `.env.local` present and confirm it exits 0 — missing credentials must not break the build
  - Run `npm run dev` on a clean clone with no `.env.local` and confirm the development server starts without errors
  - Confirm no `vercel.json` file exists in the project root
  - _Requirements: 1.4, 6.3, 7.1, 7.3_

- [x] 8.2 Validate TypeScript strict enforcement
  - Run `tsc --noEmit` and confirm zero errors on the full scaffold
  - Introduce a deliberate type error in `src/app/page.tsx` (e.g., assign a number to a string-typed variable), run `npm run build`, confirm it exits non-zero and prints the error, then revert the change
  - _Requirements: 2.4_
