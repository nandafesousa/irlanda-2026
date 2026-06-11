# Plano de Implementação — roteiro-page

---

> **Estratégia de paralelismo**: Após concluir a Tarefa 1, as Tarefas 2 e 3.1 podem ser executadas em paralelo — cada uma cria um arquivo novo e independente. As Tarefas 5 e 6 modificam os mesmos arquivos e devem ser sequenciais.

---

- [ ] 1. Dados do roteiro, cabeçalho e estrutura da timeline

- [x] 1.1 Buscar dados da planilha no servidor e calcular acento cíclico por índice
  - Chamar a função de busca do roteiro exclusivamente no contexto do servidor, sem nenhum estado ou efeito no componente da página
  - Confirmar que o cache ISR de 1 hora está ativo na camada de acesso a dados, independente da implementação interna do cliente da Sheets API
  - Para cada cidade, derivar a variável CSS de acento com fórmula cíclica `(index % 6) + 1` baseada na posição na lista — sem referenciar o nome da cidade em nenhuma lógica de mapeamento de cor
  - Verificar que nenhuma credencial de API (ID da planilha, API key) é serializada como prop ou incluída no bundle enviado ao browser
  - _Requirements: 1.1, 1.2, 1.4, 1.5, 2.5, 5.1_

- [x] 1.2 Cabeçalho da página com título, período, contador de cidades e metadados SEO
  - Renderizar título "Roteiro" e subtítulo com o período geral da viagem (ex.: "Ago–Set 2026")
  - Exibir o total de cidades retornadas da planilha em um badge ou indicador visual junto ao cabeçalho
  - Aplicar container de largura máxima 1000px centralizado com padding lateral, envolvendo todo o conteúdo da página
  - Exportar metadados de SEO via API de metadados do Next.js com título e descrição relevantes para a rota de roteiro
  - _Requirements: 2.4, 2.6, 5.6, 7.4_

- [x] 1.3 Container da timeline — CSS Grid zigzag e linha conectora
  - Implementar a lista de cidades usando elementos semânticos de lista ordenada (`<ol>`) com itens filhos diretos (`<li>`), e heading hierárquico abaixo do `<h1>` da página
  - Configurar CSS Grid de duas colunas para desktop: cards de índice ímpar se posicionam à direita da coluna esquerda; cards de índice par, à esquerda da coluna direita — efeito zigzag via seletor `nth-child` CSS sem lógica de posição nos componentes filhos
  - Adicionar linha conectora vertical via pseudo-elemento no container da lista, posicionada absolutamente no centro horizontal com `left: 50%; transform: translateX(-50%)` e altura total — garante traço contínuo independente da altura individual dos cards
  - Verificar que o gradiente de fundo e a tipografia do sistema são herdados corretamente do layout raiz, sem redefinição na página
  - _Requirements: 2.1, 2.2, 2.3, 5.3, 5.4, 7.1_

- [x] 2. (P) Implementar Error Boundary da rota de roteiro
  - Criar componente cliente de tratamento de erro que exibe mensagem amigável em português sem revelar stack trace ou detalhes técnicos ao usuário
  - Incluir botão "Tentar novamente" que aciona a tentativa de re-renderização da rota pelo mecanismo nativo do Next.js
  - Estilizar com o padrão glassmorphism do app (painel translúcido sobre gradiente) para manter coerência visual durante falhas
  - Confirmar que, ao acionar o boundary, o layout global — navegação e gradiente de fundo — permanece funcional; apenas o conteúdo da rota é substituído
  - _Requirements: 1.3_

- [x] 3. CityCard — estado fechado e visual base

- [x] 3.1 (P) Estrutura do card e exibição do resumo da cidade
  - Criar componente cliente de card de cidade com `<li>` como elemento raiz, garantindo compatibilidade com o seletor `nth-child` do container da timeline
  - Exibir no estado fechado: emoji, nome da cidade, datas de entrada e saída, número de noites e principal destaque
  - Aplicar estilo de card branco com sombra de repouso (`0 8px 32px rgba(0,0,0,0.1)`), `border-radius: 18px` e borda esquerda de 4px sólida usando a variável CSS de acento recebida como prop — sem valores hexadecimais fixos no componente
  - Renderizar fallback `"—"` para campos de texto ausentes ou vazios
  - _Requirements: 3.1, 3.3, 5.2_

- [x] 3.2 Estilo visual, animação de entrada e indicador de expansão
  - Aplicar efeito de elevação ao passar o cursor: `translateY(-4px)` e sombra aprofundada (`0 18px 52px rgba(0,0,0,0.14)`), com transição suave de `0.3s ease`
  - Exibir chevron ou ícone indicativo do estado expansível, com rotação de 180° quando expandido — usando somente Tailwind e CSS, sem biblioteca de ícones externa
  - Configurar animação `fadeInUp` via `@keyframes` em `globals.css` com atraso proporcional ao índice do card aplicado como propriedade de estilo inline (`animationDelay: index * 0.1s`), sem bibliotecas de animação JavaScript
  - Garantir `animation-fill-mode: both` para evitar flash visual antes da animação iniciar
  - _Requirements: 3.2, 3.4, 3.5, 3.6_

- [x] 4. CityCard — expansão e seção de detalhes

- [x] 4.1 Estado de expansão com animação de altura nativa
  - Implementar estado booleano de expansão local por instância de card via `useState`, garantindo independência entre cards (req 4.6: múltiplos cards podem estar expandidos simultaneamente)
  - Usar o padrão CSS Grid row para animar a transição de altura — wrapper externo alterna entre `grid-rows-[0fr]` e `grid-rows-[1fr]` com `transition-[grid-template-rows] duration-300 ease-in-out`, eliminando o delay fantasma do hack de `max-height` com valor arbitrário
  - Garantir que o wrapper interno do conteúdo expansível tem `overflow-hidden` para prevenir transbordamento horizontal em qualquer tamanho de viewport
  - _Requirements: 4.1, 4.4, 4.5, 4.6, 6.6_

- [x] 4.2 Conteúdo expandido — atividades, bairro, preço e barra de destaque
  - Exibir no estado expandido: bairro da hospedagem, faixa de preço por noite e lista de atividades da cidade
  - Renderizar cada atividade como badge/tag individual seguindo o padrão do design system: `border-radius: 20px`, `font-size: 0.78rem`, `font-weight: 600`, cor via CSS custom properties
  - Implementar barra de destaque com gradiente horizontal usando a cor de acento atual e a cor adjacente no ciclo de 6 (`(index % 6) + 2`, com wrap seguro para índice 6 → 1); exibir o texto do destaque principal sobre a barra
  - Garantir que array vazio de atividades resulta em seção vazia sem erros de renderização — o array já chega higienizado da camada de dados
  - _Requirements: 4.2, 4.3, 4.7, 5.5_

- [x] 5. Atributos de acessibilidade e navegação por teclado
  - Implementar o header do card como `<button>` nativo HTML com altura mínima de `44px`, `aria-expanded` refletindo o estado booleano corrente, e `aria-controls` apontando para o ID do painel de detalhes
  - Adicionar `id` único por card e `role="region"` no wrapper do painel de detalhes, criando o vínculo semântico explícito que leitores de tela utilizam para associar botão e painel
  - Confirmar que Enter e Espaço ativam o toggle de expansão pelo comportamento nativo do `<button>` — sem `onKeyDown` manual necessário
  - Verificar contraste WCAG AA: texto `var(--dark)` (#2D3436) sobre fundo branco dos cards satisfaz a relação mínima de 7:1; os tokens do design system garantem isso por construção
  - _Requirements: 6.5, 7.2, 7.3, 7.5_

- [ ] 6. Responsividade mobile

- [x] 6.1 Layout mobile — coluna única, cards full-width e linha conectora esquerda
  - Em viewports até `768px`, colapsar o CSS Grid para coluna única via breakpoint Tailwind, com todos os cards alinhados à esquerda sem efeito zigzag
  - Exibir os cards em largura total (`w-full`) sem margens horizontais excessivas
  - Reposicionar a linha conectora para a borda esquerda (ex.: `left: 24px`, removendo o `transform: translateX(-50%)`) no breakpoint mobile
  - _Requirements: 6.1, 6.2_

- [x] 6.2 Título responsivo, navegação herdada e verificação de touch
  - Reduzir o tamanho do título para `1.7rem` em viewports até `480px` via classe Tailwind ou `clamp()`
  - Verificar que a bottom navigation bar é fornecida pelo layout raiz sem nenhuma redefinição ou duplicação na página de roteiro
  - Confirmar que o botão header de cada CityCard possui `min-h-[44px]` como área de toque mínima para dispositivos touch
  - _Requirements: 6.3, 6.4, 6.5_

- [x] 7. Testes

- [x] 7.1 Testes unitários do CityCard
  - Verificar que o estado fechado renderiza emoji, nome, datas, noites e destaque com os dados corretos
  - Verificar que clicar no header do card alterna `isExpanded` de false para true e de volta para false
  - Verificar que `aria-expanded` reflete corretamente o estado booleano atual
  - Verificar que um card com `atividades: []` renderiza sem erros e sem itens de badge
  - Verificar que a fórmula cíclica de cor (`(index % 6) + 1`) retorna 1 para índice 0, 6 para índice 5, e 1 para índice 6
  - _Requirements: 3.1, 4.1, 4.6, 4.7, 7.2_

- [x] 7.2 Testes E2E da página de roteiro (adiado — não será implementado)
  - Acessar `/roteiro` e confirmar que a timeline está visível com todos os cards no estado fechado
  - Clicar no primeiro card e verificar que os detalhes (bairro, preço, atividades) ficam visíveis após expansão
  - Clicar novamente no mesmo card e verificar o fechamento com animação
  - Expandir dois cards e confirmar que ambos permanecem expandidos independentemente
  - Em viewport de 375px, verificar layout de coluna única e ausência de overflow horizontal
  - Navegar pelos cards via teclado (Tab + Enter) e confirmar toggle de expansão
  - _Requirements: 2.1, 3.1, 4.1, 4.2, 4.6, 6.1_
