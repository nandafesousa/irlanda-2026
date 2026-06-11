# Requirements Document

## Introdução

Este documento define os requisitos para a responsividade mobile do Travel Companion App (viagem Irlanda & UK 2026). O objetivo é garantir uma experiência de uso nativa e fluida em dispositivos móveis, com navegação inferior estilo app, colapso de grids, timeline adaptada, tipografia responsiva e suporte a dispositivos com notch.

O sistema referenciado nos critérios de aceitação é o **Travel Companion App**.

---

## Requirements

### Requirement 1: Barra de Navegação Inferior (Mobile)

**Objetivo:** Como viajante acessando o app em um smartphone, quero uma barra de navegação inferior fixada na tela, para ter uma experiência de navegação semelhante a um aplicativo nativo e acessar facilmente as 4 seções principais.

#### Acceptance Criteria

1. When a viewport com largura ≤ 768px é renderizado, the Travel Companion App shall ocultar a barra de navegação superior e exibir uma barra de abas fixa na parte inferior da tela.
2. The Travel Companion App shall renderizar exatamente 4 abas de largura igual na barra inferior: Home (🏠), Roteiro (🗺️), Hospedagens (🏨) e Transportes (🚂), cada uma com seu ícone e rótulo correspondentes.
3. While a barra de navegação inferior está visível, the Travel Companion App shall aplicar `padding-bottom` utilizando `env(safe-area-inset-bottom)` na barra inferior para evitar sobreposição com elementos de interface do sistema operacional em dispositivos com notch.
4. The Travel Companion App shall aplicar `background: rgba(80, 60, 180, 0.92)` e `backdrop-filter: blur(20px)` à barra de navegação inferior; em dispositivos que não suportam `backdrop-filter`, the Travel Companion App shall aplicar `background: rgba(80, 60, 180, 1)` como fallback via `@supports not (backdrop-filter: blur())`, garantindo a legibilidade do texto das abas independente do suporte ao efeito de blur.
5. When uma aba está ativa, the Travel Companion App shall exibir o ícone e o rótulo da aba em branco (`color: white`); When uma aba está inativa, the Travel Companion App shall exibir o ícone e o rótulo em `rgba(255, 255, 255, 0.65)`; When uma aba é tocada (estado `:active`), the Travel Companion App shall aplicar uma redução temporária de opacidade (`opacity: 0.8`) como feedback visual de toque imediato.
6. When a viewport com largura > 768px é renderizado, the Travel Companion App shall exibir a barra de navegação horizontal fixa no topo e ocultar a barra de navegação inferior.
7. The Travel Companion App shall centralizar a lógica de `padding-bottom` no componente de layout global (`layout.tsx`), aplicando automaticamente o espaço equivalente à altura da barra de navegação inferior mais `env(safe-area-inset-bottom)` na área de conteúdo principal (`children`) quando a viewport for ≤ 768px (`md:` breakpoint do Tailwind), de forma que nenhuma página precise gerenciar esse espaçamento individualmente.

---

### Requirement 2: Colapso de Grid para Coluna Única

**Objetivo:** Como viajante em um smartphone, quero que os grids de cards se adaptem à largura da tela, para que o conteúdo seja legível e navegável sem rolagem horizontal.

#### Acceptance Criteria

1. When a viewport com largura ≤ 768px é renderizado, the Travel Companion App shall exibir os cards de hospedagem em layout de coluna única (1 coluna), em vez do layout de 2 colunas do desktop.
2. When a viewport com largura ≤ 768px é renderizado, the Travel Companion App shall exibir os StatCards da página Home em layout de coluna única ou empilhado verticalmente.
3. When a viewport com largura > 768px é renderizado, the Travel Companion App shall exibir os cards de hospedagem em grid de 2 colunas.
4. The Travel Companion App shall utilizar utilitários responsivos do Tailwind CSS (ex: `grid-cols-1 md:grid-cols-2`) para controlar o número de colunas nos breakpoints definidos, onde `md:` corresponde a `768px` conforme o padrão do Tailwind CSS — nenhum breakpoint customizado adicional é necessário para o colapso de grid.
5. When a viewport com largura ≤ 768px é renderizado, the Travel Companion App shall exibir todos os cards de conteúdo (hospedagem, transporte, cidade) com largura total (`w-full`) e padding horizontal mínimo de `1rem`.

---

### Requirement 3: Timeline Responsiva (Página Roteiro)

**Objetivo:** Como viajante em um smartphone, quero visualizar a timeline do roteiro em coluna única alinhada à esquerda, para facilitar a leitura e navegação vertical sem o layout em zigue-zague do desktop.

#### Acceptance Criteria

1. When a viewport com largura ≤ 768px é renderizado, the Travel Companion App shall exibir os cards de cidade na página Roteiro em layout de coluna única, alinhados à esquerda, sem alternância de posicionamento (sem zigue-zague).
2. When a viewport com largura > 768px é renderizado, the Travel Companion App shall exibir a timeline vertical com posicionamento alternado (esquerda/direita) dos cards de cidade.
3. While a timeline está no layout mobile (coluna única), the Travel Companion App shall manter o comportamento de expansão/colapso dos cards de cidade funcional; When um CityCard for expandido no mobile e seu conteúdo exceder a altura da viewport, the Travel Companion App shall garantir que o topo do card (título da cidade) permaneça visível na janela de visualização via `scrollIntoView` ou `scroll-margin-top`, evitando que o usuário perca a referência de posição.
4. When a viewport com largura ≤ 768px é renderizado, the Travel Companion App shall exibir cada CityCard com largura total da área de conteúdo disponível.
5. The Travel Companion App shall preservar a borda lateral colorida da cidade (`--c1` a `--c6`) em ambos os breakpoints.

---

### Requirement 4: Tipografia Responsiva

**Objetivo:** Como viajante em um smartphone compacto (tela ≤ 480px), quero que os títulos principais se adaptem ao tamanho da tela, para que o texto não transborde nem fique excessivamente grande.

#### Acceptance Criteria

1. The Travel Companion App shall escalonar o tamanho do `h1` hero da página Home de forma fluida utilizando `clamp()`, com valor mínimo de `1.7rem` (aplicado em viewports estreitas), valor máximo correspondente ao tamanho desktop, e valor fluido proporcional à largura da viewport — eliminando a necessidade de media queries arbitrárias para breakpoints de 480px.
2. When a viewport com largura ≤ 768px (`md:` do Tailwind) é renderizado, the Travel Companion App shall garantir que nenhum heading principal cause overflow horizontal na tela.
3. The Travel Companion App shall utilizar exclusivamente `clamp()` no CSS global ou utilitários responsivos nativos do Tailwind CSS para escalonar tipografia, sem introduzir breakpoints customizados (ex: `xs:`) no `tailwind.config.js` além dos já existentes.
4. The Travel Companion App shall manter `font-weight: 800` nos headings principais em todos os breakpoints.

---

### Requirement 5: Espaçamento e Padding em Mobile

**Objetivo:** Como viajante em um smartphone, quero que o espaçamento entre elementos e o padding interno dos cards sejam adequados ao toque, para navegar e ler o conteúdo com conforto.

#### Acceptance Criteria

1. When a viewport com largura ≤ 768px é renderizado, the Travel Companion App shall aplicar padding horizontal mínimo de `1rem` (`16px`) às páginas para evitar que o conteúdo encoste nas bordas da tela.
2. When a viewport com largura ≤ 768px é renderizado, the Travel Companion App shall aplicar espaçamento vertical (`gap`) mínimo de `1rem` entre cards empilhados verticalmente.
3. The Travel Companion App shall garantir que as áreas de toque dos elementos interativos (abas, botões, links de cards) tenham altura mínima de `44px` em viewports mobile.
4. While a barra de navegação inferior está visível, the Travel Companion App shall garantir que o último card de conteúdo não fique oculto pela barra — este requisito é atendido pelo componente de layout global (`layout.tsx`) conforme definido no Requisito 1, critério 7, sem necessidade de padding manual em cada página individual.

---

### Requirement 6: Suporte a Dispositivos com Notch (Safe Area)

**Objetivo:** Como viajante utilizando um iPhone ou dispositivo Android com barra de sistema, quero que a barra de navegação inferior respeite a área segura do sistema, para que os elementos de navegação não fiquem sobrepostos pela barra de gestos do sistema operacional.

#### Acceptance Criteria

1. The Travel Companion App shall utilizar a variável CSS `env(safe-area-inset-bottom)` no `padding-bottom` da barra de navegação inferior para respeitar a área segura em dispositivos com notch ou barra de gestos.
2. The Travel Companion App shall incluir a meta tag `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` no `layout.tsx` raiz para habilitar o suporte a `env(safe-area-inset-*)`.
3. If o dispositivo não suportar `env(safe-area-inset-bottom)`, the Travel Companion App shall aplicar `padding-bottom: 0` como fallback sem quebrar o layout.
4. The Travel Companion App shall garantir que a barra de navegação inferior não sobreponha conteúdo interativo em dispositivos com barra de gestos do sistema (ex: iPhone com Face ID).
