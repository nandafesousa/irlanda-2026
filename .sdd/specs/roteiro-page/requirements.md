# Documento de Requisitos — Página Roteiro

## Introdução

A página `/roteiro` é a página mais rica do aplicativo e serve como referência visual e de estilo para todo o site. Ela exibe uma timeline vertical com cards expansíveis (`CityCard`) para cada cidade da viagem. Os dados são buscados no servidor a partir da aba `Roteiro` do Google Sheets, garantindo que nenhuma credencial seja exposta ao navegador. A página segue fielmente a identidade visual glassmorphism sobre gradiente roxo definida no projeto.

---

## Requisitos

### Requisito 1: Busca e Carregamento de Dados

**Objetivo:** Como viajante, quero que os dados do roteiro sejam carregados automaticamente da planilha Google Sheets, para que eu veja as informações sempre atualizadas sem precisar alterar o código.

#### Critérios de Aceitação

1. The Roteiro Page shall buscar os dados da aba `Roteiro` utilizando o range `Roteiro!A:Z` via `lib/sheets.ts` exclusivamente no servidor (server component).
2. The Roteiro Page shall aplicar um mecanismo de cache com tempo de revalidação (ISR) de 1 hora para as requisições da Sheets API, independentemente da estratégia de implementação utilizada (fetch nativo ou SDK).
3. If a chamada à Sheets API falhar, the Roteiro Page shall exibir uma mensagem de erro amigável em português sem expor detalhes técnicos ao usuário; o tratamento de erro deve ser implementado via arquivo `app/roteiro/error.tsx` (Next.js Error Boundary), garantindo que o layout global (navegação e gradiente de fundo) permaneça funcional durante a falha.
4. The Roteiro Page shall mapear cada linha da planilha para o tipo `City` definido em `lib/types.ts`, respeitando as colunas: `cidade`, `emoji`, `data_entrada`, `data_saida`, `noites`, `destaque`, `bairro`, `preco_noite`, `atividades`; o mapeamento deve incluir uma etapa de higienização de dados — campos ausentes retornam string vazia, `atividades` vazio retorna array vazio (evitando falhas em `.split()`), e valores numéricos inesperados são normalizados para string.
5. The Roteiro Page shall nunca executar chamadas à Sheets API no lado do cliente (browser), garantindo que `GOOGLE_API_KEY` e `GOOGLE_SHEETS_ID` jamais sejam expostos.

---

### Requisito 2: Estrutura da Timeline Vertical

**Objetivo:** Como viajante, quero ver o roteiro completo em uma timeline vertical cronológica, para que eu possa visualizar a sequência das cidades de forma clara e intuitiva.

#### Critérios de Aceitação

1. The Roteiro Page shall renderizar todas as cidades em ordem cronológica (conforme ordem das linhas na planilha) em uma timeline vertical; o número de cidades é dinâmico e determinado pelos dados da planilha, sem limite fixo.
2. While a largura da viewport é `> 768px` (desktop), the Roteiro Page shall renderizar os CityCards de forma alternada entre esquerda e direita ao longo do eixo central da timeline, criando um efeito zigzag.
3. The Roteiro Page shall exibir um conector visual (linha vertical ou dot) entre os cards de cidade, criando a sensação de progressão de uma cidade para a próxima.
4. The Roteiro Page shall exibir um cabeçalho da página com título "Roteiro" e subtítulo indicando o período total da viagem (ex.: "Ago–Set 2026").
5. While a página está carregando os dados do servidor, the Roteiro Page shall renderizar o HTML de forma estática no servidor (SSR/ISR), sem depender de estado de carregamento no cliente.
6. The Roteiro Page shall exibir o número total de cidades da timeline no cabeçalho ou em um indicador visual de progresso.

---

### Requisito 3: CityCard — Visualização Compactada (Fechada)

**Objetivo:** Como viajante, quero ver um resumo de cada cidade no estado fechado do card, para que eu obtenha uma visão geral rápida de todo o roteiro sem precisar expandir cada item.

#### Critérios de Aceitação

1. The CityCard shall exibir, no estado fechado: emoji da cidade, nome da cidade, datas de entrada e saída, quantidade de noites e o principal destaque (`destaque`).
2. The CityCard shall aplicar uma borda esquerda de 4px sólida usando a cor de acento da cidade correspondente (`--c1` a `--c6`) conforme o índice da cidade na timeline.
3. The CityCard shall apresentar estilo de card branco com sombra (`box-shadow: 0 8px 32px rgba(0,0,0,0.1)`) e `border-radius: 18px`.
4. When o usuário passa o cursor sobre o CityCard, the CityCard shall elevar-se `translateY(-4px)` com sombra aprofundada (`0 18px 52px rgba(0,0,0,0.14)`), aplicando transição suave de `0.3s ease`.
5. The CityCard shall exibir um ícone ou indicador visual (ex.: chevron/seta) que sinalize que o card é expansível.
6. The CityCard shall animar sua entrada com `fadeInUp` com atraso escalonado de `0.1s` por índice de cidade, duração de `0.6s`; o atraso deve ser aplicado via propriedade inline de estilo (`style={{ animationDelay: \`${index * 0.1}s\` }}`), sem uso de bibliotecas externas de animação JavaScript.

---

### Requisito 4: CityCard — Expansão e Exibição de Detalhes

**Objetivo:** Como viajante, quero expandir o card de uma cidade para ver todos os seus detalhes — bairro, atividades e preço por noite — para planejar melhor cada etapa da viagem.

#### Critérios de Aceitação

1. When o usuário clica no CityCard, the CityCard shall alternar entre o estado fechado e o estado expandido, exibindo ou ocultando a seção de detalhes.
2. When o CityCard está expandido, the CityCard shall exibir: bairro (`bairro`), faixa de preço por noite (`preco_noite`) e lista de atividades (`atividades`).
3. When o CityCard está expandido, the CityCard shall exibir uma barra de destaque (`highlight bar`) com gradiente baseado na cor de acento da cidade, contendo o texto do destaque principal.
4. The CityCard shall implementar a lógica de expansão como componente cliente (`"use client"`), mantendo o `page.tsx` como server component.
5. When o CityCard expande ou fecha, the CityCard shall aplicar animação de transição suave na altura do conteúdo (ex.: `max-height` transition ou similar), com duração de aproximadamente `0.3s`.
6. Where múltiplos CityCards estão presentes, the Roteiro Page shall permitir que mais de um card esteja expandido simultaneamente (expansão independente por card).
7. If o campo `atividades` contiver múltiplos itens separados por vírgula, the CityCard shall renderizá-los como lista ou conjunto de badges/tags.

---

### Requisito 5: Identidade Visual e Cores de Acento por Cidade

**Objetivo:** Como viajante, quero que cada cidade tenha uma identidade visual única com cor de acento distinta, para que eu identifique visualmente cada destino na timeline.

#### Critérios de Aceitação

1. The Roteiro Page shall atribuir a cor de acento de cada cidade com base exclusivamente no índice da linha na planilha, de forma cíclica: `--c${(index % 6) + 1}`; isso garante que novas cidades adicionadas na planilha recebam automaticamente uma cor válida do pallete, sem necessidade de alterar o código. Os nomes das cidades não devem ser usados como chave de cor em nenhuma lógica de mapeamento.
2. The CityCard shall usar exclusivamente variáveis CSS (`var(--c1)` a `var(--c6)`) para cores de acento, sem nunca hardcodar valores hexadecimais nos componentes.
3. The Roteiro Page shall manter o fundo fixo com gradiente `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` e `background-attachment: fixed` herdado do layout raiz.
4. The Roteiro Page shall usar a tipografia do sistema (`'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`) sem importar fontes externas.
5. The CityCard shall usar badges/pills estilizados conforme o padrão do design system: `border-radius: 20px`, `font-size: 0.78rem`, `font-weight: 600`, com variantes de cor (primary, success, warning) por CSS custom properties.
6. The Roteiro Page shall aplicar largura máxima de `1000px` centralizada com `margin: 0 auto` e `padding: 0 1.5rem`.

---

### Requisito 6: Responsividade Mobile

**Objetivo:** Como viajante usando o celular, quero que a página de roteiro seja perfeitamente utilizável em telas pequenas, para que eu possa consultar o roteiro durante a viagem com o smartphone.

#### Critérios de Aceitação

1. While a largura da viewport é `≤ 768px`, the Roteiro Page shall colapsar o layout da timeline para uma coluna única alinhada à esquerda, eliminando qualquer efeito zigzag.
2. While a largura da viewport é `≤ 768px`, the Roteiro Page shall exibir os CityCards em largura total (`width: 100%`), sem margens laterais excessivas.
3. While a largura da viewport é `≤ 480px`, the Roteiro Page shall reduzir o tamanho do título principal para `1.7rem` conforme o design system.
4. The Roteiro Page shall herdar a navegação mobile (bottom tab bar) do layout raiz `app/layout.tsx`, sem duplicar lógica de navegação na página.
5. The CityCard shall manter todas as funcionalidades de expansão/colapso funcionando corretamente em telas touch (mobile), com área de toque adequada (mínimo 44x44px).
6. When o conteúdo expandido do CityCard é renderizado em mobile, the CityCard shall garantir que o texto de atividades e detalhes seja legível sem overflow horizontal.

---

### Requisito 7: Acessibilidade e Semântica

**Objetivo:** Como viajante, quero que a página seja acessível e semanticamente correta, para que funcione com tecnologias assistivas e tenha boa performance de SEO.

#### Critérios de Aceitação

1. The Roteiro Page shall usar elementos HTML semânticos: `<main>`, `<section>`, `<article>` ou `<ul>/<li>` para a lista de cidades, e headings hierárquicos (`<h1>` → `<h2>`).
2. The CityCard shall incluir atributo `aria-expanded` com valor booleano refletindo o estado atual de expansão do card.
3. When o CityCard é ativado via teclado (tecla Enter ou Espaço), the CityCard shall alternar seu estado de expansão, assim como ao clique com mouse.
4. The Roteiro Page shall exportar metadados de SEO via `export const metadata` do Next.js, incluindo `title` e `description` relevantes para a página de roteiro.
5. The Roteiro Page shall garantir contraste de texto adequado (mínimo WCAG AA) entre o conteúdo dos cards brancos e o fundo escuro de gradiente.
