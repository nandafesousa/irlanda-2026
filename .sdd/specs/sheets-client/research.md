# Research & Design Decisions

---

## Summary

- **Feature**: `sheets-client`
- **Discovery Scope**: Simple Integration (nova integração, sem codebase existente)
- **Key Findings**:
  - Google Sheets API v4 `values.get` retorna `{ values: string[][] }` onde a linha 0 são os cabeçalhos — mapeamento por nome de coluna é nativo ao formato.
  - O pacote `server-only` usa a export condition `react-server` do bundler: build falha imediatamente se o módulo for importado em Client Component — sem necessidade de runtime guard.
  - A validação de `process.env` no escopo de módulo (fora de funções) ocorre no momento em que o Next.js carrega o arquivo durante SSR/build, garantindo fail-fast antes de qualquer `fetch`.

---

## Research Log

### Google Sheets API v4 — Contrato de Resposta

- **Fontes**: [REST Reference — spreadsheets.values.get](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/get)
- **Findings**:
  - URL: `GET https://sheets.googleapis.com/v4/spreadsheets/{id}/values/{range}?key={key}`
  - Resposta: `{ range: string, majorDimension: "ROWS", values: string[][] }`
  - `values` ausente quando a aba está completamente vazia (sem dados).
  - Autenticação via API Key (parâmetro `?key=`) é suficiente para leitura pública — sem OAuth necessário.
  - Erros HTTP esperados: `400` (range inválido), `403` (key inválida/sem permissão), `404` (spreadsheet não encontrada).
- **Implicações**: A função utilitária privada trata a ausência de `values` e os erros HTTP — não há necessidade de SDK externo.

### Pacote `server-only`

- **Fontes**: [Next.js Docs — Composition Patterns](https://nextjs.org/docs/14/app/building-your-application/rendering/composition-patterns), [Builder.io — Server-only in App Router](https://www.builder.io/blog/server-only-next-app-router)
- **Findings**:
  - `import 'server-only'` adiciona um guard em tempo de build via export condition `react-server`.
  - Pacote NPM oficial: `server-only` (zero dependências, mantido pela Vercel).
  - Complementar a `"use client"`: não são mutuamente exclusivos.
- **Implicações**: Requisito 3.1 é atendível com uma única linha de import — sem lógica adicional.

---

## Architecture Pattern Evaluation

| Opção | Descrição | Pontos Fortes | Limitações |
|-------|-----------|---------------|------------|
| Módulo funcional único | Um arquivo `sheets.ts` com helper privado + 3 exports públicos | Simples, coeso, sem overhead | Escala mal se abas crescerem para 10+ |
| Classe `SheetsClient` | Instância com métodos por aba | Encapsulamento explícito | Over-engineering para 3 funções estáticas |
| Adaptadores por aba (arquivos separados) | `getRoteiro.ts`, `getHospedagens.ts`, etc. | Isolamento máximo | Duplicação da lógica de fetch |

**Selecionado**: Módulo funcional único — adequado à escala do projeto (4 páginas, 3 abas).

---

## Design Decisions

### Decision: Validação de env no escopo do módulo

- **Context**: Req 1.2 — validação centralizada, não dispersa em cada função.
- **Alternatives**:
  1. Validar dentro de cada função pública (`getRoteiro`, etc.) — disperso, risco de inconsistência.
  2. Validar no escopo de módulo (linha executada no `import`) — única verificação, fail-fast garantido.
- **Selected**: Opção 2.
- **Rationale**: O Next.js executa o escopo de módulo ao carregar o arquivo durante SSR/build, então qualquer variável faltante quebra o processo antes de servir qualquer requisição.
- **Trade-offs**: Módulo não pode ser importado nem para testes unitários sem as variáveis definidas (usar `vi.mock` ou setar vars no setup de testes).

### Decision: Tipos numéricos em `lib/types.ts` (não `string` universal)

- **Context**: Req 5 — "props type-safe sem lógica de parsing dispersa". Campos como `preco_total`, `noites` e `preco` representam quantidades numéricas.
- **Alternatives**:
  1. Todos os campos `string` — simples, mas distribui `Number(...)` por toda a UI.
  2. Campos numéricos como `number` nos tipos, conversão centralizada em `mapRowsToType` — UI recebe dados prontos.
- **Selected**: Opção 2. Campos `noites`, `preco_total`, `preco` são `number`; campos textuais e de formatação variável (`preco_noite`, datas) permanecem `string`.
- **Rationale**: O objetivo explícito do Req 5 é eliminar parsing na UI. Expor números como `string` contradiz esse objetivo.
- **Trade-offs**: `mapRowsToType` precisa aplicar `Number(raw) || 0`; campos com valores ausentes retornam `0` (aceitável para esta aplicação).

### Decision: Validação de env com guard `NEXT_PHASE`

- **Context**: Validação fail-fast no escopo de módulo pode quebrar `next build` em pipelines de CI que não injetam segredos na fase de compilação (somente em runtime).
- **Alternatives**:
  1. IIFE incondicional no módulo — falha no build se vars ausentes no CI.
  2. Guard `NEXT_PHASE !== 'phase-production-build'` — build passa, runtime lança erro se vars ausentes.
  3. Validação dentro de `fetchSheetRange` — lazy, perde o benefício de fail-fast.
- **Selected**: Opção 2.
- **Rationale**: Vercel injeta `NEXT_PHASE=phase-production-build` durante `next build`; segredos ficam disponíveis apenas no runtime. O guard preserva o fail-fast real (servidor), sem bloquear CI.
- **Follow-up**: Testar com `NEXT_PHASE` ausente e com vars ausentes em ambiente de dev para confirmar comportamento.

### Decision: Mapeamento por nome de cabeçalho

- **Context**: Req 5.1–5.2 — resiliência a reordenação de colunas.
- **Alternatives**:
  1. Índice fixo (`row[0]`, `row[1]`...) — frágil a mudanças na planilha.
  2. Mapear `headers[i] → value` por nome — resiliente, descritivo.
- **Selected**: Opção 2 com erro descritivo para colunas obrigatórias ausentes.
- **Trade-offs**: Leve custo de `indexOf` por linha; irrelevante para volumes de ~20 linhas.

---

## Risks & Mitigations

- **API Key exposta no bundle** — Mitigação: `server-only` + variáveis sem prefixo `NEXT_PUBLIC_`.
- **Planilha vazia retorna sem `values`** — Mitigação: `console.warn` + retorno de `[]` (Req 6.3).
- **Coluna obrigatória renomeada** — Mitigação: erro descritivo com nome da coluna e da aba (Req 5.2).
- **Truncamento de linhas pela API** — A Sheets API omite células vazias no final de cada linha (não envia string vazia). Mitigação: `row[colIndex] ?? ""` em todo acesso de célula em `mapRowsToType`.
- **Build CI quebrado por vars ausentes** — Mitigação: guard `NEXT_PHASE !== 'phase-production-build'` na validação de módulo.
- **Rate limit da API Key** — Fora do escopo: ISR de 1h reduz drasticamente chamadas (máx. ~24/dia por aba).

---

## References

- [Google Sheets API v4 — values.get](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/get)
- [Next.js Composition Patterns — Server-only](https://nextjs.org/docs/14/app/building-your-application/rendering/composition-patterns)
- [Builder.io — Server-only in Next.js App Router](https://www.builder.io/blog/server-only-next-app-router)
