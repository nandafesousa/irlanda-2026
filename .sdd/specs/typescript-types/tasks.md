# Plano de Implementação

- [x] 1. Definir os tipos union literals auxiliares em `lib/types.ts`
  - Criar o arquivo `lib/types.ts` como módulo folha sem imports internos ou externos ao projeto
  - Exportar `HotelStatus` como union literal `'confirmado' | 'pendente'`
  - Exportar `TransportStatus` como union literal `'pago' | 'pendente'`
  - Exportar `Currency` como union literal `'EUR' | 'GBP' | 'BRL'`
  - O módulo não deve conter `any`, lógica de negócio, transformações de dados nem chamadas de API
  - _Requirements: 4.1, 4.2, 4.3, 5.2, 5.3, 5.5_

- [x] 2. Definir as interfaces de domínio

- [x] 2.1 Definir a interface `City` com todos os campos `readonly`
  - Exportar a interface `City` com os campos: `id` (string), `cidade` (string), `emoji` (string), `data_entrada` (string), `data_saida` (string), `noites` (number), `destaque` (string), `bairro` (string), `preco_noite` (number), `moeda` (Currency), `atividades` (string)
  - Aplicar `readonly` em todos os campos para garantir imutabilidade após o parse
  - Usar `Currency` como tipo do campo `moeda`; o compilador rejeitará qualquer string fora dos três valores permitidos
  - Usar `string` para `data_entrada` e `data_saida`, preservando o formato da planilha e habilitando `lib/sheets.ts` a normalizar sem impor `Date`
  - Usar `string` para `atividades`, permitindo que `lib/sheets.ts` decida como processar o valor separado por vírgulas
  - Usar `number` para `preco_noite` e `noites`; se a camada de parse passar `string`, o compilador reportará erro TS2322
  - Garantir que `id` seja `string` para comportar o identificador estável gerado por `lib/sheets.ts` (índice de linha + nome da cidade)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.7, 6.1, 6.2, 6.3, 6.5, 6.6_

- [x] 2.2 Definir a interface `Hotel` com campos opcionais e `readonly`
  - Exportar a interface `Hotel` com os campos obrigatórios: `id` (string), `cidade` (string), `nome_hotel` (string), `data_checkin` (string), `data_checkout` (string), `noites` (number), `preco_total` (number), `moeda` (Currency), `status` (HotelStatus), `endereco` (string)
  - Marcar `link_booking` e `observacoes` como opcionais com `?` do tipo `string`, pois podem estar ausentes em linhas da planilha
  - Aplicar `readonly` em todos os campos incluindo os opcionais
  - Usar `Currency` em `moeda` e `HotelStatus` em `status`; valores fora dos unions causam erro de compilação
  - Usar `string` para `data_checkin` e `data_checkout`; usar `number` para `preco_total` e `noites`
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.5, 6.1, 6.2, 6.3_

- [x] 2.3 Definir a interface `Transport` com campo opcional e `readonly`
  - Exportar a interface `Transport` com os campos obrigatórios: `id` (string), `tipo` (string), `emoji` (string), `origem` (string), `destino` (string), `data` (string), `horario` (string), `duracao` (string), `operadora` (string), `status` (TransportStatus), `preco` (number), `moeda` (Currency)
  - Marcar `observacoes` como opcional com `?` do tipo `string`
  - Aplicar `readonly` em todos os campos incluindo o opcional
  - Usar `Currency` em `moeda` e `TransportStatus` em `status`
  - Usar `string` para `data` e `horario`; usar `number` para `preco`
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.6, 6.1, 6.2_

- [x] 3. Verificar exportações nomeadas e validar compilação TypeScript
  - Confirmar que todos os seis tipos (`City`, `Hotel`, `Transport`, `HotelStatus`, `TransportStatus`, `Currency`) são exportados como named exports sem export default
  - Confirmar que o módulo não contém `any` em nenhuma posição e não importa nenhum arquivo do projeto
  - Executar `tsc --noEmit` com `strict: true` e `isolatedModules: true` e verificar saída sem erros
  - Confirmar que `import type { City, Hotel, Transport, HotelStatus, TransportStatus, Currency } from '@/lib/types'` resolve sem erros em strict mode
  - Verificar que construir um objeto `City`, `Hotel` ou `Transport` com `string` em campo `number` gera erro de compilação TS2322
  - _Requirements: 1.5, 2.5, 3.5, 4.4, 5.1, 5.2, 5.4, 6.4_

- [x]* 4. Criar testes de asserção de tipos negativos
  - Usar `// @ts-expect-error` ou `tsd` para verificar que omitir campo obrigatório ao construir `City`, `Hotel` ou `Transport` gera TS2741
  - Verificar que atribuir valor inválido (ex.: `'cancelado'`) a `HotelStatus`, `TransportStatus` ou `Currency` gera TS2322
  - Verificar que reatribuir qualquer campo `readonly` (ex.: `city.cidade = 'x'`) gera TS2540
  - Estes testes cobrem os critérios de aceitação negativos e podem ser implementados pós-MVP
  - _Requirements: 1.3, 1.4, 2.3, 2.4, 3.3, 3.4, 4.4_
