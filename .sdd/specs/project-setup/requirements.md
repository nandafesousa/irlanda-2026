# Requirements Document

## Introduction

This specification covers the initial project scaffold for **ireland-trip** — a Next.js 14 (App Router) + TypeScript travel companion app for an 18-day Ireland & UK trip. The setup phase establishes the project skeleton under a `src/` directory structure, Tailwind CSS integration with RGB-channel color tokens, the complete CSS design-system (custom properties / tokens), TypeScript strict configuration, path aliases, environment variable placeholders, and a Zero Config Vercel deployment. All subsequent features (pages, components, data layer) build on this foundation.

## Requirements

### Requirement 1: Next.js Project Scaffold

**Objective:** As a developer, I want to bootstrap the project with the correct framework options, so that the App Router, TypeScript, and Tailwind are available from the first commit with a clean root directory.

#### Acceptance Criteria

1. The Setup shall produce a project named `ireland-trip` initialized with `create-next-app` using the App Router, TypeScript, ESLint, Tailwind CSS, and the `src/` directory options enabled.
2. The Setup shall place all application source files under `src/` (`src/app/`, `src/components/`, `src/lib/`), so that the project root contains only configuration files (`package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `.gitignore`, `.env.local`, etc.) and no source code.
3. The Setup shall configure the `@/` path alias in `tsconfig.json` to resolve to `./src`, enabling imports such as `import { getCities } from '@/lib/sheets'`.
4. When the project scaffold is complete, the Setup shall produce a working `npm run dev` command that starts the development server without errors.
5. The Setup shall lock Node.js to version 18 or higher by declaring `"engines": { "node": ">=18" }` in `package.json`.

---

### Requirement 2: TypeScript Strict Configuration

**Objective:** As a developer, I want TypeScript strict mode enforced, so that type safety is guaranteed across all domain types and components from the start.

#### Acceptance Criteria

1. The Setup shall set `"strict": true` in `tsconfig.json`, enabling all strict-mode checks (`noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, etc.).
2. The Setup shall configure `"moduleResolution": "bundler"` (or `"node16"`) compatible with Next.js 14 App Router's module conventions.
3. The Setup shall include `"paths": { "@/*": ["./src/*"] }` in `tsconfig.json` so that the `@/` alias resolves to `src/` at compile time.
4. If a TypeScript error is introduced in any file under `src/app/`, `src/components/`, or `src/lib/`, the Setup shall ensure `npm run build` exits with a non-zero code and prints the error.

---

### Requirement 3: CSS Design System — Custom Properties

**Objective:** As a developer, I want all brand colors, glassmorphism variables, city accent colors, typography, spacing, and animation tokens defined as CSS custom properties using RGB channels, so that every component references tokens and Tailwind opacity modifiers work correctly.

#### Acceptance Criteria

1. The Setup shall define the following color tokens in the `:root` selector of `src/app/globals.css` as both hex variables and RGB-channel variables:
   - `--primary: #6C5CE7` / `--primary-rgb: 108 92 231`
   - `--primary-dark: #5A4BD1` / `--primary-dark-rgb: 90 75 209`
   - `--accent: #FF6B8A` / `--accent-rgb: 255 107 138`
   - `--success: #00B894` / `--success-rgb: 0 184 148`
   - `--warning: #FDCB6E` / `--warning-rgb: 253 203 110`
   - `--dark: #2D3436` / `--dark-rgb: 45 52 54`
   - `--light: #F5F6FA` / `--light-rgb: 245 246 250`
   - `--glass: rgba(255, 255, 255, 0.12)`
   - `--glass-border: rgba(255, 255, 255, 0.25)`
   - `--grad-start: #667eea`
   - `--grad-end: #764ba2`
2. The Setup shall define the six city accent color tokens in `:root`:
   - `--c1: #6C5CE7` (Dublin 1st stay)
   - `--c2: #FF6B8A` (Belfast)
   - `--c3: #00B894` (Edinburgh)
   - `--c4: #0984E3` (Liverpool)
   - `--c5: #D63031` (London)
   - `--c6: #FDCB6E` (Dublin 2nd stay)
3. The Setup shall apply the page background gradient via two isolated, fixed-position `div` layers rendered inside `src/app/layout.tsx` — not via `background-attachment: fixed` on `body` — to ensure smooth scroll performance on iOS Safari and Android Chrome:
   - Layer 1 (`z-index: -50`): `position: fixed; inset: 0; background: linear-gradient(135deg, var(--grad-start) 0%, var(--grad-end) 100%)`
   - Layer 2 (`z-index: -40`): `position: fixed; inset: 0; opacity: 0.04; pointer-events: none; background-image: url('/noise.svg')`
4. The Setup shall set the base font family on `body` to `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif` — no external web font import.
5. The App shall not contain any hardcoded hex color values in component or page files; all colors shall be referenced via CSS custom properties.

---

### Requirement 4: Tailwind CSS Configuration

**Objective:** As a developer, I want Tailwind configured to work alongside the CSS custom property system using RGB channels, so that Tailwind opacity modifiers (e.g., `bg-primary/50`) work correctly alongside the brand palette.

#### Acceptance Criteria

1. The Setup shall configure `tailwind.config.ts` with the `content` array covering `./src/app/**/*.{ts,tsx}` and `./src/components/**/*.{ts,tsx}`. The `src/lib/` directory shall be excluded — it contains only TypeScript logic and types; Tailwind utility classes must not be used there.
2. The Setup shall extend `theme.colors` using the RGB-channel variable pattern so Tailwind can inject the alpha value dynamically:
   ```ts
   colors: {
     primary:      'rgb(var(--primary-rgb) / <alpha-value>)',
     'primary-dark': 'rgb(var(--primary-dark-rgb) / <alpha-value>)',
     accent:       'rgb(var(--accent-rgb) / <alpha-value>)',
     success:      'rgb(var(--success-rgb) / <alpha-value>)',
     warning:      'rgb(var(--warning-rgb) / <alpha-value>)',
     dark:         'rgb(var(--dark-rgb) / <alpha-value>)',
     light:        'rgb(var(--light-rgb) / <alpha-value>)',
   }
   ```
3. When a component uses a Tailwind utility with an opacity modifier (e.g., `bg-primary/10`, `text-accent/80`), the Setup shall ensure the correct color with the specified opacity is applied at runtime.
4. The Setup shall NOT override Tailwind's default spacing, typography, or responsive breakpoint scales; only the color theme extension is customized.

---

### Requirement 5: Project Folder Structure

**Objective:** As a developer, I want the canonical folder structure established with placeholder files under `src/`, so that subsequent feature specs can add content without restructuring.

#### Acceptance Criteria

1. The Setup shall create the following directory skeleton under `ireland-trip/src/`, with all routes in English:
   ```
   src/
     app/
       layout.tsx              (root layout — background layers + Nav)
       page.tsx                (home page — placeholder)
       globals.css             (design-system custom properties)
       itinerary/
         page.tsx              (placeholder)
       accommodations/
         page.tsx              (placeholder)
       transports/
         page.tsx              (placeholder)
     components/
       Nav.tsx                 (placeholder)
       StatCard.tsx            (placeholder)
       CityCard.tsx            (placeholder)
       HotelCard.tsx           (placeholder)
       TransportCard.tsx       (placeholder)
     lib/
       sheets.ts               (placeholder with error boundary)
       types.ts                (placeholder)
   ```
   > **i18n decision (documented):** Routes are in English (`/itinerary`, `/accommodations`, `/transports`) to maintain consistency with component names and codebase language. The target audience accesses the app via a shared link and does not rely on URL readability; no i18n infrastructure is required.
2. The Setup shall ensure `src/app/layout.tsx` renders the two fixed background `div` layers (gradient + noise) as the first children of `body`, followed by `<Nav />` and `<main>{children}</main>`, and imports `./globals.css`.
3. The Setup shall ensure placeholder components export a valid React component (no `any` types) so `npm run build` succeeds on the scaffold alone.
4. The Setup shall include `src/app/globals.css` imported once at the root layout level, not inside individual pages.

---

### Requirement 6: Environment Variables Template

**Objective:** As a developer, I want an `.env.local` template file committed to the repository, so that any developer or CI environment knows which variables must be set before running the app.

#### Acceptance Criteria

1. The Setup shall include an `.env.local.example` file (safe to commit) with the following variables and descriptions:
   ```
   GOOGLE_SHEETS_ID=   # Spreadsheet ID from the Google Sheets URL
   GOOGLE_API_KEY=     # API key restricted to the Vercel domain (Google Cloud Console)
   ```
2. The Setup shall add `.env.local` to `.gitignore` so actual credentials are never committed.
3. If `GOOGLE_SHEETS_ID` or `GOOGLE_API_KEY` are absent at build time, the Setup shall allow the build to succeed (values are only consumed at runtime by server components).
4. The Setup shall include a fallback mechanism in `src/lib/sheets.ts` such that if the Google Sheets API call fails at runtime (network error, rate limit, or missing credentials), the function returns an empty array rather than throwing, preventing a full-page 500 error.

---

### Requirement 7: Vercel Zero Config Deployment

**Objective:** As a developer, I want the project to deploy on Vercel without a `vercel.json` file, relying on Vercel's native Next.js detection, so that there is no redundant infrastructure configuration to maintain.

#### Acceptance Criteria

1. The Setup shall NOT include a `vercel.json` file; Vercel's automatic Next.js detection shall be the only deployment configuration required.
2. The Setup shall configure ISR at the page level via `next: { revalidate: 3600 }` inside each page's `fetch` calls in `src/lib/sheets.ts` — not via global headers or redirect rules.
3. When the project is pushed to a Vercel-connected repository, the Setup shall produce a successful production deployment using Vercel's default `npm run build` command with zero manual dashboard configuration.
4. Where custom security headers or redirect rules are needed in the future, the Setup shall document that a `vercel.json` should be introduced at that point — not preemptively.
