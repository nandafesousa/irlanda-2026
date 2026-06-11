# Project Structure

## Organization Philosophy

Feature-page-first under `app/`, shared primitives under `components/`, data access under `lib/`. Flat and simple — this is a 4-page app, not a platform.

## Directory Patterns

### Pages (`app/`)
**Location**: `/app/`  
**Purpose**: One folder per section; each has a `page.tsx` that fetches its own data server-side.  
**Example**: `app/roteiro/page.tsx` fetches `Roteiro!A:Z` and renders the timeline.

### Components (`components/`)
**Location**: `/components/`  
**Purpose**: Reusable UI pieces, one file per component. Accept typed props; contain no data-fetching logic.  
**Key components**: `Nav`, `StatCard`, `CityCard`, `HotelCard`, `TransportCard`

### Data layer (`lib/`)
**Location**: `/lib/`  
**Purpose**: Google Sheets client + TypeScript domain types.  
**Pattern**: `sheets.ts` exports one async function per sheet tab; `types.ts` exports all domain interfaces.

## Naming Conventions

- **Files/Components**: PascalCase (`CityCard.tsx`, `HotelCard.tsx`)
- **Pages**: `page.tsx` (Next.js convention)
- **Utilities**: camelCase (`lib/sheets.ts`, `lib/types.ts`)
- **CSS classes**: kebab-case (Tailwind utilities + custom properties)

## Import Organization

```typescript
// Framework first
import { Suspense } from 'react'
import type { Metadata } from 'next'

// Internal absolute (path alias)
import { getCities } from '@/lib/sheets'
import type { City } from '@/lib/types'

// Local relative
import CityCard from './CityCard'
```

**Path Aliases**:
- `@/`: maps to project root (configure in `tsconfig.json`)

## Code Organization Principles

- Data fetching belongs exclusively in `page.tsx` (server component). Components are display-only.
- No prop drilling beyond one level — if a component needs data, the parent page fetches and passes it directly.
- CSS variables for all brand colors; Tailwind for spacing, layout, and responsive breakpoints.

---
_Document patterns, not file trees. New files following patterns shouldn't require updates_
