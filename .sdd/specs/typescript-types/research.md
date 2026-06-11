# Pesquisa e Decisões de Design — typescript-types

---

## Resumo
- **Feature**: `typescript-types`
- **Escopo de Discovery**: Adição Simples — módulo folha de definições de tipos sem lógica de negócio, sem dependências externas e sem chamadas de API.
- **Principais Descobertas**:
  - `lib/types.ts` é um módulo folha puro: zero importações internas, zero código executável.
  - `readonly` em todos os campos é a única proteção contra mutação acidental pós-parse, sem custo de runtime.
  - Tipos literais union (`'confirmado' | 'pendente'`) são preferíveis a `enum` no contexto Next.js/ESM: sem emissão de runtime, totalmente tree-shakeable, compatíveis com isolatedModules.

## Log de Pesquisa

### Estratégia de tipos para campos de data

- **Contexto**: A API do Google Sheets v4 retorna todos os valores de células como `string`. Usar `Date` exigiria parsing na camada de tipos, violando a separação entre tipo e parse. O formato de armazenamento afeta ordenação, cálculo de intervalos e exibição.
- **Fontes**: Comportamento documentado do Google Sheets API v4 — células retornadas como `ValueRange.values: string[][]`.
- **Descobertas**: Armazenar datas como `DD/MM` destrói o componente de ano, tornando impossível ordenar corretamente viagens que cruzam a virada do ano (ex.: `02/01` seria classificado como anterior a `28/12`). O formato ISO `YYYY-MM-DD` preserva ordenação lexicográfica correta e é parseável nativamente por `new Date()`.
- **Implicações**:
  - Todos os campos de data em `City`, `Hotel` e `Transport` usam `string` no formato `YYYY-MM-DD` (ex.: `"2026-08-15"`).
  - `lib/sheets.ts` normaliza o valor bruto da planilha para ISO antes de construir os objetos.
  - A formatação visual `DD/MM` é responsabilidade exclusiva dos componentes de apresentação (`CityCard`, `HotelCard`, `TransportCard`).
  - `horario` preserva o valor textual da célula (ex.: `"14:35"`) sem normalização.
  - Campos numéricos (`preco_noite`, `preco_total`, `preco`, `noites`) usam `number` e exigem conversão em `lib/sheets.ts`.

### enum vs. union literal para status e moeda

- **Contexto**: TypeScript oferece `enum`, `const enum` e union literal para conjuntos fechados de valores.
- **Fontes**: TypeScript Handbook — Enums vs. Union Types; Next.js docs sobre `isolatedModules`.
- **Descobertas**:
  - `enum` emite código JavaScript de runtime; incompatível com `isolatedModules: true` (exigido pelo Next.js 14).
  - `const enum` é inlined pelo compilador, mas quebra com Babel/SWC (transpiler padrão do Next.js).
  - Union literal (`'confirmado' | 'pendente'`) é zero-runtime, totalmente type-safe, e compatível com todos os transpilers.
- **Implicações**: `HotelStatus`, `TransportStatus` e `Currency` são type aliases de union literal.

### Padrão de módulo folha (leaf module)

- **Contexto**: A steering (`tech.md`) exige que tipos de domínio vivam em `lib/types.ts`; `structure.md` confirma que `lib/` é a camada de dados.
- **Descobertas**: Um módulo folha sem importações internas elimina dependências circulares e permite que qualquer arquivo do projeto importe sem risco de ciclos.
- **Implicações**: `lib/types.ts` não importa nada de `@/lib/sheets` ou outros módulos internos. Resultado: ciclo de dependência impossível por construção.

## Avaliação de Padrões de Arquitetura

| Opção | Descrição | Pontos Fortes | Riscos / Limitações | Decisão |
|-------|-----------|---------------|---------------------|---------|
| Módulo folha puro | Apenas `interface` e `type`, zero imports | Zero risco de ciclo; simples; compilável em isolamento | Nenhum | **Selecionado** |
| Namespace TypeScript | Agrupa tipos sob `namespace TripTypes` | Organização visual | Verboso; anti-padrão no ecossistema ESM moderno | Descartado |
| Zod schemas como fonte de verdade | `z.infer<>` gera os tipos | Validação de runtime | Dependência extra; desnecessária (dados validados em `sheets.ts`) | Descartado |

## Decisões de Design

### Decisão: `readonly` em todos os campos das interfaces

- **Contexto**: Objetos parseados de `lib/sheets.ts` não devem ser mutados por componentes ou páginas.
- **Alternativas Consideradas**:
  1. Sem `readonly` — mais simples, mas permite mutação acidental.
  2. `Readonly<T>` utility type aplicado nos pontos de uso — delegado ao consumidor, propenso a omissão.
  3. `readonly` inline em cada campo — contrato expresso na definição do tipo.
- **Abordagem Selecionada**: `readonly` inline em todos os campos de `City`, `Hotel` e `Transport`.
- **Justificativa**: Aplica imutabilidade na fonte, independentemente de como o consumidor declara a variável.
- **Trade-offs**: Levemente mais verboso; sem custo de runtime; erro de compilação explícito se alguém tentar reatribuir.

### Decisão: Campos opcionais com `?` vs. `| undefined`

- **Contexto**: `link_booking` e `observacoes` podem estar ausentes em linhas da planilha.
- **Alternativas Consideradas**:
  1. `link_booking: string | undefined` — campo obrigatório na construção, mas aceita `undefined`.
  2. `link_booking?: string` — campo genuinamente opcional; pode ser omitido ao construir o objeto.
- **Abordagem Selecionada**: `readonly link_booking?: string` (sintaxe `?`).
- **Justificativa**: Modela corretamente a ausência do dado na planilha; `lib/sheets.ts` simplesmente omite o campo quando a célula está vazia, sem precisar passar `undefined` explicitamente.

## Riscos e Mitigações

- **Expansão futura dos campos da planilha**: Novos campos exigem atualização de `lib/types.ts` e `lib/sheets.ts` simultaneamente. Mitigação: as interfaces são `readonly`, o que força o compilador a sinalizar qualquer descrepância imediatamente.
- **Inconsistência de formato de data**: `sheets.ts` deve normalizar para `DD/MM`; se não o fizer, a UI exibirá valores brutos. Mitigação: o requisito 6.6 documenta explicitamente essa responsabilidade.

## Referências

- [TypeScript Handbook — Interfaces](https://www.typescriptlang.org/docs/handbook/2/objects.html)
- [TypeScript Handbook — Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)
- [Google Sheets API v4 — ValueRange](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/get)
- [Next.js 14 — TypeScript](https://nextjs.org/docs/app/building-your-application/configuring/typescript)
