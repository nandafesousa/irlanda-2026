# Plano de Implementação — home-page

- [ ] 1. RouteMap — mini-mapa horizontal do percurso

- [x] 1.1 Configurar os estilos de animação e construir a estrutura de chips e lista semântica
  - Adicionar as classes `.route-chip` (estado inicial: `opacity: 0`, `transform: translateY(16px)`) e `.route-chip.is-visible` (dispara `fadeInUp`) em `@layer components` no `globals.css`
  - Exportar a interface `RouteChip` com os campos `city`, `emoji`, `date` e `accentVar`
  - Renderizar o container como `<ol aria-label="Percurso da viagem">` com scroll horizontal habilitado (`overflow-x: auto`) em mobile
  - Renderizar cada cidade como `<li>` wrapping um chip glassmorphism com nome, emoji e data de entrada; aplicar a cor de acento da cidade via `style borderColor var(accentVar)`
  - Inserir separadores direcionais `→` entre chips consecutivos como `<li aria-hidden="true">`; não renderizar separador após o último chip
  - Atribuir a cada chip a classe `route-chip` e a ref condicional `if (el) chipRefs.current[i] = el` para evitar sobrescrita com `null` na desmontagem
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 1.2 Implementar a lógica de animação via Intersection Observer com fallback e cleanup de memória
  - Verificar `'IntersectionObserver' in window` no `useEffect`; se ausente, aplicar `is-visible` diretamente em todos os chips e retornar (fallback para browsers legados — `@supports` CSS não detecta APIs JS)
  - Criar o observer com `threshold: 0.15` e `rootMargin: '0px 50px 0px 50px'` para pré-carregar a animação antes de o chip entrar completamente na viewport
  - No callback do observer, adicionar `is-visible` ao chip que entrou na viewport e chamar `observer.unobserve` nesse elemento — a animação dispara uma única vez por chip
  - Capturar `chipRefs.current` em `currentRefs` antes de iniciar o loop de observação; usar `currentRefs` no cleanup `return () => observer.disconnect()` para evitar referências obsoletas
  - Adicionar `chips` como dependência do `useEffect` para re-registrar o observer caso a lista de chips mude
  - _Requirements: 3.6, 5.4_

- [x] 2. Página Home — construir o layout estático do servidor

- [x] 2.1 Construir o header hero com gradiente, título, subtítulo e textura noise
  - Declarar `export const revalidate = false` e `export const metadata` com título e descrição da página no topo do módulo
  - Renderizar um `<header>` com gradiente de fundo via `style={{ background: 'linear-gradient(135deg, var(--grad-start) 0%, var(--grad-end) 100%)' }}` e `background-attachment: fixed` no body (via `globals.css` existente)
  - Inserir o `<h1>` "Irlanda & Reino Unido 2026" com `font-weight: 800` e cor branca; aplicar tamanho responsivo com `clamp(1.7rem, 4vw, 2.5rem)` ou breakpoint `text-[1.7rem] sm:text-[2.5rem]`
  - Adicionar subtítulo com período "Ago–Set 2026" e indicação das 2 viajantes abaixo do `h1`
  - Incluir elemento de textura noise com `aria-hidden="true"` absolutamente posicionado sobre o header, usando SVG com `feTurbulence` em `opacity: 0.04`
  - Aplicar a animação `slideDown` ao bloco do header (keyframe já definido em `globals.css`)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 2.2 Renderizar os quatro cards de estatísticas com valores estáticos
  - Declarar a constante imutável `STAT_ITEMS` no escopo do módulo com os quatro objetos: 18 dias, 6 cidades, 5 trechos, 2 amigas — cada um com `value`, `label` e `icon`
  - Renderizar os quatro `StatCard` (componente já existente de `base-components`) passando os literais da constante; sem chamada a nenhuma API externa
  - Envolver os cards em um container com grid `grid-cols-2` em mobile (≤ 768px) e `md:grid-cols-4` em desktop (≥ 769px)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 2.3 Integrar o RouteMap e construir os cards de navegação para as seções
  - Declarar a constante imutável `ROUTE_CHIPS` com os seis objetos de cidade (Dublin→Belfast→Edinburgh→Liverpool→London→Dublin) e passá-la como prop para `<RouteMap chips={ROUTE_CHIPS} />`
  - Declarar a constante imutável `NAV_SECTION_CARDS` com os três objetos de seção (Roteiro `/roteiro`, Hospedagens `/hospedagens`, Transportes `/transportes`), cada um com `href`, `icon`, `title` e `description`
  - Renderizar os três cards de navegação como `<a>` tags; cada card é branco com `border-radius: 18px`, sombra padrão do design system e uma top stripe de 4px com gradiente `var(--primary)` → `var(--accent)`
  - Envolver os cards em grid `grid-cols-1` em mobile e `md:grid-cols-3` em desktop; aplicar hover lift `hover:-translate-y-1` com transição e sombra aprofundada
  - Exportar o componente como Server Component puro — sem `"use client"`, sem `useState`, sem fetch a APIs externas; garantir que nenhuma variável de ambiente seja serializada como prop
  - Garantir a ordem vertical das seções: Hero Header → Stats → RouteMap → Cards de Navegação dentro de um container com `max-w-[1000px] mx-auto px-6`
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.1, 5.2, 5.3, 7.1, 7.2, 7.3_

- [x] 2.4 Aplicar estrutura geral, animações de entrada das seções e responsividade mobile
  - Aplicar `fadeInUp` com `animationDelay` escalonado (`0.1s`, `0.2s`, `0.3s`) aos blocos de Stats, RouteMap e Cards de Navegação para o efeito stagger após o header
  - Adicionar `padding-bottom: pb-[80px] md:pb-8` ao container mais externo da página para evitar que o bottom nav (gerenciado por `app/layout.tsx`) sobreponha a última seção
  - Verificar que todas as seções colapsam para layout de coluna única em mobile (≤ 768px) e expandem para multi-coluna em desktop (≥ 769px) conforme as classes Tailwind definidas nas tasks 2.2 e 2.3
  - Garantir que nenhum valor de cor hex seja escrito diretamente nos componentes — todas as cores passam por `var(--*)` de `globals.css`
  - Verificar ausência de layout shift (CLS ≈ 0): a página é 100% estática, sem fetch dinâmico ou placeholders de carregamento
  - _Requirements: 5.4, 5.5, 5.6, 6.1, 6.2, 6.3, 6.4_

- [x] 3. (P) Implementar o Error Boundary da rota raiz
  - Criar `app/error.tsx` com `"use client"` seguindo o contrato `ErrorPageProps { error: Error & { digest?: string }; reset: () => void }`
  - Renderizar uma mensagem de erro amigável em português dentro de um card glassmorphism (usando as mesmas classes do design system); incluir botão "Tentar novamente" que chama `reset()`
  - Não exibir `error.message` nem stack trace ao usuário; usar apenas `error.digest` quando disponível (opaco)
  - Pode ser implementada em paralelo com qualquer sub-task dos Major Tasks 1 ou 2, pois escreve somente em `app/error.tsx` sem conflito de arquivo
  - _Requirements: 7.4_

- [x] 4. Testes e verificação de build

- [x] 4.1* Testes unitários do RouteMap e da página Home
  - Verificar que `RouteMap` renderiza exatamente 6 chips e 5 separadores `→` com `chips.length === 6`
  - Verificar que `RouteMap` não renderiza separador quando `chips.length === 1`
  - Simular ausência de `IntersectionObserver` (`delete window.IntersectionObserver`) e confirmar que todos os chips recebem a classe `is-visible` imediatamente
  - Verificar que `RouteMap` adiciona `is-visible` ao chip correto quando o observer dispara `isIntersecting: true` e não dispara novamente após `unobserve`
  - Verificar que `HomePage` renderiza 4 `StatCard` com os valores 18, 6, 5 e 2
  - Verificar que `HomePage` renderiza 3 cards de navegação com os hrefs `/roteiro`, `/hospedagens` e `/transportes`
  - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6, 2.1, 4.1, 4.2_

- [x] 4.2 Verificação de build TypeScript e testes de integração
  - Executar `tsc --noEmit` e confirmar zero erros de tipo em `app/page.tsx`, `app/error.tsx` e `components/RouteMap.tsx`
  - Executar `npm run build` e confirmar que a rota `/` é gerada como página estática sem erros
  - Verificar manualmente no browser (ou emulador): header com gradiente visível; 4 stat cards; 6 chips do percurso; 3 nav cards
  - Verificar responsividade em viewport 375px: layout coluna única, scroll horizontal do mini-mapa funcional, bottom nav não sobrepõe conteúdo
  - Verificar Lighthouse Performance ≥ 90 no modo mobile; confirmar ausência de recursos render-blocking além da fonte do sistema
  - _Requirements: 7.5_
