# Requirements Document

## Introdução

O `sheets-client` é o módulo de acesso a dados da aplicação de viagem (Euro 2026). Ele encapsula toda a comunicação com a Google Sheets API v4, expondo funções assíncronas tipadas — uma por aba da planilha (`Roteiro`, `Hospedagens`, `Transportes`) — que são chamadas exclusivamente em Server Components do Next.js. A chave da API nunca chega ao browser; os dados são cacheados por 1 hora via ISR.

---

## Requirements

### Requirement 1: Configuração de Variáveis de Ambiente

**Objetivo:** Como desenvolvedor, quero que o cliente valide as credenciais de forma centralizada na inicialização do módulo, para que a ausência de qualquer variável quebre o build imediatamente e não de forma dispersa em cada função.

#### Critérios de Aceitação

1. The Sheets Client shall ler `GOOGLE_SHEETS_ID` e `GOOGLE_API_KEY` exclusivamente de variáveis de ambiente (`process.env`).
2. The Sheets Client shall validar a presença de `GOOGLE_SHEETS_ID` e `GOOGLE_API_KEY` de forma centralizada no escopo do módulo (fora de qualquer função), de modo que a validação ocorra ao carregar o arquivo e não na primeira chamada de uma função.
3. If qualquer uma das variáveis obrigatórias não estiver definida no momento de carga do módulo, the Sheets Client shall lançar um `Error` descritivo identificando o nome exato da variável ausente antes de realizar qualquer requisição.
4. The Sheets Client shall nunca conter valores literais das credenciais no código-fonte.

---

### Requirement 2: Funções de Busca por Aba

**Objetivo:** Como page component do Next.js, quero chamar uma função tipada por aba da planilha, para que cada página acesse apenas os dados que precisa sem conhecer detalhes da API.

#### Critérios de Aceitação

1. The Sheets Client shall conter uma função utilitária privada (não exportada) `fetchSheetRange(range: string): Promise<string[][]>` que centraliza a construção da URL, a injeção das credenciais, a configuração de cache e o tratamento de resposta HTTP.
2. The Sheets Client shall exportar uma função assíncrona `getRoteiro` que delega o fetch a `fetchSheetRange('Roteiro!A:Z')` e retorna `City[]`.
3. The Sheets Client shall exportar uma função assíncrona `getHospedagens` que delega o fetch a `fetchSheetRange('Hospedagens!A:Z')` e retorna `Hotel[]`.
4. The Sheets Client shall exportar uma função assíncrona `getTransportes` que delega o fetch a `fetchSheetRange('Transportes!A:Z')` e retorna `Transport[]`.
5. When `fetchSheetRange` é chamada, the Sheets Client shall construir a URL no formato `https://sheets.googleapis.com/v4/spreadsheets/{GOOGLE_SHEETS_ID}/values/{range}?key={GOOGLE_API_KEY}`.
6. The Sheets Client shall utilizar `fetch` nativo (sem SDK externo) para as requisições HTTP.

---

### Requirement 3: Execução Exclusiva no Servidor

**Objetivo:** Como responsável pela segurança do aplicativo, quero garantir que as credenciais da API jamais sejam enviadas ao browser, para que a chave não possa ser extraída pelo usuário final — inclusive por erro acidental de importação.

#### Critérios de Aceitação

1. The Sheets Client shall importar o pacote `server-only` no topo do arquivo, de modo que o Next.js falhe o build imediatamente caso o módulo seja incluído em qualquer bundle de Client Component.
2. The Sheets Client shall ser implementado sem diretiva `"use client"`.
3. The Sheets Client shall não exportar nenhum valor derivado de `GOOGLE_API_KEY` que pudesse ser serializado e enviado ao cliente.
4. While executando no contexto de Server Component, the Sheets Client shall garantir que `process.env.GOOGLE_API_KEY` permaneça fora do bundle do browser gerado pelo Next.js.

---

### Requirement 4: Cache e Revalidação ISR

**Objetivo:** Como viajante usando o app, quero que os dados estejam sempre atualizados sem impactar o desempenho de carregamento, para que a experiência seja rápida mesmo com dados dinâmicos.

#### Critérios de Aceitação

1. The Sheets Client shall configurar `{ next: { revalidate: 3600 } }` exclusivamente dentro de `fetchSheetRange`, de modo que qualquer alteração no tempo de cache seja feita em um único lugar.
2. While o cache ISR estiver válido (menos de 3600 segundos desde a última revalidação), the Sheets Client shall retornar os dados em cache sem fazer nova requisição à API do Google Sheets.
3. When o cache ISR expirar, the Sheets Client shall revalidar os dados em background na próxima requisição de página.
4. The Sheets Client shall não implementar nenhum mecanismo de cache próprio além do `fetch` com `revalidate`, evitando duplicação com o cache do Next.js.

---

### Requirement 5: Transformação e Tipagem dos Dados

**Objetivo:** Como developer de componentes, quero receber arrays de objetos fortemente tipados, para que os props dos componentes sejam type-safe sem lógica de parsing dispersa.

#### Critérios de Aceitação

1. When os dados brutos da Sheets API são recebidos (formato `values: string[][]`), the Sheets Client shall tratar a primeira linha como cabeçalho e mapear as demais linhas para as propriedades dos tipos TypeScript usando o nome do cabeçalho como chave — nunca por índice de coluna fixo.
2. If um cabeçalho obrigatório (ex.: `cidade` na aba Roteiro) não for encontrado na primeira linha, the Sheets Client shall lançar um `Error` descritivo identificando o nome da coluna ausente e o nome da aba (ex.: `"Coluna 'cidade' não encontrada na aba Roteiro"`).
3. The Sheets Client shall retornar `City[]` de `getRoteiro`, onde cada `City` contém no mínimo: `cidade`, `emoji`, `data_entrada`, `data_saida`, `noites`, `destaque`, `bairro`, `preco_noite` e `atividades`.
4. The Sheets Client shall retornar `Hotel[]` de `getHospedagens`, onde cada `Hotel` contém no mínimo: `cidade`, `nome_hotel`, `data_checkin`, `data_checkout`, `noites`, `preco_total`, `moeda`, `status`, `endereco`, `link_booking` e `observacoes`.
5. The Sheets Client shall retornar `Transport[]` de `getTransportes`, onde cada `Transport` contém no mínimo: `tipo`, `emoji`, `origem`, `destino`, `data`, `horario`, `duracao`, `operadora`, `status`, `preco`, `moeda` e `observacoes`.
6. The Sheets Client shall usar os tipos definidos em `lib/types.ts` — nunca redefinir interfaces localmente.

---

### Requirement 6: Tratamento de Erros

**Objetivo:** Como desenvolvedor, quero que erros de API sejam sinalizados de forma clara, para que problemas de configuração ou indisponibilidade da planilha sejam diagnosticados rapidamente.

#### Critérios de Aceitação

1. If a Google Sheets API retornar um status HTTP diferente de 2xx, the Sheets Client shall lançar um `Error` contendo o status HTTP e o texto de erro retornado pela API.
2. If a requisição de rede falhar (timeout, DNS, etc.), the Sheets Client shall propagar o erro original sem silenciá-lo, permitindo que o Next.js exiba a página de erro padrão.
3. If o corpo da resposta não contiver a propriedade `values`, the Sheets Client shall emitir um `console.warn` identificando a aba afetada e retornar um array vazio (`[]`) em vez de lançar um erro de runtime, sinalizando ao desenvolvedor que a planilha pode estar vazia ou resetada.
4. The Sheets Client shall não capturar erros silenciosamente; qualquer `catch` interno deve relançar ou logar o erro antes de encerrar.
