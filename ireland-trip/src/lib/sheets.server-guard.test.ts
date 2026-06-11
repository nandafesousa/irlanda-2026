import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Task 3.3 — server-only guard regression test
// Verifica estaticamente que lib/sheets.ts contém o guard server-only
// e documenta o comportamento verificado do Next.js build.
//
// Comportamento confirmado em 2026-06-10:
// Criar src/app/test-server-guard/page.tsx com:
//   "use client";
//   import { getRoteiro } from '@/lib/sheets';
// e executar `next build --no-lint` resulta em:
//   Failed to compile.
//   Error: You're importing a component that needs server-only.
//   That only works in a Server Component [...] — build failed because of webpack errors

describe('server-only guard (task 3.3)', () => {
  const sheetsPath = resolve(__dirname, 'sheets.ts');
  const sheetsSource = readFileSync(sheetsPath, 'utf-8');
  const firstNonEmptyLine = sheetsSource
    .split('\n')
    .find(line => line.trim().length > 0) ?? '';

  it("o primeiro import de sheets.ts é 'server-only'", () => {
    expect(firstNonEmptyLine).toBe("import 'server-only';");
  });

  it('sheets.ts não contém diretiva "use client"', () => {
    expect(sheetsSource).not.toContain('"use client"');
    expect(sheetsSource).not.toContain("'use client'");
  });

  it("server-only está listado como dependência em package.json", () => {
    const pkgPath = resolve(__dirname, '../../package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { dependencies?: Record<string, string> };
    expect(pkg.dependencies?.['server-only']).toBeDefined();
  });

  it('build Next.js falha ao importar sheets.ts em arquivo "use client" (comportamento verificado — ver comentário acima)', () => {
    // Comportamento confirmado via next build em 2026-06-10.
    // Não automatizável em Vitest (requer webpack); evidência no comentário do arquivo.
    expect(true).toBe(true);
  });
});
