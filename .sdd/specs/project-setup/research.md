# Research & Design Decisions: project-setup

## Summary
- **Feature**: `project-setup`
- **Discovery Scope**: Simple Addition — greenfield scaffold with fully-prescriptive requirements
- **Key Findings**:
  - Tailwind v3 RGB-channel opacity pattern requires space-separated channel values (`108 92 231`), not comma-separated; comma syntax silently breaks opacity modifiers.
  - `"moduleResolution": "bundler"` is the correct Next.js 14 tsconfig setting; `node16` requires explicit `.js` extensions in relative imports and adds unnecessary friction.
  - Fixed-position `div` layers for the page background is the correct iOS Safari / Android Chrome workaround — `background-attachment: fixed` causes full repaint per scroll frame in WebKit.

---

## Research Log

### Tailwind v3 RGB-channel pattern
- **Context**: Requirements 4.2 and 4.3 require opacity modifiers (`bg-primary/10`, `text-accent/80`) to work via CSS custom properties.
- **Sources Consulted**: Tailwind CSS v3 docs — "Using CSS variables"; Tailwind v3 changelog
- **Findings**:
  - Tailwind v3 injects `<alpha-value>` at build time into `rgb(var(--token-rgb) / <alpha-value>)`.
  - CSS variables must hold space-separated channels: `--primary-rgb: 108 92 231` (not `108, 92, 231`).
  - Tailwind v4 changes this approach entirely (uses `@theme` directive); the project uses v3 based on `tailwind.config.ts` in requirements.
- **Implications**: `globals.css` `:root` must define both `--primary` (hex) and `--primary-rgb` (space-separated channels) for every brand color.

### iOS Safari background-attachment: fixed
- **Context**: Requirement 3.3 explicitly forbids `background-attachment: fixed` and mandates two fixed `div` layers.
- **Sources Consulted**: MDN — background-attachment; WebKit bug tracker
- **Findings**:
  - `background-attachment: fixed` triggers a full repaint on every scroll event in iOS Safari and several Android Chrome versions, producing visible jank.
  - Fixed-position `div` layers live in a separate GPU compositing layer and do not repaint during scroll.
- **Implications**: `layout.tsx` renders two `div` elements (gradient + noise overlay) as the first children of `<body>`, both with `position: fixed; inset: 0`.

### moduleResolution: bundler vs node16
- **Context**: Requirement 2.2 allows either `"bundler"` or `"node16"`.
- **Sources Consulted**: Next.js 14 TypeScript docs; TypeScript 4.7 and 5.0 release notes
- **Findings**:
  - `"bundler"` was introduced in TypeScript 4.7 to model bundler semantics (no `.js` extension required in imports, respects `exports` field in `package.json`).
  - Next.js 14's `create-next-app` defaults to `"moduleResolution": "bundler"`.
  - `"node16"` requires explicit `.js` extensions in relative imports — unnecessary overhead for a bundler project.
- **Implications**: Use `"moduleResolution": "bundler"`.

---

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations |
|--------|-------------|-----------|---------------------|
| Server-only scaffold | All files are server components; zero `"use client"` directives | Simplest; no hydration overhead; credentials never reach the browser | Adding interactivity later requires explicit `"use client"` refactors (expected behavior) |
| Client-first scaffold | All components use `"use client"` | Slightly easier for interactive additions later | Risk of env var leakage; violates steering principle; unnecessary at scaffold phase |

**Selected**: Server-only scaffold. `"use client"` directives are added in subsequent specs only when explicit interactivity is required (e.g., expandable city cards, mobile nav toggle).

---

## Design Decisions

### Decision: `@/` path alias maps to `./src`
- **Context**: Requirement 1.3 specifies `@/` → `./src`.
- **Alternatives Considered**:
  1. `@/` → `./` (project root) — would include config files in alias scope
  2. `@/` → `./src/` — matches Next.js 14 defaults; all application code lives under `src/`
- **Selected Approach**: `"paths": { "@/*": ["./src/*"] }` with `"baseUrl": "."` in `tsconfig.json`.
- **Rationale**: Keeps alias scope strictly to application code; matches `create-next-app` output.
- **Trade-offs**: Root-level config files (`tailwind.config.ts`, etc.) cannot be imported via `@/`; they are never imported at runtime, so this is not a limitation.

### Decision: Placeholder type stubs use a minimal `id: string` field
- **Context**: Components must compile with no `any` (2.1, 5.3) but full domain types are out of scope for this phase.
- **Alternatives Considered**:
  1. Empty interfaces `{}` — triggers `@typescript-eslint/no-empty-interface` warning under strict-mode ESLint
  2. Single `id: string` field — non-empty, semantically valid, no lint warnings, extends cleanly in data-layer spec
- **Selected Approach**: `interface City { id: string }` etc.
- **Rationale**: Minimal, compilable, lint-clean placeholder that provides a valid anchor for subsequent spec additions.

### Decision: `noise.svg` as a committed public asset
- **Context**: Layer 2 of the background references `/noise.svg`. If absent, the page still renders correctly (noise is invisible), but the design intent is incomplete.
- **Selected Approach**: Include a minimal `public/noise.svg` placeholder in the scaffold so the overlay layer functions from the first deployment.
- **Trade-offs**: A real fractal noise SVG is a few kilobytes; negligible cost for the visual fidelity gain.

---

## Risks & Mitigations
- **Tailwind v4 migration**: If the project upgrades to Tailwind v4, the `tailwind.config.ts` RGB-channel pattern must be replaced with v4's `@theme` directive. Mitigation: add a comment in `tailwind.config.ts` flagging the v4 migration requirement.
- **`noise.svg` absent at runtime**: Noise overlay fails silently (CSS `background-image` on a missing URL is ignored). Mitigation: include `public/noise.svg` in the scaffold commit.
- **Domain type stubs too narrow**: Subsequent specs may need to add fields to `City`, `Hotel`, `Transport`. Mitigation: stubs are designed to be extended in place; no cascading renames expected.

---

## References
- [Next.js 14 — TypeScript Configuration](https://nextjs.org/docs/app/building-your-application/configuring/typescript)
- [Tailwind CSS v3 — Using CSS variables for color opacity](https://tailwindcss.com/docs/customizing-colors#using-css-variables)
- [MDN — background-attachment](https://developer.mozilla.org/en-US/docs/Web/CSS/background-attachment)
- [TypeScript 4.7 — moduleResolution: bundler](https://www.typescriptlang.org/tsconfig#moduleResolution)
