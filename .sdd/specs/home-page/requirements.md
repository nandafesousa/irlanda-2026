# Documento de Requisitos — Página Home

## Introdução

A Página Home é a landing page do aplicativo de viagem Irlanda & UK 2026. Ela serve como ponto de entrada para os dois viajantes e familiares, apresentando uma visão geral da trip de 18 dias através de um header com gradiente roxo, cards de estatísticas glassmorphism, um mini-mapa horizontal do percurso entre as 6 cidades e links de acesso rápido para as três seções principais (Roteiro, Hospedagens, Transportes).

---

## Requisitos

### Requisito 1: Cabeçalho com Identidade Visual

**Objetivo:** Como viajante, quero ver um header visualmente marcante com o título da viagem, para que eu identifique imediatamente o aplicativo e sinta a identidade premium da trip.

#### Critérios de Aceitação

1. The Página Home shall render a full-width hero header with a purple gradient background using CSS custom properties `var(--grad-start)` and `var(--grad-end)` (i.e., `linear-gradient(135deg, var(--grad-start) 0%, var(--grad-end) 100%)`); no hardcoded hex values shall appear in the component.
2. The Página Home shall display the trip title "Irlanda & Reino Unido 2026" as a prominent `h1` heading with `font-weight: 800` and white color.
3. The Página Home shall display a subtitle or tagline beneath the title indicating the trip period (Aug–Sep 2026) and the number of travelers.
4. When the page is rendered on a screen ≤ 480px wide, the Página Home shall reduce the `h1` font size to no larger than `1.7rem`.
5. The Página Home shall include a subtle SVG fractal noise texture overlay on the header background at `opacity: 0.04` to add visual depth.
6. The Página Home shall use `background-attachment: fixed` on the body gradient to produce a parallax scroll effect.

---

### Requisito 2: Cards de Estatísticas da Viagem

**Objetivo:** Como viajante, quero ver as principais métricas da viagem em cards glassmorphism, para que eu tenha uma leitura rápida dos dados mais relevantes (dias, cidades, trechos, amigas).

#### Critérios de Aceitação

1. The Página Home shall display exactly four `StatCard` components showing the following statistics: **18 dias**, **6 cidades**, **5 trechos** e **2 amigas**.
2. The Página Home shall render each `StatCard` with glassmorphism styling: `background: rgba(255,255,255,0.12)`, `backdrop-filter: blur(16px)`, `border: 1px solid rgba(255,255,255,0.25)` e `border-radius: 16px`.
3. The Página Home shall render the numeric value of each stat in amber (`color: var(--warning)`) with `font-size: 2.4rem` e `font-weight: 800`.
4. The Página Home shall display a descriptive label beneath each stat number with white color and appropriate opacity.
5. When the page is rendered on a screen ≤ 768px wide, the Página Home shall arrange the `StatCard` components in a 2×2 grid layout.
6. When the page is rendered on a screen ≥ 769px wide, the Página Home shall arrange the `StatCard` components in a single horizontal row (4 columns).
7. If the stat data is unavailable or empty, the Página Home shall display the hard-coded default values (18, 6, 5, 2) without requiring a Google Sheets fetch.

---

### Requisito 3: Mini-mapa Visual do Percurso

**Objetivo:** Como viajante, quero ver um mini-mapa horizontal com as 6 cidades do percurso e setas entre elas, para que eu visualize a ordem e a progressão geográfica da viagem de forma intuitiva.

#### Critérios de Aceitação

1. The Página Home shall render a horizontal route map showing the 6 destination cities in chronological order: Dublin → Belfast → Edinburgh → Liverpool → London → Dublin.
2. The Página Home shall display each city as a glassmorphism chip/card showing the city name, its flag/emoji and entry date.
3. The Página Home shall render a directional arrow (→) between consecutive city chips to indicate travel direction.
4. Each city chip shall use its corresponding city accent color (CSS variables `--c1` through `--c6`) for the border or background highlight.
5. When the page is rendered on a screen ≤ 768px wide, the Página Home shall allow the route map to scroll horizontally (`overflow-x: auto`) so all cities remain accessible without wrapping.
6. The Página Home shall apply `fadeInUp` entry animation to city chips using an Intersection Observer (or CSS scroll-driven animation), so that each chip's animation triggers only when it enters the viewport — ensuring chips revealed by horizontal scroll also animate on entry.

---

### Requisito 4: Links de Navegação para as Seções

**Objetivo:** Como viajante, quero ver cards ou botões de acesso rápido às três seções principais, para que eu navegue diretamente para Roteiro, Hospedagens ou Transportes a partir da Home.

#### Critérios de Aceitação

1. The Página Home shall display three navigation cards, one for each main section: **Roteiro**, **Hospedagens** e **Transportes**.
2. Each navigation card shall be implemented as an `<a>` tag linking to `/roteiro`, `/hospedagens` e `/transportes` respectively.
3. Each navigation card shall display a section icon/emoji, a title and a brief description of what the section contains.
4. When a navigation card receives a hover interaction on desktop, the Página Home shall apply a `translateY(-4px)` lift effect with deepened box-shadow (`0 18px 52px rgba(0,0,0,0.14)`).
5. When the page is rendered on a screen ≥ 769px wide, the Página Home shall display the three navigation cards side by side in a 3-column grid.
6. When the page is rendered on a screen ≤ 768px wide, the Página Home shall stack the navigation cards in a single-column layout.
7. The Página Home shall render each navigation card as a white card with `border-radius: 18px`, `box-shadow: 0 8px 32px rgba(0,0,0,0.1)` and a colored top stripe gradient using `var(--primary)` and `var(--accent)`.

---

### Requisito 5: Layout e Estrutura da Página

**Objetivo:** Como viajante, quero que o conteúdo da Home seja bem organizado e legível em qualquer dispositivo, para que eu tenha uma experiência fluida tanto no celular quanto no desktop.

#### Critérios de Aceitação

1. The Página Home shall be implemented as a Next.js server component (`app/page.tsx`) with no client-side data fetching.
2. The Página Home shall have a maximum content width of `1000px` centered with `margin: 0 auto` and `padding: 0 1.5rem`.
3. The Página Home shall render the sections in the following vertical order: Hero Header → Stats → Mini-mapa do Percurso → Links de Navegação.
4. The Página Home shall apply `slideDown` animation to the hero header section and `fadeInUp` to subsequent content sections with staggered delays.
5. While content sections are loading during SSR hydration, the Página Home shall not cause layout shift (CLS ≈ 0).
6. The Página Home shall use only CSS custom properties from `globals.css` for all brand colors — no hardcoded hex values in `app/page.tsx` or child components.

---

### Requisito 6: Responsividade da Página Home

**Objetivo:** Como viajante usando smartphone, quero que o conteúdo da Home esteja corretamente adaptado ao layout mobile, para que nenhuma seção fique oculta ou cortada pela barra de navegação inferior.

> **Nota de Arquitetura:** A lógica de renderização e comportamento da barra de navegação (top nav vs. bottom tab bar, estado ativo de cada tab, safe-area insets) pertence ao componente global `Nav` e é gerenciada pelo `app/layout.tsx` (Root Layout). Os critérios abaixo dizem respeito exclusivamente à adaptação de layout da própria Página Home.

#### Critérios de Aceitação

1. When the page is rendered on a screen ≤ 768px wide, the Página Home shall apply sufficient `padding-bottom` to its outermost container to prevent the bottom tab bar (rendered by `app/layout.tsx`) from overlapping the last content section.
2. When the page is rendered on a screen ≤ 768px wide, the Página Home shall render all content sections in a single-column stacked layout.
3. When the page is rendered on a screen ≥ 769px wide, the Página Home shall render multi-column sections (stats grid, navigation cards) using the column counts defined in Requisitos 2 and 4.
4. The Página Home shall not contain any logic for toggling, styling, or managing the active state of the `Nav` component; that responsibility belongs to `Nav` itself and `app/layout.tsx`.

---

### Requisito 7: Performance e Dados

**Objetivo:** Como viajante, quero que a Página Home carregue rapidamente, para que eu não precise esperar ao abrir o link durante a viagem.

#### Critérios de Aceitação

1. The Página Home shall be rendered server-side (SSR/SSG) by Next.js so the initial HTML is fully populated on first load without client JavaScript.
2. The Página Home shall not make any Google Sheets API calls, since all statistics are static values hard-coded in the component (18 dias, 6 cidades, 5 trechos, 2 amigas).
3. The Página Home shall not expose `GOOGLE_API_KEY` or `GOOGLE_SHEETS_ID` environment variables to the browser bundle.
4. If a runtime error occurs during page rendering, the Next.js error boundary defined in `app/error.tsx` shall display a user-friendly error message instead of a blank page or uncaught exception; the Página Home (`app/page.tsx`) shall not contain `try/catch` blocks for rendering failures.
5. The Página Home shall achieve a Lighthouse performance score ≥ 90 on mobile simulation with no render-blocking resources beyond the system font stack.
