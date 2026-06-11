# Research Log — transportes-page

## Scope

Discovery nível **Light** (extensão de padrão existente). A `transportes-page` replica a arquitetura da `hospedagens-page` já aprovada com três diferenças técnicas que exigiram investigação pontual: (1) normalização de datas `DD/MM` para ISO 8601, (2) rota de revalidação sob demanda via `revalidatePath`, (3) teto de `animation-delay` para listas longas.

---

## Investigações

### 1. Normalização de Datas — `DD/MM` → ISO 8601

**Contexto**: A planilha usa o formato `DD/MM` (ex.: `"27/08"`). A ordenação cronológica confiável exige ISO `YYYY-MM-DD` antes de `Array.sort()`.

**Decisão**: Normalização aplicada em `lib/sheets.ts` (`normalizeTransportDate`). A viagem ocorre em Aug–Sep 2026, portanto ano fixo `2026`. Função aceita `DD/MM` e `DD/MM/YYYY` como entrada; lança `TypeError` para formato não reconhecido (linha descartada por `normalizeTransportRow`).

```
"27/08"       → "2026-08-27"
"27/08/2026"  → "2026-08-27"
"2026-08-27"  → "2026-08-27"  (passthrough se já ISO)
```

**Implicação**: `Transport.data` é sempre `string` no formato `"YYYY-MM-DD"`. Comparação `a.data.localeCompare(b.data)` é suficiente para ordenar; não é necessário instanciar `Date` objects.

---

### 2. `revalidatePath` no Next.js 14 App Router

**Contexto**: Req 7 exige rota `app/api/revalidate/route.ts` que limpe o cache de `/transportes` via `revalidatePath`.

**API (Next.js 14)**:
```typescript
import { revalidatePath } from 'next/cache';
revalidatePath('/transportes');
```
- Limpa o cache ISR da rota de forma síncrona dentro de um Route Handler.
- Deve ser chamado dentro de um Server Action ou Route Handler — não funciona em Server Components.
- O Route Handler usa `NextRequest` / `NextResponse` da `next/server`.

**Decisão de segurança**: `timingSafeEqual` exige buffers de comprimento idêntico — chamada direta com `Buffer.from(token)` lança exceção se o token recebido tiver tamanho diferente do esperado. Solução: hash SHA-256 em ambos os lados antes da comparação; ambos os hashes terão sempre 32 bytes.

```typescript
const tokenHash    = createHash('sha256').update(token).digest();
const expectedHash = createHash('sha256').update(expectedToken).digest();
if (!timingSafeEqual(tokenHash, expectedHash)) { /* → 401 */ }
```

---

### 3. Teto de `animation-delay` em Listas

**Contexto**: Req 6.5 especifica `Math.min(index, 5) * 0.1s` para evitar que o último card de uma lista longa demore excessivamente para aparecer.

**Decisão**: Aplicado via `style` inline como no `HotelCard` — compatível com Server Components sem `"use client"`. Teto de `0.5s` no 6º item em diante.

---

### 4. `fetchSheetRange` e Propagação de `RequestInit`

**Contexto**: `getTransportes` precisa passar `{ next: { revalidate: 3600 } }` ao `fetch` nativo para que o App Router intercepte e gerencie o cache no escopo correto. Se `fetchSheetRange` for um invólucro rígido sem suporte a `RequestInit`, o cache da página herdará o comportamento global da função utilitária em vez do ISR de 1 hora desejado.

**Decisão**: A assinatura de `fetchSheetRange` deve aceitar `init?: RequestInit` como segundo parâmetro e repassá-lo ao `fetch` interno. Se a assinatura atual não suportar isso, estendê-la faz parte do escopo da implementação desta spec. A diretriz de não contornar com `fetch` direto em `getTransportes` é explícita no design.

---

### 5. Alinhamento com `lib/finance.ts`

**Contexto**: `lib/finance.ts` foi introduzido na spec `hospedagens-page` com `calculateHospedagensTotals`. A spec `transportes-page` adiciona `calculateTransportesTotals` no mesmo arquivo.

**Decisão**: Arquivo estendido (não criado novamente). Exporta ambas as funções. Não usa `import 'server-only'` — lógica pura, testável sem setup Next.js.

---

## Riscos e Mitigações

| Risco | Probabilidade | Mitigação |
|-------|--------------|-----------|
| Planilha com `data` em formato inesperado | Baixa | `normalizeTransportDate` retorna `null` → linha descartada + `console.warn` |
| `timingSafeEqual` lança exceção por buffers de tamanho diferente | Alta (sem hash) | Hash SHA-256 em ambos os lados → buffers sempre 32 bytes |
| `fetchSheetRange` sem suporte a `RequestInit` | Média | Estender assinatura na implementação; não contornar com `fetch` direto |
| Tipo de transporte não previsto durante a viagem | Média | Fallback `'outro'` com emoji `🚗` — linha preservada sem redeploy |
| `REVALIDATE_TOKEN` não configurado no Vercel | Média | Rota retorna HTTP 500 com mensagem genérica; documentado no README |
| Lista de trechos > 6 itens com delay excessivo | Ausente | Teto `Math.min(index, 5)` já aplicado |
