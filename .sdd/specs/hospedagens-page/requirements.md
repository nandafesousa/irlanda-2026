# Requirements Document

## Introduction

A página `/hospedagens` exibe todos os alojamentos planejados para a viagem de 18 dias à Irlanda e Reino Unido (ago–set 2026). Ela busca dados no servidor a partir da aba `Hospedagens` da planilha Google Sheets e os apresenta em um grid de `HotelCard`s com indicadores visuais de status de confirmação (Confirmado / Pendente) e uma seção de totais de gastos. A página faz parte do site de companheiro de viagem construído em Next.js 14 com App Router, seguindo a identidade visual glassmorphism sobre gradiente roxo.

---

## Requirements

### Requirement 1: Busca de Dados de Hospedagem via Google Sheets

**Objective:** Como viajante, quero que a página de hospedagens carregue todos os dados de hotéis da planilha Google Sheets no servidor, para que eu veja informações atualizadas sem expor credenciais de API no browser.

#### Acceptance Criteria

1. The Hospedagens Page shall buscar todos os registros de hospedagem no intervalo `Hospedagens!A:Z` da planilha Google Sheets em tempo de renderização, usando um Server Component do Next.js.
2. The Hospedagens Page shall declarar `export const revalidate = 300` no escopo do arquivo `app/hospedagens/page.tsx` para garantir ISR de 5 minutos compatível com o App Router do Next.js 14 independentemente de SDKs de terceiros usados em `lib/sheets.ts`, garantindo dinamismo suficiente durante o período de viagem.
3. The Hospedagens Page shall nunca expor as variáveis de ambiente `GOOGLE_API_KEY` ou `GOOGLE_SHEETS_ID` ao browser ou ao bundle cliente.
4. The Hospedagens Page shall utilizar a função exportada de `lib/sheets.ts` para obter os dados, retornando um array do tipo `Hotel` definido em `lib/types.ts`.
5. If a requisição à Google Sheets API falhar ou retornar dataset vazio, the Hospedagens Page shall exibir uma mensagem de erro amigável informando que os dados não puderam ser carregados, sem quebrar a renderização.
6. The `lib/sheets.ts` shall aplicar uma camada de validação e normalização em cada linha da aba `Hospedagens` antes de retorná-la como `Hotel`, usando Zod ou validação equivalente: o campo `status` deve ser normalizado com `.trim().toLowerCase()`, os campos `preco_total` e `noites` devem ser convertidos estritamente para `number` (rejeitando `NaN`), e campos de texto opcionais devem ter `.trim()` aplicado.
7. If uma linha da planilha não passar na validação de schema (ex.: `preco_total` não conversível para número), the `lib/sheets.ts` shall descartar silenciosamente aquela linha e continuar processando as demais, sem lançar exceção que quebre a renderização da página.

---

### Requirement 2: Layout em Grid Responsivo

**Objective:** Como viajante acessando em qualquer dispositivo, quero que os cards de hotel sejam exibidos em um grid claro e responsivo, para que eu possa escanear todas as hospedagens rapidamente independentemente do tamanho da tela.

#### Acceptance Criteria

1. The Hospedagens Page shall renderizar os `HotelCard`s em 1 coluna por padrão (mobile-first) e em 2 colunas a partir do breakpoint `md` do Tailwind CSS (`grid-cols-1 md:grid-cols-2`), sem breakpoints customizados em CSS.
2. The Hospedagens Page shall usar exclusivamente as classes utilitárias responsivas nativas do Tailwind CSS para definir o layout do grid, evitando regras `@media` customizadas.
3. The Hospedagens Page shall exibir um cabeçalho de página com título "Hospedagens" e subtítulo indicando o número total de hospedagens listadas.
4. The Hospedagens Page shall manter um espaçamento consistente (`gap`) entre os cards em ambas as resoluções, alinhado com o sistema de espaçamento do Tailwind CSS.
5. The Hospedagens Page shall renderizar um `HotelCard` para cada registro retornado pela Google Sheets API.

---

### Requirement 3: Conteúdo do HotelCard

**Objective:** Como viajante, quero que cada card de hotel exiba todos os detalhes relevantes da reserva de forma clara, para que eu possa verificar datas, preços e status de confirmação sem precisar abrir a planilha.

#### Acceptance Criteria

1. The HotelCard shall exibir o nome do hotel (`nome_hotel`) como título principal do card.
2. The HotelCard shall exibir a cidade (`cidade`) da hospedagem.
3. The HotelCard shall exibir as datas de check-in (`data_checkin`) e check-out (`data_checkout`).
4. The HotelCard shall exibir o número de noites (`noites`).
5. The HotelCard shall exibir o preço total (`preco_total`) junto à moeda (`moeda`) correspondente.
6. Where `link_booking` estiver presente no registro, the HotelCard shall renderizar um link clicável abrindo a página de reserva em nova aba.
7. Where `observacoes` estiver presente no registro, the HotelCard shall exibir o texto das observações em uma área secundária do card.
8. Where `endereco` estiver presente no registro, the HotelCard shall exibir o endereço da hospedagem.
9. The HotelCard shall aceitar uma prop tipada como `Hotel` (de `lib/types.ts`) sem uso de `any`.

---

### Requirement 4: Indicadores de Status de Confirmação

**Objective:** Como viajante, quero que cada card indique claramente se a hospedagem está confirmada ou pendente, para que eu identifique imediatamente quais reservas ainda requerem ação.

#### Acceptance Criteria

1. When `status` for `"confirmado"`, the HotelCard shall exibir um badge verde com o texto "✅ Confirmado".
2. When `status` for `"pendente"`, the HotelCard shall exibir um badge âmbar/amarelo com o texto "⏳ Pendente".
3. When `status` for `"confirmado"`, the HotelCard shall aplicar uma faixa superior (top stripe) com gradiente `var(--primary)` → `var(--accent)` (roxo para rosa) no topo do card.
4. When `status` for `"pendente"`, the HotelCard shall aplicar uma faixa superior com gradiente `var(--warning)` → `#e9b000` (âmbar) no topo do card.
5. The HotelCard shall aplicar `border-radius: 20px`, `font-size: 0.78rem` e `font-weight: 600` nos badges de status, usando as CSS custom properties de cor (`--success`, `--warning`) sem valores hexadecimais inline.

---

### Requirement 5: Seção de Totais de Custos

**Objective:** Como viajante, quero ver um resumo dos custos totais de hospedagem ao final da página, para que eu possa acompanhar os gastos gerais sem somar manualmente cada card.

#### Acceptance Criteria

1. The Hospedagens Page shall exibir uma seção de totais posicionada abaixo do grid de `HotelCard`s.
2. The Hospedagens Page shall calcular e exibir o valor total das hospedagens em EUR, somando `preco_total` de todos os registros com `moeda` normalizado igual a `"eur"` (comparação case-insensitive após normalização realizada em `lib/sheets.ts`).
3. The Hospedagens Page shall exibir o número total de noites somando o campo `noites` de todos os registros.
4. The Hospedagens Page shall exibir a contagem de hospedagens com `status = "confirmado"` em relação ao total de registros (ex.: "3 de 4 confirmadas").
5. Where registros com `moeda` diferente de EUR existirem, the Hospedagens Page shall exibir os totais por moeda separadamente, sem conversão automática implícita.

---

### Requirement 6: Identidade Visual e Animações

**Objective:** Como viajante, quero que a página de hospedagens mantenha a identidade visual glassmorphism do site, para que a experiência seja coesa e premium em todas as páginas.

#### Acceptance Criteria

1. The Hospedagens Page shall herdar o background com gradiente fixo (`linear-gradient(135deg, #667eea 0%, #764ba2 100%)`, `background-attachment: fixed`) do layout raiz da aplicação.
2. The HotelCard shall usar fundo branco semi-transparente (`bg-white/80 backdrop-blur-md` ou equivalente CSS `background: rgba(255,255,255,0.80); backdrop-filter: blur(12px)`), `border-radius: 18px` e sombra `0 8px 32px rgba(0,0,0,0.1)` em estado de repouso, mantendo a profundidade visual do efeito glassmorphism do background gradiente.
3. When the user hoverem sobre um HotelCard, the HotelCard shall elevar o card aplicando `translateY(-4px)` e aumentar a sombra para `0 18px 52px rgba(0,0,0,0.14)`.
4. The HotelCard shall aplicar animação `fadeInUp` com duração de `0.6s` na entrada da página; o `animation-delay` de cada card deve ser calculado a partir do seu índice no array (`index * 0.1s`) e aplicado via `style` inline no momento do mapeamento (`hotels.map((hotel, index) => ...)`), dado que o componente é renderizado em Server Component.
5. The Hospedagens Page shall usar exclusivamente as CSS custom properties definidas em `globals.css` para todas as cores — nenhum valor hexadecimal inline nos componentes.
6. The Hospedagens Page shall usar a família tipográfica `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif` consistente com o restante do site.
7. The Hospedagens Page shall usar seção de totais estilizada como glass panel (`var(--glass)`, `backdrop-filter: blur(16px)`, `border: 1px solid var(--glass-border)`) sobre o gradiente de fundo.
