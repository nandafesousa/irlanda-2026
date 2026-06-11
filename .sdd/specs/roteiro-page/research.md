# Research & Design Decisions — roteiro-page

## Resumo

- **Feature**: `roteiro-page`
- **Discovery Scope**: Extension (consome `lib/types.ts` e `lib/sheets.ts` já projetados)
- **Principais Achados**:
  - `City` interface e `getRoteiro(): City[]` já têm contratos aprovados em specs anteriores — sem redefinição necessária.
  - A fronteira `"use client"` fica exclusivamente em `CityCard.tsx`; `page.tsx` e `error.tsx` mantêm o modelo server-component.
  - CSS Grid de 3 colunas é a abordagem mais limpa para o efeito zigzag com linha central — o `nth-child` CSS elimina lógica de posição nos componentes.

---

## Research Log

### Contratos de Dependência Existentes

- **Context**: `roteiro-page` precisa de `City[]` e de `getRoteiro()` — verificar se já estão definidos.
- **Fontes**: `.sdd/specs/typescript-types/design.md`, `.sdd/specs/sheets-client/design.md`
- **Achados**:
  - `City` em `lib/types.ts`: todos os campos `readonly`, `atividades: readonly string[]`, `noites: number`.
  - `getRoteiro()` em `lib/sheets.ts`: retorna `Promise<City[]>`, ISR 1h centralizado em `fetchSheetRange`, `server-only` guard.
- **Implicações**: `page.tsx` só precisa chamar `getRoteiro()` e passar `City` + `index` para `CityCard`. Nenhum mapeamento extra na página.

### Fronteira "use client"

- **Context**: A lógica de expansão/colapso exige `useState`. Onde colocar o `"use client"`?
- **Achados**:
  - Opção A — `page.tsx` como client: perde SSR/ISR, viola req 1.1 e 2.5.
  - Opção B — `CityCard.tsx` como client: `page.tsx` permanece server component; `CityCard` recebe `city` + `index` como props serializáveis.
- **Selecionado**: Opção B. Único componente com `"use client"`.

### Zigzag Desktop: linha conectora e CSS Grid

- **Context**: Req 2.2 exige cards alternando esquerda/direita em desktop com linha central contínua.
- **Achados**:
  - **CSS Grid 3 colunas** (`1fr 4px 1fr`) com background na coluna do meio: a coluna central só existe onde há cards adjacentes — em alturas desiguais cria lacunas visuais na linha.
  - **CSS Grid 2 colunas + pseudo-elemento `::before` no `<ol>`**: `position: absolute; left: 50%; height: 100%` no container garante traço contínuo de ponta a ponta, independente da altura dos cards. No mobile, muda para `left: 24px`.
  - **Flexbox alternado**: difícil de alinhar linha central com precisão.
- **Selecionado**: CSS Grid 2 colunas + `::before` no `<ol>`. Zigzag via `nth-child` CSS no container; `CityCard` agnóstico ao layout.

### Animação: inline style delay vs biblioteca JS

- **Context**: Req 3.6 especifica `fadeInUp` escalonado por índice sem libs JS externas.
- **Achados**:
  - `style={{ animationDelay: \`${index * 0.1}s\` }}` + `@keyframes fadeInUp` em `globals.css` é zero-dependency.
  - `animation-fill-mode: both` evita flash do card antes da animação iniciar.
- **Selecionado**: Keyframe em `globals.css` + `animationDelay` inline. Nenhuma dependência adicional.

### Expansão: max-height hack vs CSS Grid row vs ResizeObserver

- **Context**: Req 4.5 pede transição suave de ~0.3s na altura do conteúdo sem bibliotecas JS.
- **Achados**:
  - `max-height` CSS transition com valor arbitrário (ex.: `600px`): fácil, mas causa "delay fantasma" no fechamento — o CSS transiciona de `600px` até a altura real (~150px) antes de qualquer mudança visual, fazendo a animação parecer travada.
  - `ResizeObserver` + `height` JS dinâmico: transição perfeita, mas adiciona JavaScript imperativo desnecessário.
  - **CSS Grid row expansion**: `grid-template-rows: 0fr` → `1fr` com `transition-[grid-template-rows]`. O navegador calcula e anima a altura real do conteúdo nativamente; suportado em todos os browsers modernos (Chrome 57+, Firefox 66+, Safari 15+). Zero JS, zero hacks.
- **Selecionado**: CSS Grid row expansion. Padrão moderno, sem easing assimétrico, sem dependências.

### Error Boundary: error.tsx

- **Context**: Req 1.3 exige que falhas da Sheets API mantenham layout global funcional.
- **Achados**: Next.js App Router suporta `app/roteiro/error.tsx` como Error Boundary de rota — o `layout.tsx` pai (nav + gradiente) continua renderizando; apenas o conteúdo da rota `/roteiro` é substituído pela UI de erro.
- **Implicações**: `error.tsx` deve ser `"use client"` (requisito do Next.js). Recebe `error: Error` e `reset: () => void`.

---

## Decisões de Arquitetura

### Decisão: Cor de acento por índice cíclico

- **Contexto**: Req 5.1 — desacoplar cor do nome da cidade.
- **Alternativas**: (1) Map estático cidade→cor; (2) coluna `cor` na planilha; (3) índice cíclico `(index % 6) + 1`.
- **Selecionado**: Índice cíclico. Sem código alterado ao adicionar cidades.
- **Trade-off**: Cores se repetem a partir da 7ª cidade, mas mantém consistência visual sem complexidade.

### Decisão: Zigzag como responsabilidade do container

- **Contexto**: `CityCard` não deve conhecer sua posição na timeline.
- **Selecionado**: CSS `nth-child` no container `<ol>` do `page.tsx`. `CityCard` é agnóstico ao layout.
- **Trade-off**: Requer que os cards sejam filhos diretos do `<ol>` para que `nth-child` funcione corretamente.

---

## Riscos & Mitigações

- **`max-height` transition easing**: Para conteúdo com muitas atividades, a animação de fechamento pode parecer lenta. Mitigação: usar `max-height: 600px` (cobertura segura) com `transition-timing-function: ease-in`.
- **`nth-child` CSS e wrapper extra**: Se `CityCard` retornar um fragmento ou `<div>` extra, o `nth-child` no `<ol>` pode não funcionar. Mitigação: garantir que `CityCard` retorna exatamente um `<li>` como elemento raiz.
- **`atividades: readonly string[]`**: `lib/sheets.ts` já faz o split e higienização; `CityCard` consome array pronto — sem risco de falha em `.split()`.
