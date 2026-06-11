# Implementation Plan — transportes-page

## Mapa de Dependências

```
Task 1 (Tipos)
  ├── Task 2 (Sheets)       ← depende de 1
  ├── Task 3 (P) (Finance)  ← depende de 1, paralelo com 2
  ├── Task 4 (Card)         ← depende de 1, paralelo com 2 e 3
  │     4.1 (P) ← inicia paralelo com 2 e 3
  │     4.2     ← sequencial após 4.1 (mesmo arquivo)
  └── Task 6 (P) (Revalidação) ← sem dependência de 2–5
Task 5 (Página) ← depende de 2, 3, 4
Task 7 (Testes) ← depende de 1–6
```

---

- [x] 1. Definir os tipos de domínio de transporte em `lib/types.ts`
  - Adicionar `TransportType = 'aviao' | 'trem' | 'ferry' | 'onibus' | 'outro'` e `PaymentStatus = 'pago' | 'pendente'`
  - Criar a constante `TRANSPORT_EMOJI` mapeando cada `TransportType` ao seu emoji, incluindo `'outro'` → `🚗`
  - Criar a interface `Transport` com todos os campos obrigatórios e opcionais (`observacoes?`), reutilizando o tipo `Currency` já existente
  - Documentar que `Transport.data` é invariavelmente ISO 8601 (`"YYYY-MM-DD"`) — pré-requisito para ordenação por `localeCompare`
  - Todos os campos devem ser `readonly`; nenhum uso de `any`
  - _Requirements: 1.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

---

- [x] 2. Implementar a busca e normalização de dados de transporte no Google Sheets
- [x] 2.1 Estender `fetchSheetRange` para aceitar e repassar opções de cache do Next.js
  - Verificar se `fetchSheetRange` atual aceita segundo parâmetro `init?: RequestInit`
  - Se não aceitar, estender sua assinatura para `fetchSheetRange(range: string, init?: RequestInit)` e repassar `init` ao `fetch` interno
  - Garantir que chamadas existentes (`getRoteiro`, `getHospedagens`) permaneçam sem alteração — parâmetro é opcional com valor padrão
  - _Requirements: 1.2_

- [x] 2.2 Implementar normalização de datas para ISO 8601
  - Criar função interna `normalizeTransportDate(raw: string): string | null`
  - Aceitar os formatos `"DD/MM"` e `"DD/MM/YYYY"` e converter para `"YYYY-MM-DD"` usando a constante `TRIP_YEAR = 2026`
  - Fazer passthrough sem alteração para strings já no formato ISO
  - Retornar `null` para qualquer formato não reconhecido
  - _Requirements: 1.7_

- [x] 2.3 Implementar normalização de linha com mapeamento de tipo e fallback resiliente
  - Criar função interna `normalizeTransportRow(raw: Record<string, string>, index: number): Transport | null`
  - Normalizar campos: `status → .trim().toLowerCase()`; `preco → Number` + verificação `isNaN`; demais textos → `.trim()`
  - Mapear a coluna `tipo` (case-insensitive) para `TransportType`; qualquer valor não reconhecido → `'outro'` com `TRANSPORT_EMOJI['outro']` — a linha é **preservada**, nunca descartada por tipo
  - Descartar linha com `console.warn` (e retornar `null`) apenas quando `data` for inválida (via `normalizeTransportDate`) ou `preco` resultar em `NaN`
  - Depende de 2.2 (usa `normalizeTransportDate` internamente)
  - _Requirements: 1.7, 1.8_

- [x] 2.4 Implementar `getTransportes` como função principal de busca
  - Chamar `fetchSheetRange('Transportes!A:Z', { next: { revalidate: 3600 } })` passando a opção de ISR
  - Mapear as linhas retornadas via `normalizeTransportRow`, filtrando os valores `null` com `.filter(Boolean)`
  - Gerar `id` único por trecho no formato `"${idx+1}-${origem}-${destino}"`
  - Exportar como `export async function getTransportes(): Promise<Transport[]>`
  - Adicionar `import 'server-only'` no topo do arquivo (ou confirmar que já existe)
  - _Requirements: 1.1, 1.2, 1.4, 1.5_

---

- [x] 3. (P) Estender o helper financeiro com cálculo de totais de transporte
  - Adicionar `calculateTransportesTotals(transports: Transport[]): TransportTotalsByMoeda` em `lib/finance.ts` (arquivo existente, sem duplicar)
  - Agrupar `preco` por `moeda` (após normalização em `getTransportes`), acumulando `paid` e `pending` separadamente; `total = paid + pending`; `count` = número de registros por moeda
  - Retornar `{}` para array vazio sem lançar exceção
  - Função pura — sem I/O, sem `console.*`, sem `import 'server-only'`
  - Pode ser executado em paralelo com a Task 2 (arquivo diferente, depende apenas dos tipos da Task 1)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

---

- [x] 4. Construir o componente `TransportCard`
- [x] 4.1 (P) Implementar layout e exibição de todos os campos do card
  - Criar `components/TransportCard.tsx` como Server Component puro (sem `"use client"`)
  - Aceitar props `transport: Transport` e `index: number`; nenhum `any`
  - Estrutura: emoji grande à esquerda + bloco de informações à direita (`flex items-start gap-4`)
  - Exibir rota em negrito no formato `{origem} → {destino}`
  - Exibir meta row com data, horário, duração e operadora em grid de 2 colunas com fundo `var(--light)` e `border-radius: 10px`
  - Renderizar bloco de `observacoes` apenas quando presente; renderizar preço via `Intl.NumberFormat` locale `pt-BR` apenas quando `preco` e `moeda` estiverem presentes
  - Pode ser iniciado em paralelo com as Tasks 2 e 3 (arquivo diferente, depende apenas da Task 1)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

- [x] 4.2 Aplicar identidade visual: badge de status, top stripe e animações de entrada
  - Top stripe fixa no topo do card com `linear-gradient(90deg, var(--primary), var(--accent))` via `style` inline
  - Badge roxo `"✅ Pago"` quando `status === 'pago'`: `background: rgba(108,92,231,0.1)`, `color: var(--primary)`, `border: 1px solid rgba(108,92,231,0.25)`
  - Badge âmbar `"⏳ Pendente"` para demais casos: `background: rgba(253,203,110,0.15)`, `color: #c07900`, `border: 1px solid rgba(253,203,110,0.5)`
  - Ambos os badges com `border-radius: 20px`, `font-size: 0.78rem`, `font-weight: 600`; sem hex inline para as CSS custom properties
  - Fundo do card: `bg-white/80 backdrop-blur-md`, `rounded-[18px]`, `shadow-[0_8px_32px_rgba(0,0,0,0.1)]`
  - Hover horizontal via CSS puro: `hover:translate-x-1 hover:shadow-[0_18px_52px_rgba(0,0,0,0.14)] transition-all duration-300`
  - Animation delay com teto: `style={{ animationDelay: \`${Math.min(index, 5) * 0.1}s\`, animation: 'fadeInUp 0.6s ease-out both' }}`
  - Sequencial após 4.1 (mesmo arquivo, adiciona camada visual à estrutura existente)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.2, 6.3, 6.4, 6.5, 6.6_

---

- [x] 5. Implementar a página `/transportes`
- [x] 5.1 Implementar orquestração: fetch, ordenação cronológica e lista de cards
  - Criar `app/transportes/page.tsx` como Server Component com `export const revalidate = 3600` e `metadata` com `title: 'Transportes | Irlanda & UK 2026'`
  - Chamar `getTransportes()` e ordenar o array retornado com `[...transports].sort((a, b) => a.data.localeCompare(b.data))` (spread para não mutar o original)
  - Renderizar cabeçalho com título "Transportes" e subtítulo informando o número total de trechos
  - Renderizar lista vertical `flex flex-col gap-4` com um `TransportCard` por trecho, passando `transport` e `index`
  - Container externo: `max-w-[1000px] mx-auto px-6 pb-24 pt-10`; nenhum `@media` custom ou hex inline
  - Tipografia Segoe UI herdada de `globals.css` via `app/layout.tsx` — nenhuma declaração adicional necessária
  - _Requirements: 1.1, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 6.1, 6.7_

- [x] 5.2 Implementar seção de resumo de custos como glass panel
  - Calcular totais via `calculateTransportesTotals(transports)` no corpo da página (server-side, após a ordenação)
  - Renderizar seção glass panel (`background: var(--glass)`, `backdrop-filter: blur(16px)`, `border: 1px solid var(--glass-border)`) após a lista de cards
  - Exibir contagem de trechos pagos vs. total (ex.: "5 de 5 pagos") e totais por moeda formatados via `Intl.NumberFormat` locale `pt-BR` em linhas separadas
  - Quando houver múltiplas moedas, exibir cada total em linha própria — sem conversão implícita entre moedas
  - Valores numéricos exibidos na cor `var(--warning)` (âmbar), seguindo o padrão de stat numbers do design system
  - Nenhum hex inline nos elementos da seção
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.8_

- [x] 5.3 Implementar estado vazio e Error Boundary da rota
  - No corpo de `page.tsx`, antes de renderizar a lista: se `transports.length === 0`, renderizar glass panel com a mensagem "Nenhum trecho válido encontrado. Verifique o preenchimento da planilha." e encerrar sem renderizar a seção de resumo
  - Criar `app/transportes/error.tsx` com `"use client"`, aceitando `error: Error & { digest?: string }` e `reset: () => void`
  - Exibir mensagem amigável sem expor `error.message` nem `error.stack`; incluir botão "Tentar novamente" que chama `reset()`
  - Seguir o mesmo estilo glassmorphism de `app/hospedagens/error.tsx`
  - _Requirements: 1.6, 2.3_

---

- [x] 6. (P) Implementar a rota de revalidação protegida por token
  - Criar `app/api/revalidate/route.ts` com handler `export async function GET(request: NextRequest): Promise<NextResponse>`
  - Se `process.env.REVALIDATE_TOKEN` estiver ausente, retornar HTTP 500 `{ error: "server misconfiguration" }` imediatamente
  - Ler o `token` do query param `?token=`; token ausente → HTTP 401 `{ error: "unauthorized" }`
  - Calcular `createHash('sha256').update(value).digest()` em ambos os lados antes de `timingSafeEqual` — garante buffers de 32 bytes independentemente do comprimento do token recebido, prevenindo exceção de runtime e timing attack
  - Token válido: chamar `revalidatePath('/transportes')` e retornar HTTP 200 `{ revalidated: true }`
  - Pode ser executado em paralelo com as Tasks 2–4 (nenhuma dependência de compilação em código do projeto)
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

---

- [x] 7. Cobertura de testes
- [x] 7.1 (P) Testes unitários para normalização de dados e helper financeiro
  - `normalizeTransportDate`: `"27/08"` → `"2026-08-27"`; `"27/08/2026"` → `"2026-08-27"`; passthrough para ISO; formato inválido → `null`
  - `normalizeTransportRow`: tipo desconhecido (ex.: `"taxi"`) → `tipo: 'outro'`, linha preservada; `status = " PAGO "` → `PaymentStatus = 'pago'`; `preco = "abc"` → linha descartada
  - `calculateTransportesTotals`: agrupamento correto com BRL e EUR em chaves separadas; `paid + pending === total`; array vazio → `{}`
  - _Requirements: 1.7, 1.8, 5.2, 5.3, 5.4, 5.5_

- [x] 7.2 (P) Testes de integração para a página e a rota de revalidação
  - `TransportesPage` com mock misto (BRL + EUR): seção de resumo exibe ambas as moedas formatadas
  - `TransportesPage` com array desordenado: cards renderizados em ordem cronológica ascendente
  - `TransportesPage` com array vazio: glass panel de estado vazio presente; seção de resumo ausente
  - `GET /api/revalidate?token=TOKEN_CORRETO` → HTTP 200 `{ revalidated: true }`
  - `GET /api/revalidate?token=TOKEN_ERRADO` → HTTP 401; `GET /api/revalidate` sem token → HTTP 401
  - _Requirements: 1.6, 2.1, 5.1, 7.1, 7.2_

- [x]* 7.3 Testes E2E e de UI para verificação visual
  - Acesso a `/transportes`: lista visível com todos os cards renderizados na página
  - Viewport 375px: cards full-width sem overflow horizontal
  - Card com `status = 'pago'`: badge roxo com texto `"✅ Pago"` visível
  - Seção de resumo presente com valores formatados por moeda
  - Hover em card (desktop): deslocamento horizontal `translateX` observável
  - _Requirements: 2.6, 3.1, 4.1, 5.1, 6.4_
