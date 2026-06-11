# Plano de Implementação — sheets-client

## Task Format Template

---

- [x] 1. Criar os tipos de domínio em `lib/types.ts`
- [x] 1.1 Definir as interfaces `City`, `Hotel` e `Transport`
  - Criar o arquivo `lib/types.ts` com TypeScript strict mode
  - Definir `City` com os campos: `cidade`, `emoji`, `data_entrada`, `data_saida`, `noites` (number), `destaque`, `bairro`, `preco_noite`, `atividades`
  - Definir `Hotel` com os campos: `cidade`, `nome_hotel`, `data_checkin`, `data_checkout`, `noites` (number), `preco_total` (number), `moeda`, `status`, `endereco`, `link_booking`, `observacoes`
  - Definir `Transport` com os campos: `tipo`, `emoji`, `origem`, `destino`, `data`, `horario`, `duracao`, `operadora`, `status`, `preco` (number), `moeda`, `observacoes`
  - Campos numéricos (`noites`, `preco_total`, `preco`) devem ser tipados como `number`; campos textuais e de formatação variável como `string`
  - Exportar todas as interfaces — este arquivo é a fonte única de verdade para os tipos de domínio
  - _Requirements: 5.3, 5.4, 5.5, 5.6_

---

- [x] 2. Implementar o módulo `lib/sheets.ts`

- [x] 2.1 Configurar o guard server-only e a validação de variáveis de ambiente
  - Adicionar `import 'server-only'` como primeiro import do arquivo, antes de qualquer outro
  - Garantir que não exista diretiva `"use client"` no arquivo
  - Ler `GOOGLE_SHEETS_ID` e `GOOGLE_API_KEY` exclusivamente de `process.env`
  - Validar a presença de cada variável no escopo de módulo (fora de qualquer função), com proteção via `process.env.NEXT_PHASE !== 'phase-production-build'` para não bloquear builds de CI
  - Lançar `Error` descritivo com o nome exato da variável ausente caso a validação falhe em runtime
  - Nunca incluir valores literais de credenciais no código
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.2, 3.3, 3.4_

- [x] 2.2 Implementar o helper privado `fetchSheetRange`
  - Criar a função `fetchSheetRange(range: string): Promise<string[][]>` — não exportada
  - Construir a URL no formato `https://sheets.googleapis.com/v4/spreadsheets/{GOOGLE_SHEETS_ID}/values/{range}?key={GOOGLE_API_KEY}`
  - Usar `fetch` nativo (sem SDK externo), passando `{ next: { revalidate: 3600 } }` como única opção de cache
  - Lançar `Error` com status HTTP e body caso `response.ok === false`
  - Se a resposta não contiver a propriedade `values`, emitir `console.warn` identificando a aba e retornar `[]`
  - Propagar erros de rede sem silenciá-los
  - _Requirements: 2.1, 2.5, 2.6, 4.1, 4.4, 6.1, 6.2, 6.3, 6.4_

- [x] 2.3 Implementar o mapper privado `mapRowsToType`
  - Criar a função genérica `mapRowsToType<T>(tabName, requiredHeaders, rows): T[]` — não exportada
  - Tratar a linha 0 de `rows` como cabeçalho; linhas 1..N como dados
  - Localizar cada coluna obrigatória via `headers.indexOf(col)`; lançar `Error` descritivo com nome da coluna e da aba se `indexOf` retornar `-1`
  - Acessar valores de célula com coalescência nula `row[colIndex] ?? ""` para tratar truncamento de linhas pela API
  - Converter campos numéricos com `Number(raw) || 0` — nenhum componente de UI deve fazer parsing
  - _Requirements: 5.1, 5.2, 5.6_

- [x] 2.4 (P) Implementar as funções públicas de busca por aba
  - Exportar `getRoteiro()`: delegar a `fetchSheetRange('Roteiro!A:Z')`, passar os cabeçalhos obrigatórios de `City` ao mapper e retornar `City[]`
  - Exportar `getHospedagens()`: delegar a `fetchSheetRange('Hospedagens!A:Z')`, passar os cabeçalhos obrigatórios de `Hotel` ao mapper e retornar `Hotel[]`
  - Exportar `getTransportes()`: delegar a `fetchSheetRange('Transportes!A:Z')`, passar os cabeçalhos obrigatórios de `Transport` ao mapper e retornar `Transport[]`
  - As três funções são independentes entre si e podem ser implementadas em paralelo após 2.2 e 2.3 estarem concluídas
  - Nenhuma função exportada deve expor ou derivar valores de `GOOGLE_API_KEY`
  - _Requirements: 2.2, 2.3, 2.4, 3.3, 4.2, 4.3_

---

- [x] 3. Escrever testes automatizados

- [x] 3.1 Testes unitários do helper e do mapper
  - Testar `fetchSheetRange`: mockar `global.fetch` e verificar URL construída, presença de `revalidate: 3600`, lançamento de erro em HTTP 4xx/5xx e retorno de `[]` + warn quando `values` estiver ausente
  - Testar `mapRowsToType`: verificar mapeamento correto por cabeçalho, erro descritivo quando coluna obrigatória falta, e array vazio para input vazio
  - Configurar `process.env` antes de cada teste (ou usar `NEXT_PHASE=phase-production-build`) para controlar a validação de credenciais
  - _Requirements: 1.3, 2.1, 5.1, 5.2, 6.1, 6.3_

- [x] 3.2 (P) Testes de integração das funções públicas
  - Testar `getRoteiro`, `getHospedagens` e `getTransportes` com mock de `fetch` retornando fixtures de `string[][]`
  - Validar tipo de retorno e mapeamento ponta-a-ponta para cada aba
  - Cobrir o cenário de planilha vazia (`values` ausente): confirmar retorno de `[]` e chamada de `console.warn`
  - Verificar que `GOOGLE_API_KEY` não aparece em nenhum valor retornado pelas funções
  - Pode ser executado em paralelo com 3.1 pois não compartilha arquivos de teste
  - _Requirements: 2.2, 2.3, 2.4, 5.3, 5.4, 5.5, 6.3_

- [x]* 3.3 Teste de build — guard server-only
  - Importar `lib/sheets.ts` em um arquivo com diretiva `"use client"` e confirmar que o build Next.js falha
  - Documenta o comportamento esperado do `server-only` como teste de regressão
  - _Requirements: 3.1, 3.2, 3.4_
