# Requirements Document

## Introdução

Componentes base reutilizáveis do travel companion app de viagem Irlanda & UK 2026: `Nav` (navegação responsiva top/bottom) e `StatCard` (card de estatística com glassmorphism). São os primitivos compartilhados em todas as páginas e devem preservar fielmente a identidade visual definida no design system — gradiente roxo, glassmorphism, CSS custom properties semânticas e tipografia Segoe UI.

## Requirements

### Requirement 1: Nav — Estrutura e Aparência no Desktop

**Objetivo:** Como viajante acessando o app pelo desktop, quero uma barra de navegação superior translúcida e fixa, para navegar entre as 4 seções da viagem de forma clara e elegante.

#### Acceptance Criteria
1. The Nav component shall renderizar uma barra de navegação sticky no topo da viewport em telas com largura ≥ 769px.
2. The Nav component shall aplicar efeito glassmorphism à barra usando `background: var(--nav-bg-desktop)` e `backdrop-filter: blur(20px)`.
3. The Nav component shall ter altura de 60px e renderizar os 4 links de navegação a partir da constante `NAVIGATION_ROUTES` definida no escopo do arquivo.
4. When o cursor passar sobre um item de navegação no desktop, the Nav component shall aplicar `background: var(--nav-hover-desktop)` e `border-radius: 8px` ao item.
5. The Nav component shall usar exclusivamente CSS custom properties para todos os valores de cor e nunca valores hex ou rgba hardcoded no JSX ou em classes Tailwind inline.

### Requirement 2: Nav — Comportamento Responsivo Mobile

**Objetivo:** Como viajante acessando o app pelo celular, quero uma barra de navegação inferior fixada na tela em estilo app nativo, para navegar com os polegares de forma intuitiva.

#### Acceptance Criteria
1. The Nav component shall ocultar a top nav e exibir uma bottom tab bar em viewports ≤ 768px.
2. The Nav component shall fixar a bottom tab bar na parte inferior do viewport com posicionamento fixo e largura total.
3. The Nav component shall aplicar `background: var(--nav-bg-mobile)` e `backdrop-filter: blur(20px)` à bottom tab bar.
4. The Nav component shall dividir a bottom tab bar em 4 colunas iguais iterando sobre `NAVIGATION_ROUTES`.
5. The Nav component shall incluir padding inferior com `env(safe-area-inset-bottom)` para suporte a dispositivos com notch.
6. The Nav component shall exibir o `icon` e o `label` de cada entrada de `NAVIGATION_ROUTES` em cada item da bottom nav.

### Requirement 3: Nav — Estado Ativo e Controle de Rota

**Objetivo:** Como viajante, quero ver claramente qual seção estou visualizando, para me orientar dentro do app.

#### Acceptance Criteria
1. When a rota ativa corresponder a um item de navegação, the Nav component shall aplicar `color: white` ao item ativo.
2. While um item de navegação estiver inativo, the Nav component shall aplicar `color: rgba(255,255,255,0.65)` a esse item.
3. The Nav component shall detectar a rota ativa usando `pathname.startsWith(link.href)` para todos os links, exceto Home (`/`), onde a comparação deverá ser estrita (`pathname === '/'`) para evitar falsos positivos em sub-rotas.
4. The Nav component shall ser declarado como Client Component (`"use client"`) por necessitar de acesso ao pathname no cliente via `usePathname()` do Next.js.
5. If o pathname não corresponder a nenhum dos 4 links, the Nav component shall tratar o item Home (`/`) como ativo por padrão.

### Requirement 4: Nav — Estrutura de Dados de Rotas e Acessibilidade

**Objetivo:** Como desenvolvedor, quero que os dados de navegação sejam centralizados e que o componente seja acessível, para facilitar manutenção e garantir usabilidade básica.

#### Acceptance Criteria
1. The Nav component shall declarar uma constante `NAVIGATION_ROUTES` no escopo do arquivo com a estrutura `{ href: string; label: string; icon: string }[]` contendo as 4 entradas: `{ href: '/', label: 'Home', icon: '🏠' }`, `{ href: '/roteiro', label: 'Roteiro', icon: '🗺️' }`, `{ href: '/hospedagens', label: 'Hospedagem', icon: '🏨' }` e `{ href: '/transportes', label: 'Transporte', icon: '🚂' }`.
2. The Nav component shall envolver os links em um elemento semântico `<nav>` para que leitores de tela identifiquem a região de navegação.
3. The Nav component shall garantir que todos os links sejam navegáveis via teclado (Tab) e que o estado de foco seja visualmente distinguível.
4. The Nav component shall usar `NAVIGATION_ROUTES` como única fonte de verdade para renderizar os itens tanto na top nav desktop quanto na bottom tab bar mobile, sem duplicar a lista de links.

### Requirement 5: StatCard — Aparência Visual Glassmorphism

**Objetivo:** Como viajante visualizando a Home, quero ver as estatísticas da viagem em cards com visual glassmorphism sobre o gradiente roxo, para ter uma visão rápida e atrativa dos dados da trip.

#### Acceptance Criteria
1. The StatCard component shall aplicar estilo glassmorphism usando `background: var(--glass)`, `backdrop-filter: blur(16px)`, `border: 1px solid var(--glass-border)` e `border-radius: 16px`.
2. The StatCard component shall exibir o valor numérico/textual com `font-size: 2.4rem`, `font-weight: 800` e `color: var(--warning)` (âmbar).
3. The StatCard component shall exibir um rótulo descritivo (label) abaixo do valor, com `color: white` ou `var(--light)`.
4. Where um ícone ou emoji for fornecido via props, the StatCard component shall renderizá-lo visualmente associado ao valor.
5. When o cursor passar sobre o StatCard, the StatCard component shall aumentar a opacidade do background glass usando a variável `var(--glass-hover)` em substituição a `var(--glass)`, sem manipular o valor de opacidade diretamente via JavaScript ou Tailwind inline.

### Requirement 6: StatCard — Props, Tipagem e Restrições de Uso

**Objetivo:** Como desenvolvedor, quero que o StatCard seja um componente simples, bem tipado e sem lógica de dados, para reutilizá-lo em qualquer página sem efeitos colaterais.

#### Acceptance Criteria
1. The StatCard component shall aceitar as props `value: string | number`, `label: string` e opcionalmente `icon?: string`.
2. The StatCard component shall ser implementado em TypeScript com modo strict, sem uso de `any`.
3. The StatCard component shall ser um Server Component por padrão — não deve conter `"use client"` enquanto não houver interatividade necessária.
4. The StatCard component shall não conter lógica de busca ou transformação de dados — apenas renderização das props recebidas.
5. If uma prop obrigatória (`value` ou `label`) não for fornecida, the StatCard component shall falhar em tempo de compilação TypeScript com erro de tipo.

### Requirement 7: Convenções Compartilhadas e Variáveis CSS Semânticas

**Objetivo:** Como desenvolvedor, quero que ambos os componentes sigam rigorosamente as convenções do projeto e que todas as variáveis CSS de navegação estejam definidas semanticamente no globals.css, para garantir consistência, manutenibilidade e integração com as páginas.

#### Acceptance Criteria
1. The Nav component shall residir em `components/Nav.tsx` e the StatCard component shall residir em `components/StatCard.tsx`, seguindo a convenção PascalCase do projeto.
2. The Nav component and the StatCard component shall usar exclusivamente CSS custom properties definidas em `globals.css` para todos os valores de cor e nunca hex ou rgba hardcoded.
3. The `globals.css` shall definir as seguintes variáveis semânticas adicionais no bloco `:root`: `--nav-bg-desktop` (equivale a `rgba(102,126,234,0.4)`), `--nav-bg-mobile` (equivale a `rgba(80,60,180,0.92)`), `--nav-hover-desktop` (equivale a `rgba(255,255,255,0.18)`), `--glass-hover` (equivale a `rgba(255,255,255,0.20)` — estado hover do glassmorphism).
4. The Nav component and the StatCard component shall passar verificação de tipos TypeScript (`tsc --noEmit`) sem erros em modo strict.
5. The Nav component and the StatCard component shall não importar nem usar nenhuma biblioteca de componentes UI externa — todos os estilos são handcrafted conforme a identidade visual.
6. If o build do Next.js (`npm run build`) gerar erro por causa de algum destes componentes, the build shall ser corrigido antes de avançar para a implementação das páginas dependentes.
