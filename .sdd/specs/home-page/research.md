# Research & Design Decisions — home-page

## Summary

- **Feature**: `home-page`
- **Discovery Scope**: Simple Addition — todos os padrões arquiteturais já estão definidos nos specs aprovados `base-components` e `roteiro-page`
- **Key Findings**:
  - `StatCard` e `Nav` têm contratos completos em `base-components/design.md`; consumidos sem modificação
  - CSS scroll-driven animations (`animation-timeline: scroll(inline)`) não têm suporte em Safari 16/17 (iOS principal alvo); Intersection Observer API é a escolha segura
  - Todos os dados da Home são constantes estáticas — `export const revalidate = false` é válido, eliminando qualquer chamada à Sheets API

## Research Log

### Intersection Observer vs CSS Scroll-Driven Animations

- **Context**: Req 3.6 exige que chips fora da viewport (hidden por horizontal scroll em mobile) animem apenas ao entrar na tela.
- **Sources Consulted**: MDN Intersection Observer API, CSS scroll-driven animations baseline (caniuse.com)
- **Findings**:
  - `IntersectionObserver` — baseline 2018, suporte universal (Chrome 51+, Firefox 55+, Safari 12.1+)
  - CSS scroll-driven (`animation-timeline: scroll(inline)`) — disponível em Chrome 115+, Firefox 110+, Safari 17.4+ (parcial); não é baseline para dispositivos iOS com iOS < 17.4
  - `animation-play-state: paused → running` via classe CSS é a integração mais simples com IO
- **Implications**: Usar Intersection Observer + classe CSS (`is-visible`) em `RouteMap.tsx` (`"use client"`); sem bibliotecas externas

### Estratégia de Revalidação

- **Context**: Home não busca dados da Sheets API — todos os valores (18 dias, 6 cidades, etc.) são constantes hardcoded
- **Findings**: `export const revalidate = false` (ou `0`) no `app/page.tsx` sinaliza ao Next.js que a página é 100% estática; gerada uma vez no build e servida via CDN sem TTL de revalidação
- **Implications**: Zero latência de API em runtime; Lighthouse score de performance máximo possível

## Architecture Pattern Evaluation

| Opção | Descrição | Forças | Riscos |
|-------|-----------|--------|--------|
| Server Component puro + CSS animation staggered | `page.tsx` server-only; chips com `animationDelay` inline; sem IO | Zero JS de cliente | Chips fora da viewport animam antes do scroll — viola Req 3.6 |
| Server Component + `RouteMap` Client Island (IO) | Ilha mínima `"use client"` apenas para IO | Satisfaz Req 3.6; boundary mínima | Requer Client Component extra |
| CSS scroll-driven animation | CSS puro, zero JS | Elegant | Suporte incompleto em Safari iOS < 17.4 |

**Selecionado**: Server Component + `RouteMap` Client Island (IO)

## Design Decisions

### Decision: `RouteMap` como Client Component mínimo

- **Context**: Req 3.6 exige IO (ou scroll-driven animation) para chips horizontalmente scrollados
- **Alternatives Considered**:
  1. CSS scroll-driven — CSS-only mas incompatível com Safari iOS < 17.4
  2. `"use client"` em `app/page.tsx` inteiro — boundary desnecessariamente larga
- **Selected Approach**: Componente `RouteMap.tsx` isolado com `"use client"`; recebe `chips` como props serializáveis de `page.tsx` (server)
- **Rationale**: Menor boundary possível; segue o mesmo padrão de `CityCard` em `roteiro-page`
- **Trade-offs**: Um arquivo extra vs garantia de Req 3.6 em todos os browsers
- **Follow-up**: Verificar que `chips` props são serializáveis (sem `Date`, sem funções)

### Decision: `app/error.tsx` no root (não em `app/home/error.tsx`)

- **Context**: A Home fica em `app/page.tsx` (root), não em `app/home/page.tsx`
- **Selected Approach**: `app/error.tsx` colocado na raiz de `app/`; cobre a rota `/`
- **Rationale**: No App Router, `error.tsx` cobre o segmento onde está; para a rota raiz (`/`), o error boundary deve estar em `app/error.tsx`
- **Trade-offs**: `app/error.tsx` também cobre rotas que não tenham seu próprio `error.tsx` — comportamento desejado (fallback global)

## Risks & Mitigations

- `IntersectionObserver` com `useRef` array dinâmico → ref condicional (`if (el) chipRefs.current[i] = el`) evita sobrescrever com `null` na desmontagem; `chips` adicionado como dependência do `useEffect` para re-registro seguro em re-renders
- `@supports not (IntersectionObserver)` CSS não detecta APIs JS — fallback implementado no `useEffect` via `!('IntersectionObserver' in window)`; não usar CSS para este check
- `overflow-x: auto` em container com `backdrop-filter` → em alguns browsers, `overflow` pode criar novo stacking context e quebrar blur; mitigado verificando visualmente no emulador Safari durante E2E

## References

- [MDN — Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [CSS scroll-driven animations — caniuse](https://caniuse.com/css-scroll-driven-animations)
- [Next.js App Router — Static Rendering](https://nextjs.org/docs/app/building-your-application/rendering/server-components#static-rendering-default)
- [Next.js — error.js Convention](https://nextjs.org/docs/app/api-reference/file-conventions/error)
