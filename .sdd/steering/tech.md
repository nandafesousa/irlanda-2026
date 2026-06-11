# Technology Stack

## Architecture

Next.js App Router (server components by default). Each page fetches its own data server-side from Google Sheets; no client-side API calls, no credentials leak. Vercel handles deployment with automatic ISR via `next: { revalidate: 3600 }`.

## Core Technologies

- **Language**: TypeScript (strict mode)
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + CSS custom properties for the design-system color palette
- **Data**: Google Sheets API v4 (read-only, API key restricted to the Vercel domain)
- **Hosting**: Vercel

## Key Libraries

- `google-auth-library` or raw fetch against Sheets REST API — keep simple, no SDK needed for read-only access
- No UI component library — all components are hand-crafted to match the prototype's custom look

## Development Standards

### Type Safety
TypeScript strict mode. Core domain types live in `lib/types.ts` — `City`, `Hotel`, `Transport`. No `any`.

### Styling
Tailwind for layout utilities; color tokens always via CSS variables (defined in `globals.css` as `:root` custom properties), never hardcoded hex values in components.

### Server vs Client boundary
Pages and data-fetching are server components. Only add `"use client"` when interactivity is required (e.g., expandable city cards, mobile nav state).

## Development Environment

### Required Tools
- Node.js 18+
- npm / pnpm

### Common Commands
```bash
# Dev:   npm run dev
# Build: npm run build
# Lint:  npm run lint
```

## Key Technical Decisions

- **Server-side data fetching only**: Google Sheets API key never reaches the browser. Pages call `lib/sheets.ts` functions at render time.
- **CSS variables over Tailwind theme extension**: The purple/pink palette is defined as `:root` CSS variables to exactly match the prototype. Tailwind utilities reference these via `var(--primary)` etc.
- **No client-side routing for data refresh**: 1-hour ISR revalidation is sufficient; travelers don't need real-time updates.

---
_Document standards and patterns, not every dependency_
