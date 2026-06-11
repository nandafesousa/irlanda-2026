# Requirements Document

## Introduction

A página `/transportes` exibe todos os trechos de transporte da viagem de 18 dias à Irlanda e Reino Unido (ago–set 2026) em ordem cronológica. Ela busca dados no servidor a partir da aba `Transportes` da planilha Google Sheets e os apresenta como uma lista de `TransportCard`s, cada um exibindo o ícone do tipo de transporte, origem → destino, duração, operadora, data, horário e badge de status de pagamento. A página faz parte do site de companheiro de viagem construído em Next.js 14 com App Router, seguindo a identidade visual glassmorphism sobre gradiente roxo.

---

## Requirements

### Requirement 1: Busca de Dados de Transporte via Google Sheets

**Objective:** Como viajante, quero que a página de transportes carregue todos os dados de trechos da planilha Google Sheets no servidor, para que eu veja informações atualizadas sem expor credenciais de API no browser.

#### Acceptance Criteria

1. The Transportes Page shall buscar todos os registros de transporte no intervalo `Transportes!A:Z` da planilha Google Sheets em tempo de renderização, usando um Server Component do Next.js.
2. The `lib/sheets.ts` shall usar o `fetch` nativo do Next.js com a opção `{ next: { revalidate: 3600 } }` para comunicação com a API do Google Sheets, garantindo que o mecanismo de ISR do App Router intercepte e gerencie o cache corretamente; o uso de SDKs que não sejam baseados no `fetch` nativo (ex.: `googleapis` com axios) é proibido para esta função.
3. The Transportes Page shall declarar `export const revalidate = 3600` no escopo do arquivo `app/transportes/page.tsx` como salvaguarda adicional de ISR, em conjunto com o `revalidate` declarado no `fetch` de `lib/sheets.ts`.
4. The Transportes Page shall nunca expor as variáveis de ambiente `GOOGLE_API_KEY` ou `GOOGLE_SHEETS_ID` ao browser ou ao bundle cliente.
5. The Transportes Page shall utilizar a função exportada de `lib/sheets.ts` para obter os dados, retornando um array do tipo `Transport` definido em `lib/types.ts`.
6. If a requisição à Google Sheets API falhar ou retornar dataset vazio, the Transportes Page shall exibir uma mensagem de erro amigável informando que os dados não puderam ser carregados, sem quebrar a renderização.
7. The `lib/sheets.ts` shall aplicar validação e normalização em cada linha da aba `Transportes` antes de retorná-la como `Transport`: o campo `preco` deve ser convertido estritamente para `number` (rejeitando `NaN`); o campo `status` deve ser normalizado com `.trim().toLowerCase()`; o campo `data` deve ser normalizado para o formato ISO 8601 (`YYYY-MM-DD`) a partir de strings no formato `DD/MM` ou `DD/MM/YYYY` para permitir ordenação cronológica confiável; e campos de texto opcionais devem ter `.trim()` aplicado.
8. If uma linha da planilha não passar na validação de schema (ex.: campos obrigatórios ausentes ou `preco` não conversível para número), the `lib/sheets.ts` shall descartar silenciosamente aquela linha e continuar processando as demais, sem lançar exceção que quebre a renderização da página.

---

### Requirement 2: Layout da Lista Cronológica

**Objective:** Como viajante, quero que os trechos de transporte sejam exibidos em uma lista cronológica clara, para que eu acompanhe a sequência da viagem de forma intuitiva em qualquer dispositivo.

#### Acceptance Criteria

1. The Transportes Page shall ordenar os `TransportCard`s cronologicamente pelo campo `data` normalizado para ISO 8601 (conforme Requirement 1, AC 7), garantindo ordem correta mesmo que as linhas da planilha sejam preenchidas fora de sequência.
2. The Transportes Page shall renderizar os `TransportCard`s em uma lista vertical única (coluna única em todos os breakpoints).
3. The Transportes Page shall exibir um cabeçalho de página com título "Transportes" e subtítulo indicando o número total de trechos listados.
4. The Transportes Page shall renderizar um `TransportCard` para cada registro retornado pela Google Sheets API.
5. The Transportes Page shall manter espaçamento consistente (`gap`) entre os cards, alinhado com o sistema de espaçamento do Tailwind CSS.
6. The Transportes Page shall ser responsiva: cards devem ocupar full-width no mobile e ter largura máxima de `1000px` centralizada no desktop.

---

### Requirement 3: Conteúdo do TransportCard

**Objective:** Como viajante, quero que cada card de transporte exiba todos os detalhes do trecho de forma clara, para que eu consulte origem, destino, horário, operadora e duração sem precisar abrir a planilha.

#### Acceptance Criteria

1. The TransportCard shall exibir o ícone do tipo de transporte (`emoji`) à esquerda do card: ✈️ para voo, 🚂 para trem, ⛴️ para ferry, 🚌 para ônibus.
2. The TransportCard shall exibir a rota no formato "Origem → Destino" usando os campos `origem` e `destino`.
3. The TransportCard shall exibir a operadora (`operadora`) do trecho.
4. The TransportCard shall exibir a data (`data`) do trecho.
5. The TransportCard shall exibir o horário de partida (`horario`) do trecho.
6. The TransportCard shall exibir a duração (`duracao`) do trecho.
7. Where `observacoes` estiver presente no registro, the TransportCard shall exibir as observações em uma área secundária do card.
8. Where `preco` e `moeda` estiverem presentes no registro, the TransportCard shall exibir o valor pago do trecho formatado via `Intl.NumberFormat` com o código da moeda correspondente (ex.: `€ 2.800,00` para BRL/EUR), aplicando o locale `pt-BR` como padrão.
9. The TransportCard shall aceitar uma prop tipada como `Transport` (de `lib/types.ts`) sem uso de `any`.

---

### Requirement 4: Indicador de Status de Pagamento

**Objective:** Como viajante, quero que cada card exiba claramente que o trecho foi pago, para que eu confirme a situação financeira de cada trecho sem ambiguidade.

#### Acceptance Criteria

1. When `status` for `"pago"`, the TransportCard shall exibir um badge roxo com o texto "✅ Pago".
2. The TransportCard shall aplicar o badge de pagamento usando `background: rgba(108,92,231,0.1)`, `color: var(--primary)` e `border: 1px solid rgba(108,92,231,0.25)`, consistente com o padrão de badges primários do sistema de design.
3. The TransportCard shall aplicar `border-radius: 20px`, `font-size: 0.78rem` e `font-weight: 600` no badge de status, sem valores hexadecimais inline.
4. When `status` não for `"pago"`, the TransportCard shall exibir um badge âmbar com o texto "⏳ Pendente", usando as CSS custom properties `--warning` sem valores hexadecimais inline.

---

### Requirement 5: Seção de Resumo de Custos de Transporte

**Objective:** Como viajante, quero ver um resumo dos custos totais de transporte ao final da página, para que eu possa acompanhar o gasto total com deslocamentos sem somar manualmente cada card.

#### Acceptance Criteria

1. The Transportes Page shall exibir uma seção de resumo posicionada abaixo da lista de `TransportCard`s.
2. The Transportes Page shall exibir a contagem total de trechos listados.
3. The Transportes Page shall calcular e exibir os valores totais agrupados por moeda (`moeda`), somando `preco` de todos os registros com a mesma moeda normalizada (comparação case-insensitive após normalização realizada em `lib/sheets.ts`), e formatar cada total via `Intl.NumberFormat` com o locale `pt-BR` e o código da moeda correspondente (ex.: `R$ 5.600,00`, `€ 420,00`).
4. The Transportes Page shall exibir a contagem de trechos com `status = "pago"` em relação ao total de registros (ex.: "5 de 5 pagos").
5. Where registros com múltiplas moedas existirem, the Transportes Page shall exibir os totais por moeda separadamente, sem conversão automática implícita entre moedas.

---

### Requirement 6: Identidade Visual e Animações

**Objective:** Como viajante, quero que a página de transportes mantenha a identidade visual glassmorphism do site, para que a experiência seja coesa e premium em todas as páginas.

#### Acceptance Criteria

1. The Transportes Page shall herdar o background com gradiente fixo (`linear-gradient(135deg, #667eea 0%, #764ba2 100%)`, `background-attachment: fixed`) do layout raiz da aplicação.
2. The TransportCard shall usar fundo branco semi-transparente (`background: rgba(255,255,255,0.80); backdrop-filter: blur(12px)`), `border-radius: 18px` e sombra `0 8px 32px rgba(0,0,0,0.1)` em estado de repouso.
3. The TransportCard shall aplicar uma faixa superior (top stripe) com gradiente `linear-gradient(90deg, var(--primary), var(--accent))` (roxo para rosa) no topo do card.
4. When the user hoverem sobre um TransportCard, the TransportCard shall aplicar `translateX(4px)` (deslizamento horizontal) via transição CSS pura (`transition: transform 0.3s ease, box-shadow 0.3s ease`) sem necessidade de `"use client"`, e aumentar a sombra para `0 18px 52px rgba(0,0,0,0.14)`.
5. The TransportCard shall aplicar animação `fadeInUp` com duração de `0.6s` na entrada da página; o `animation-delay` de cada card deve ser calculado como `Math.min(index, 5) * 0.1s` (teto de `0.5s` no 6º item em diante) e aplicado via `style` inline no momento do mapeamento, dado que o componente é renderizado em Server Component.
6. The Transportes Page shall usar exclusivamente as CSS custom properties definidas em `globals.css` para todas as cores — nenhum valor hexadecimal inline nos componentes.
7. The Transportes Page shall usar a família tipográfica `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif` consistente com o restante do site.
8. The Transportes Page shall usar a seção de resumo estilizada como glass panel (`var(--glass)`, `backdrop-filter: blur(16px)`, `border: 1px solid var(--glass-border)`) sobre o gradiente de fundo.

---

### Requirement 7: Revalidação Sob Demanda

**Objective:** Como viajante em campo, quero poder forçar a atualização imediata do site após editar a planilha, para que eu não precise esperar 1 hora pelo ciclo padrão de ISR.

#### Acceptance Criteria

1. The application shall expor uma rota de API em `app/api/revalidate/route.ts` que, ao receber uma requisição GET com o parâmetro `?token=<TOKEN>` correto, execute `revalidatePath('/transportes')` e retorne JSON `{ revalidated: true }`.
2. The Revalidate Route shall validar o `token` comparando-o com a variável de ambiente `REVALIDATE_TOKEN`; If o token estiver ausente ou incorreto, the Revalidate Route shall retornar HTTP 401 sem revalidar nenhuma rota.
3. The Revalidate Route shall nunca expor o valor de `REVALIDATE_TOKEN` no corpo da resposta ou em logs públicos.
4. The application shall documentar a URL de revalidação no `README` do projeto para facilitar o uso durante a viagem.
