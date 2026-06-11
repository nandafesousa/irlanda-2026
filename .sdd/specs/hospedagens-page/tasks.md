# Plano de Implementação

## Feature: hospedagens-page

---

- [ ] 1. Normalizar dados de hospedagem em lib/sheets.ts
- [x] 1.1 (P) Implementar função interna de normalização de linha
  - Criar função `normalizeHotelRow` dentro de `lib/sheets.ts` que recebe uma linha bruta como `Record<string, string>` e retorna `Hotel | null`
  - Normalizar `status` com `.trim().toLowerCase()` e rejeitar valores diferentes de `'confirmado'` ou `'pendente'`, retornando `null` para casing inválido ou valor desconhecido
  - Converter `preco_total` e `noites` via `Number(campo.trim())` e retornar `null` para linhas onde o resultado for `isNaN`
  - Normalizar `moeda` com `.trim().toUpperCase()` para cast para `Currency`; aplicar `.trim()` em todos os campos de texto opcionais
  - Mapear `link_booking` e `observacoes` ausentes ou vazios como `undefined`; `endereco` ausente como string vazia, conforme o contrato do tipo `Hotel`
  - Emitir `console.warn` com o índice da linha descartada para facilitar debug durante edição da planilha
  - _Requirements: 1.6, 1.7_

- [x] 1.2 Integrar normalização em `getHospedagens`
  - Chamar `normalizeHotelRow` para cada linha retornada por `fetchSheetRange('Hospedagens!A:Z')`
  - Aplicar `.filter(Boolean)` ao resultado do mapeamento para remover entradas nulas sem lançar exceção
  - Garantir retorno `Hotel[]` estritamente tipado sem uso de `any`
  - Confirmar que o módulo possui o guard `import 'server-only'` para impedir inclusão no bundle do browser
  - _Requirements: 1.1, 1.3, 1.4, 1.7_

- [x] 2. (P) Criar helper puro de cálculo de totais financeiros
  - Criar arquivo `lib/finance.ts` exportando a interface `TotalsByMoeda` com campos `confirmed`, `pending` e `total` por chave de moeda
  - Implementar `calculateHospedagensTotals(hotels: Hotel[]): TotalsByMoeda` usando `reduce` para agrupar `preco_total` por `moeda`, separando por `status`
  - Garantir invariante `total = confirmed + pending` em cada entrada do objeto resultado; retornar `{}` para array de entrada vazio sem lançar exceção
  - Manter a função pura — sem I/O, sem `console.*`, sem `import 'server-only'` (deve ser importável e testável em Node.js sem setup do Next.js)
  - _Requirements: 5.2, 5.3, 5.4, 5.5_

- [x] 3. Atualizar componente HotelCard
- [x] 3.1 (P) Refatorar estrutura base e comportamento de hover
  - Remover quaisquer event handlers (`onMouseEnter`, `onMouseLeave`) e diretiva `"use client"`, mantendo o componente como Server Component puro
  - Aplicar classes de raiz: `relative overflow-hidden rounded-[18px] bg-white/80 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:shadow-[0_18px_52px_rgba(0,0,0,0.14)] transition-all duration-300 h-full flex flex-col justify-between`
  - Adicionar prop `index: number` à interface de props tipada como `{ hotel: Hotel; index: number }` sem uso de `any`
  - Confirmar ausência de qualquer JavaScript de interação no bundle do cliente — todo hover exclusivamente via Tailwind CSS
  - _Requirements: 3.9, 6.2, 6.3_

- [x] 3.2 Implementar indicadores de status — top stripe e badge
  - Calcular `isConfirmed = hotel.status === 'confirmado'` como constante local no corpo do componente
  - Renderizar `<div>` absoluta com `absolute top-0 inset-x-0 h-1` e gradiente `var(--primary) → var(--accent)` quando confirmado, ou `var(--warning) → #e9b000` quando pendente, via `style` inline
  - Renderizar badge "✅ Confirmado" com fundo `rgba(0,184,148,0.12)`, cor `var(--success)` e borda `rgba(0,184,148,0.3)` quando confirmado
  - Renderizar badge "⏳ Pendente" com fundo `rgba(253,203,110,0.15)`, cor `#c07900` e borda `rgba(253,203,110,0.5)` quando pendente
  - Aplicar `border-radius: 20px`, `font-size: 0.78rem` e `font-weight: 600` em ambos os badges; usar CSS custom properties de cor de `globals.css` — nenhum hexadecimal inline em propriedades que representem tokens de cor do design system
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 6.5_

- [x] 3.3 Implementar campos do card com renderização condicional e animação de entrada
  - Renderizar `nome_hotel` como título principal, `cidade` como subtítulo e datas `data_checkin`/`data_checkout` com `noites` em meta-grid `grid grid-cols-2 gap-3` com fundo `var(--light)` e `border-radius: 10px`
  - Exibir `preco_total` formatado com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: hotel.moeda })` em área de destaque com fundo gradient rgba sobre os tokens de cor
  - Renderizar link `<a target="_blank" rel="noopener noreferrer">` com texto de reserva somente quando `hotel.link_booking` estiver definido (não `undefined`)
  - Renderizar seção de observações somente quando `hotel.observacoes` estiver definido; exibir `hotel.endereco` somente quando a string não for vazia
  - Aplicar animação `fadeInUp 0.6s ease-out both` com `animationDelay: index * 0.1 + 's'` via `style` inline na raiz do card (necessário em Server Component — sem acesso a estado de runtime)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 6.4_

- [x] 4. Criar rota /hospedagens
- [x] 4.1 Preparar diretório de rota e Error Boundary
  - Remover o diretório `app/accommodations/` por completo — rota de draft com nome incorreto; `Nav.tsx` já aponta para `/hospedagens`
  - Criar `app/hospedagens/error.tsx` com diretiva `"use client"`, props `{ error: Error & { digest?: string }; reset: () => void }` e UI glass panel com botão "Tentar novamente"
  - Exibir mensagem genérica amigável sem expor `error.message` — usar `error.digest` opcionalmente apenas como referência de log interna
  - Seguir o padrão visual e estrutural de `app/roteiro/error.tsx` já implementado (mesmo estilo glassmorphism)
  - _Requirements: 1.5_

- [x] 4.2 Criar página principal de hospedagens
  - Criar `app/hospedagens/page.tsx` como Server Component exportando `export const revalidate = 300` no escopo do arquivo e `export const metadata` com título `'Hospedagens | Irlanda & UK 2026'` e descrição
  - Buscar dados chamando `getHospedagens()` de `lib/sheets.ts`; nenhum valor de `process.env` serializado como prop ou acessível pelo bundle cliente
  - Renderizar cabeçalho com título "Hospedagens" e subtítulo exibindo o total de registros retornados (ex.: "4 hospedagens")
  - Renderizar grid `<div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">` mapeando cada `Hotel` para `<HotelCard hotel={hotel} index={index} />`; quando `hotels.length === 0`, renderizar glass panel com mensagem "Nenhuma hospedagem válida encontrada. Verifique o preenchimento da planilha." sem renderizar grid nem seção de totais
  - Calcular totais via `calculateHospedagensTotals(hotels)` importado de `lib/finance.ts` e renderizar seção glass panel (`var(--glass)`, `backdrop-filter: blur(16px)`, `border: 1px solid var(--glass-border)`) abaixo do grid com: total de noites, contagem "X de Y confirmadas" e totais por moeda formatados via `Intl.NumberFormat('pt-BR', { style: 'currency', currency })`; exibir linhas separadas por moeda quando `TotalsByMoeda` tiver múltiplas chaves
  - Confirmar que tipografia Segoe UI, gradiente de fundo e navegação são herdados de `app/layout.tsx` sem regras `@media` customizadas ou hexadecimais inline em `page.tsx`
  - _Requirements: 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.5, 6.6, 6.7_

- [x] 5. Implementar testes
- [x] 5.1 (P) Testes unitários de normalização de linha em lib/sheets.ts
  - Verificar que `normalizeHotelRow` normaliza `" CONFIRMADO "` para `'confirmado'` e `"Pendente"` para `'pendente'`
  - Verificar que linhas com `preco_total = "abc"` ou `noites = ""` retornam `null`
  - Verificar que `link_booking` ausente resulta em `undefined` no objeto `Hotel` retornado
  - _Requirements: 1.6, 1.7_

- [x] 5.2 (P) Testes unitários de `calculateHospedagensTotals` em lib/finance.ts
  - Verificar cálculo correto de `TotalsByMoeda` com array misto de hotéis EUR e GBP com status variados
  - Verificar invariante `total = confirmed + pending` para cada moeda no resultado
  - Verificar que a função retorna `{}` para array vazio sem lançar exceção
  - _Requirements: 5.2, 5.3, 5.4, 5.5_

- [x] 5.3 (P) Testes de renderização de HotelCard
  - Verificar que `HotelCard` com `status = 'confirmado'` renderiza o texto "✅ Confirmado" no HTML gerado
  - Verificar que `HotelCard` com `status = 'pendente'` renderiza o texto "⏳ Pendente" no HTML gerado
  - Verificar que `HotelCard` sem `link_booking` não renderiza elemento `<a>` de reserva no output
  - _Requirements: 3.1, 4.1, 4.2_

- [x] 5.4 Testes de integração da página /hospedagens
  - Verificar que `HospedagensPage` com mock retornando array misto (EUR + GBP) exibe totais separados para ambas as moedas formatados via `Intl.NumberFormat`
  - Verificar que `HospedagensPage` com mock retornando `[]` renderiza o glass panel de aviso e não inclui a seção de totais no HTML
  - Verificar que `getHospedagens` com fixture de planilha contendo `status = " CONFIRMADO "` retorna `HotelStatus = 'confirmado'` no array resultante
  - _Requirements: 1.5, 1.6, 5.5_
