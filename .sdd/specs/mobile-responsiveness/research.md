# Research & Design Decisions

## Summary
- **Feature**: `mobile-responsiveness`
- **Discovery Scope**: Extension (existing Next.js App Router codebase)
- **Key Findings**:
  - Codebase já implementa ~70% dos requisitos; os 4 gaps críticos são: (1) falta `viewport-fit=cover` no layout, (2) padding inferior centralizado — cada página gerencia individualmente com valores inconsistentes, (3) `Nav.tsx` não tem fallback `@supports` para `backdrop-filter` nem feedback `:active`, (4) `CityCard.tsx` não tem `scrollIntoView` ao expandir.
  - Tailwind v3 JIT suporta `env()` dentro de valores arbitrários (`pb-[calc(...)]`), eliminando a necessidade de classes CSS customizadas para o padding do layout.
  - A aplicação do fallback `@supports not (backdrop-filter)` exige classe CSS em `globals.css` — não pode ser expressa via `style={{}}` inline no JSX.

## Research Log

### Codebase — Estado Atual dos Breakpoints e Grids
- **Context**: Verificar quais requisitos de responsividade já estão implementados.
- **Findings**:
  - `hospedagens/page.tsx`: `grid grid-cols-1 md:grid-cols-2` — Req 2.1 / 2.3 ✅
  - `page.tsx` (Home) StatCards: `grid grid-cols-2 md:grid-cols-4` — Req 2.2 aceito (2 colunas em mobile é UX válido para stat cards compactos)
  - `roteiro/page.tsx`: media query `@media (max-width: 768px)` em `<style>` inline — Req 3.1 / 3.2 ✅
  - Todos os `h1` usam `clamp()` ou `text-[1.7rem] sm:text-[2.5rem]` — Req 4.1 / 4.3 ✅
  - `CityCard.tsx` já tem `min-h-[44px]` no botão — Req 5.3 ✅
- **Implications**: Design foca exclusivamente nos 4 gaps; não reescreve o que já funciona.

### Bottom Padding — Inconsistência entre Páginas
- **Context**: Req 1.7 / 5.4 exigem centralização em `layout.tsx`.
- **Findings**:
  - `page.tsx` (Home): `pb-[80px] md:pb-8`
  - `roteiro/page.tsx`: `padding: '2.5rem 1.5rem 6rem'` (inline style)
  - `hospedagens/page.tsx`: `padding: '2.5rem 1.5rem 6rem'` (inline style)
  - `transportes/page.tsx`: `pb-24` (6rem)
  - Valores inconsistentes: 80px vs 6rem (~96px)
- **Implications**: Centralizar em `layout.tsx` requer remover os bottom paddings individuais das páginas durante implementação.

### Viewport Meta — `viewport-fit=cover`
- **Context**: Req 6.2 exige `viewport-fit=cover`.
- **Findings**: `layout.tsx` atual não exporta `viewport` metadata. Next.js 14 App Router suporta `export const viewport: Viewport` como export separado do `metadata`.
- **Implications**: Adicionar `export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' }` em `layout.tsx`.

### `@supports` Fallback para `backdrop-filter`
- **Context**: Req 1.4 exige fallback para `rgba(80, 60, 180, 1)` quando `backdrop-filter` não é suportado.
- **Findings**: `Nav.tsx` usa `style={{ backdropFilter: 'blur(20px)' }}` inline. JSX inline styles não suportam `@supports`. Solução: extrair para classe CSS `.nav-mobile` em `globals.css` com regra `@supports not (backdrop-filter: blur(1px))`.
- **Implications**: Nav perde os inline styles de background/blur; ganha className `.nav-mobile`.

### `scrollIntoView` no CityCard — Mobile UX
- **Context**: Req 3.3 — card expandido não deve perder o topo da tela.
- **Findings**: API nativa `element.scrollIntoView({ behavior: 'smooth', block: 'start' })` cobre o caso. Delay de 150ms escolhido (não 50ms): a animação `duration-300` dura 300ms; aos 50ms o layout ainda está crescendo e o WebKit iOS pode interromper o scroll a meio caminho por cálculo de destino incompleto. Aos 150ms o layout está estabilizado o suficiente. `scroll-margin-top: 1rem` (`scroll-mt-4`) adicionado ao `<li>` para garantir respiro visual entre o card e a borda física da tela.
- **Implications**: `CityCard.tsx` recebe `useRef<HTMLLIElement>` no `<li>`, `scroll-mt-4` no className do `<li>`, e `useEffect` com `setTimeout(150ms)` com gate `if (isExpanded)`.

## Architecture Pattern Evaluation

| Opção | Descrição | Forças | Riscos |
|-------|-----------|--------|--------|
| CSS-first + Layout Shell | Centraliza padding em `layout.tsx`, fallbacks em `globals.css`, comportamento de scroll em `CityCard` | Zero dependências novas; segue padrões existentes | Requer remoção de padding per-page durante impl. |
| CSS Modules por componente | Cada componente tem seu `.module.css` | Isolamento de escopo | Quebra padrão atual do projeto (globals.css + Tailwind) |

**Selecionado**: CSS-first + Layout Shell.

## Design Decisions

### Decision: Centralização do Padding Inferior no `layout.tsx`
- **Context**: 4 páginas gerenciam padding-bottom individualmente com valores diferentes.
- **Selected Approach**: `layout.tsx` aplica `pb-[calc(var(--nav-height-mobile)+env(safe-area-inset-bottom,0px))] md:pb-0` no `<main>`. CSS variable `--nav-height-mobile: 64px` definida em `globals.css`.
- **Rationale**: Tailwind v3 JIT suporta `env()` em valores arbitrários; variável CSS permite ajuste sem tocar no TSX se a altura da nav mudar.
- **Trade-offs**: As páginas precisam ter seus bottom paddings removidos; risco de regressão visual em desktop se `md:pb-0` não for aplicado corretamente.

### Decision: Fallback `@supports` via Classe CSS
- **Context**: `@supports not (backdrop-filter)` não pode ser expresso em inline style JSX.
- **Selected Approach**: Classe `.nav-mobile` em `globals.css` com `@supports not (backdrop-filter: blur(1px))` sobreescrevendo background para `var(--nav-bg-mobile-solid)`.
- **Rationale**: Mantém o Nav.tsx limpo; o CSS é o lugar correto para feature queries de renderização.

## Risks & Mitigations
- **Regressão de padding em desktop**: `md:pb-0` deve anular o padding-bottom mobile — testar em 769px+.
- **`env()` em Tailwind arbitrary values**: Suportado no Tailwind v3 JIT mas requer aspas no CSS value quando há vírgula no fallback (`env(safe-area-inset-bottom,0px)`); evitar espaço após vírgula.
- **`scrollIntoView` em iOS Safari**: Comportamento `smooth` pode ser ignorado em iOS < 15.4; aceito como degradação graciosa (scroll ainda ocorre, sem animação).
