# Research & Design Decisions — hospedagens-page

## Summary

- **Feature**: `hospedagens-page`
- **Discovery Scope**: Extension (brownfield — código parcialmente implementado em `app/accommodations/`)
- **Key Findings**:
  - A rota alvo é `/hospedagens` (conforme `Nav.tsx`), mas o arquivo existente está em `app/accommodations/page.tsx` — rota quebrada; o design cria `app/hospedagens/`.
  - `HotelCard.tsx` usa `onMouseEnter/onMouseLeave` para hover, o que exige `"use client"` em App Router. Como o efeito é puramente visual, o design substitui por CSS transition + Tailwind `hover:` para manter o componente como Server Component.
  - `getHospedagens` em `sheets.ts` usa `Number(raw) || 0` para campos numéricos (trata NaN→0) mas não normaliza `status` com `.trim().toLowerCase()` — risco de comparação falha contra `HotelStatus`.

---

## Research Log

### Rota `/hospedagens` vs `app/accommodations/`

- **Context**: `Nav.tsx` já define `{ href: '/hospedagens', label: 'Hospedagem', icon: '🏨' }`. O arquivo de página existente está em `app/accommodations/page.tsx`.
- **Findings**: O link de navegação está apontando para uma rota inexistente (`/hospedagens`). A rota `/accommodations` existe mas nunca é acessada via nav.
- **Implications**: O design especifica `app/hospedagens/page.tsx` como destino canônico. O arquivo `accommodations/page.tsx` existente servirá de referência de implementação e será substituído (ou renomeado).

### HotelCard e "use client"

- **Context**: `HotelCard.tsx` usa `onMouseEnter` / `onMouseLeave` para mutar `style` diretamente no DOM — requer `"use client"` no App Router do Next.js.
- **Findings**: O arquivo não declara `"use client"`, o que causaria erro de build. O efeito hover (`translateY(-4px)`, sombra maior) é puramente visual e não tem estado React.
- **Implications**: Design resolve com CSS `transition` + classes Tailwind `hover:-translate-y-1 hover:shadow-xl` — elimina necessidade de `"use client"`, mantém HotelCard como Server Component e reduz bundle JS.

### ISR: `next: { revalidate }` vs `export const revalidate`

- **Context**: `fetchSheetRange` já usa `{ next: { revalidate: 3600 } }` na chamada `fetch`. O `accommodations/page.tsx` não declara `export const revalidate`.
- **Findings**: Quando se usa um fetch nativo do browser interceptado pelo Next.js, `next: { revalidate }` funciona. Porém, se no futuro `sheets.ts` migrar para um SDK (ex.: `googleapis`), esse mecanismo deixa de funcionar. `export const revalidate = 3600` na `page.tsx` funciona em ambos os casos e é o padrão recomendado pelo App Router para garantir ISR no nível da rota.
- **Implications**: O design especifica `export const revalidate = 3600` em `page.tsx` como contrato obrigatório.

### Normalização de dados em `getHospedagens`

- **Context**: `mapRowsToType` aplica `Number(raw) || 0` para campos numéricos (o `|| 0` cobre NaN). Para `status`, a função retorna o valor raw sem normalização — a planilha pode conter `"Confirmado"`, `" confirmado "`, etc.
- **Findings**: `HotelStatus` é `'confirmado' | 'pendente'`. Sem normalização, comparações como `hotel.status === 'confirmado'` falham silenciosamente para valores com espaços ou casing diferente.
- **Implications**: O design especifica que `getHospedagens` aplica `.trim().toLowerCase()` em `status` e descarta linhas cujo status normalizado não seja `'confirmado'` nem `'pendente'`.

### Glassmorphism nos cards vs fundo sólido

- **Context**: `HotelCard.tsx` usa `background: 'white'`. A identidade visual do site usa glassmorphism: cards semi-transparentes sobre gradiente fixo.
- **Findings**: `bg-white/80 backdrop-blur-md` do Tailwind traduz-se para `background: rgba(255,255,255,0.80); backdrop-filter: blur(12px)` — mantém legibilidade do texto com contraste WCAG AA enquanto preserva a profundidade visual do gradiente.
- **Implications**: O design especifica `bg-white/80 backdrop-blur-md` para o `HotelCard`.

---

## Architecture Pattern Evaluation

| Opção | Descrição | Pontos Fortes | Riscos | Decisão |
|-------|-----------|---------------|--------|---------|
| Server Component puro para HotelCard | CSS hover, sem `"use client"` | Menor bundle, SSR completo, sem hidratação por card | Hover depende de CSS (não JS) — suficiente para este caso | **Selecionada** |
| Client Component para HotelCard | `"use client"` + useState/ref para hover | Mais flexível para futuras interações | Hidratação por card, ~4–8 KB JS extras | Descartada — over-engineering |
| Seção de totais como componente separado | `<TotalsSection hotels={hotels} />` | Separação de responsabilidade | Complexidade desnecessária para aritmética simples | Descartada — totais ficam inline em `page.tsx` |

---

## Design Decisions

### Decision: `app/hospedagens/` como rota canônica (não `accommodations/`)

- **Context**: Nav usa `/hospedagens`; planilha de planejamento usa `/hospedagens`; idioma do projeto é pt-BR.
- **Alternatives**: (1) Renomear pasta `accommodations/` → `hospedagens/`. (2) Criar `app/hospedagens/` como novo arquivo.
- **Selected Approach**: Criar `app/hospedagens/page.tsx` e `app/hospedagens/error.tsx` do zero, usando o código de `accommodations/page.tsx` como referência de implementação. Remover `app/accommodations/`.
- **Rationale**: Consistência com nav, URL amigável em pt-BR, sem hacks de redirecionamento.

### Decision: Totais financeiros inline em `page.tsx` (sem componente separado)

- **Context**: Os cálculos de totais são aritmética pura sobre `Hotel[]` — 4 linhas de `reduce`.
- **Selected Approach**: Calcular diretamente no corpo assíncrono de `HospedagensPage` e renderizar como JSX inline.
- **Rationale**: Sem lógica de negócio suficientemente complexa para justificar extração. Alinha com o princípio da steering de "flat and simple — this is a 4-page app, not a platform".

### Decision: Normalização em `getHospedagens` sem Zod

- **Context**: O req 1.6 menciona "Zod ou validação equivalente". A steering diz "keep simple, no SDK needed for read-only access".
- **Selected Approach**: Normalização explícita dentro de `getHospedagens` usando `.trim().toLowerCase()` e `Number(raw.trim())` + `isNaN` check, com descarte de linhas inválidas via `filter`.
- **Rationale**: Mantém zero dependências externas adicionais; a validação necessária é simples o suficiente para ser feita com JS nativo.

---

## Risks & Mitigations

- **Rota duplicada temporária** (`accommodations/` + `hospedagens/`): Remover `app/accommodations/` como parte das tarefas de implementação para evitar confusão.
- **`backdrop-filter` suporte**: Safari < 15.4 não suportava `backdrop-filter` sem prefixo. Mitigação: usar `WebkitBackdropFilter` como fallback inline (padrão já adotado no `accommodations/page.tsx` existente).
- **Totais incorretos por moeda desconhecida**: Se a planilha tiver uma moeda não prevista em `Currency`, o groupBy silenciosamente inclui o valor. Mitigação: o tipo `Currency = 'EUR' | 'GBP' | 'BRL'` já restringe os valores via TypeScript + normalização em `getHospedagens`.
