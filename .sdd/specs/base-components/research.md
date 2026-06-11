# Research & Design Decisions

## Summary
- **Feature**: `base-components`
- **Discovery Scope**: Extension — ambos os componentes existem como stubs em `src/components/`; `globals.css` tem tokens de marca mas falta as 4 variáveis semânticas exigidas pelos requirements (Req 7.3).
- **Key Findings**:
  1. `Nav.tsx` e `StatCard.tsx` são stubs compiláveis; não há lógica, estilos ou props de ícone implementados.
  2. `Nav` deve ser Client Component (`usePathname` de `next/navigation` exige `"use client"`); `StatCard` permanece Server Component.
  3. Hover do glassmorphism sem JS: CSS-only via variável `--glass-hover` com seletor `:hover` em `@layer components` no `globals.css` — nenhum `"use client"` necessário no `StatCard`.

## Research Log

### Boundary cliente/servidor para o Nav
- **Context**: AC 3.4 exige `usePathname()` para detecção de rota; steering determina mínimo de Client Components.
- **Findings**: `usePathname()` de `next/navigation` lança erro de build se usado fora de Client Component — não há alternativa server-side no App Router. Nav é o único componente deste spec que precisa do boundary.
- **Implications**: `Nav` recebe `"use client"`; `StatCard` permanece server. Alinha com steering.

### Hover glassmorphism sem JS no StatCard
- **Context**: AC 5.5 proíbe manipulação de opacidade via JS; componente deve ser Server Component.
- **Findings**: CSS `:hover` pseudo-class funciona em qualquer elemento independente de ser renderizado server-side. Definir `.glass-card` em `@layer components` no `globals.css` com `background: var(--glass)` e `.glass-card:hover { background: var(--glass-hover) }` resolve sem Client Component.
- **Implications**: Classes em `@layer components` no `globals.css` são incluídas diretamente no CSS — não passam pelo scanner de conteúdo do Tailwind, portanto não são purgadas.

### Placement da constante `NAVIGATION_ROUTES`
- **Context**: Req 4.1 e 4.4 exigem fonte única de verdade para os dados de navegação.
- **Alternatives**: (A) Escopo do arquivo `Nav.tsx` — colocação; (B) `lib/navigation.ts` — abstração prematura para 4 rotas.
- **Selected**: Opção A. Único consumidor é `Nav`; extrair para lib criaria acoplamento desnecessário (princípio de steering: simplicidade flat).
- **Trade-off**: Se algum Server Component precisar da lista no futuro, será necessária extração. Aceitável para app de 4 páginas.

### Adições ao `globals.css`
- **Context**: Req 7.3 exige variáveis semânticas para backgrounds de nav e hover glass.
- **Current state**: `globals.css` tem `--glass` e `--glass-border`; não tem `--nav-bg-desktop`, `--nav-bg-mobile`, `--nav-hover-desktop`, `--glass-hover`.
- **Implications**: `globals.css` deve ser atualizado neste spec antes da implementação dos componentes. As 4 variáveis novas devem ir no bloco `:root`.

## Architecture Pattern Evaluation

| Opção | Descrição | Vantagens | Riscos |
|-------|-----------|-----------|--------|
| Cliente parcial (apenas Nav) | Só Nav usa `"use client"`; StatCard permanece server | Bundle mínimo; alinha com steering | Nenhum para este escopo |
| Cliente total (ambos) | Ambos usam `"use client"` | Hover mais simples via useState | Bundle maior; viola steering |

**Selecionado**: Cliente parcial (apenas Nav).

## Design Decisions

### Decision: Hover do StatCard via classe CSS `glass-card`
- **Context**: Req 5.5 — glassmorphism hover sem JS; componente deve ser Server Component.
- **Alternatives Considered**:
  1. Classe CSS em `globals.css` via `@layer components` com seletor `:hover`
  2. Tailwind arbitrary property `hover:[background:var(--glass-hover)]` no JSX
  3. `"use client"` + `useState` para controle de hover
- **Selected Approach**: Opção 1 — classe `.glass-card` em `@layer components` no `globals.css`.
- **Rationale**: Mantém a semântica de hover na camada de design system; `StatCard` aplica apenas a classe; nenhum boundary cliente necessário.
- **Trade-offs**: Adiciona classe utilitária ao `globals.css`; overhead mínimo.

### Decision: `isActive` — startsWith vs igualdade estrita
- **Context**: AC 3.3 — sub-rotas futuras (ex: `/roteiro/dia-1`) devem manter o item `/roteiro` ativo.
- **Alternatives Considered**:
  1. Igualdade estrita para todos — quebra sub-rotas
  2. `startsWith` para todos — `/` fica sempre ativo (falso positivo)
  3. Estrita para `/`, `startsWith` para demais — correto
- **Selected Approach**: Opção 3.
- **Rationale**: Evita falso positivo em Home; suporta sub-rotas sem alteração futura.
- **Follow-up**: Se existir rota `/roteiro-extra`, `startsWith('/roteiro')` causaria falso positivo — ajustar para separador `/` se necessário.

## Risks & Mitigations
- Bottom nav cobre conteúdo da página → as páginas que usam Nav devem aplicar `padding-bottom` equivalente à altura da bottom nav (~64px + safe-area); este é um constraint documentado para as specs de página.
- `env(safe-area-inset-bottom)` não suportado em browsers antigos → progressive enhancement; sem suporte, padding cai para 0 graciosamente.
- `--glass-hover` ainda não existe em `globals.css` → mitigado: este spec define a adição explicitamente como parte do Req 7.3 / task de globals.css.

## References
- Next.js `usePathname` — https://nextjs.org/docs/app/api-reference/functions/use-pathname
- CSS `env()` safe-area-inset — https://developer.mozilla.org/en-US/docs/Web/CSS/env
- Tailwind `@layer components` — https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes
