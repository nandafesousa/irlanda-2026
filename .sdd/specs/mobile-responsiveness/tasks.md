# Implementation Plan

## Sumário
- **Feature**: mobile-responsiveness
- **Cobertura**: 6 requisitos com lacunas de implementação + 16 requisitos já implementados (verificados em testes)
- **Status**: Pendente

> **Ordem de execução recomendada**: Task 1 → (Task 2 (P) e Tasks 3 (P) + 4 (P) em paralelo após Task 1) → Task 5

---

- [x] 1. Criar variáveis CSS e classe `.nav-mobile` em `globals.css`
  - Adicionar `--nav-bg-mobile-solid: rgba(80, 60, 180, 1)` e `--nav-height-mobile: 64px` ao bloco `:root`
  - Criar a classe `.nav-mobile` com `background: var(--nav-bg-mobile)`, `backdrop-filter: blur(20px)` e `-webkit-backdrop-filter: blur(20px)`
  - Adicionar bloco `@supports not (backdrop-filter: blur(1px))` que sobrescreve o background de `.nav-mobile` para `var(--nav-bg-mobile-solid)`, garantindo legibilidade em browsers sem suporte ao efeito de blur
  - Esta task deve ser concluída antes das Tasks 3 e 4, pois ambas consomem variáveis e a classe definidas aqui
  - _Requirements: 1.4_

- [x] 2. (P) Adicionar scroll-into-view com respiro visual ao `CityCard`
  - Adicionar a classe Tailwind `scroll-mt-4` ao elemento `<li>` raiz do `CityCard`, garantindo `1rem` de margem visual entre o topo do card e a borda superior da tela após o scroll
  - Criar um `useRef<HTMLLIElement>(null)` e anexá-lo ao `<li>` raiz
  - Adicionar um `useEffect` gateado em `isExpanded === true` que dispara `scrollIntoView({ behavior: 'smooth', block: 'start' })` após `150ms` (delay necessário para o layout estabilizar durante a animação `duration-300` de grid-rows; em iOS Safari, `smooth` é ignorado silenciosamente — o scroll ainda ocorre)
  - Incluir cleanup do `setTimeout` no retorno do `useEffect` para evitar chamada em componente desmontado
  - Task independente de todas as outras — pode ser executada em paralelo com a Task 1
  - _Requirements: 3.3_

- [x] 3. (P) Migrar estilos da bottom nav para classe CSS e adicionar feedback de toque
  - Remover `background` e `backdropFilter` do prop `style={{}}` do elemento `<nav>` mobile em `Nav.tsx`
  - Adicionar `nav-mobile` ao `className` desse `<nav>` (o background, blur e fallback `@supports` passam a ser gerenciados pela classe CSS criada na Task 1)
  - Manter `paddingBottom: 'env(safe-area-inset-bottom)'` como inline style (sem alteração)
  - Adicionar `active:opacity-80` ao `className` dos `<Link>` das abas mobile, para ambas as branches (ativa e inativa), provendo feedback visual imediato de toque
  - Requer Task 1 concluída (a classe `.nav-mobile` deve existir em `globals.css`)
  - Pode ser executada em paralelo com a Task 4 (arquivos distintos)
  - _Requirements: 1.4, 1.5_

- [x] 4. (P) Centralizar padding inferior e habilitar `viewport-fit` no layout raiz
- [x] 4.1 Atualizar `layout.tsx` com viewport export e padding centralizado no `<main>`
  - Importar o tipo `Viewport` de `'next'`
  - Exportar `export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' }` — habilita `env(safe-area-inset-*)` em todos os browsers compatíveis
  - Adicionar ao `<main>` a classe `pb-[calc(var(--nav-height-mobile)_+_env(safe-area-inset-bottom,0px))] md:pb-0` (underscores em torno do `+` são obrigatórios para o Tailwind JIT gerar CSS válido; `md:pb-0` anula o padding em desktop)
  - Requer Task 1 concluída (`--nav-height-mobile` deve estar definida em `globals.css`)
  - _Requirements: 1.7, 5.4, 6.2, 6.3, 6.4_

- [x] 4.2 Remover bottom paddings individuais das páginas
  - Remover `pb-[80px] md:pb-8` do div raiz de `app/page.tsx` (Home)
  - Substituir `padding: '2.5rem 1.5rem 6rem'` por `padding: '2.5rem 1.5rem'` no container de `app/roteiro/page.tsx`
  - Substituir `padding: '2.5rem 1.5rem 6rem'` por `padding: '2.5rem 1.5rem'` no container de `app/hospedagens/page.tsx`
  - Remover `pb-24` de `app/transportes/page.tsx`
  - Deve ser executada **após** a 4.1 — aplicar o padding centralizado no layout antes de remover os individuais evita que conteúdo fique oculto pela nav durante a transição
  - _Requirements: 1.7, 5.4_

- [x] 5. Validar implementação com testes
- [x] 5.1 Testar comportamento de scroll do `CityCard` ao expandir
  - Configurar `jest.spyOn(HTMLElement.prototype, 'scrollIntoView')` para interceptar chamadas
  - Ativar `jest.useFakeTimers()` e avançar `150ms` com `jest.advanceTimersByTime(150)` para controlar o delay
  - Verificar que `scrollIntoView` é chamado com `{ behavior: 'smooth', block: 'start' }` ao expandir o card
  - Verificar que `scrollIntoView` **não** é chamado ao colapsar o card
  - Verificar que o `<li>` raiz possui a classe `scroll-mt-4`
  - _Requirements: 3.3_

- [x] 5.2 Verificar comportamento responsivo dos requisitos já implementados
  - Em 375px: confirmar que a bottom nav está visível, o grid de hospedagens exibe 1 coluna e a timeline do roteiro exibe coluna única alinhada à esquerda
  - Em 769px: confirmar que a top nav está visível e a bottom nav está oculta, e o grid de hospedagens exibe 2 colunas
  - Confirmar que o `h1` hero utiliza `clamp()` sem overflow horizontal
  - Confirmar que as áreas de toque (abas da nav, botão do CityCard) têm `min-height ≥ 44px`
  - Confirmar que as páginas desktop não apresentam padding-bottom excessivo após a centralização na Task 4
  - _Requirements: 1.1, 1.2, 1.3, 1.6, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 6.1_
