import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { revalidatePath } from 'next/cache';
import { GET } from './route';

const mockRevalidatePath = revalidatePath as ReturnType<typeof vi.fn>;

function makeRequest(token?: string): NextRequest {
  const url = token
    ? `http://localhost/api/revalidate?token=${token}`
    : 'http://localhost/api/revalidate';
  return new NextRequest(url);
}

describe('GET /api/revalidate', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('retorna 500 quando REVALIDATE_TOKEN não está configurado', async () => {
    delete process.env.REVALIDATE_TOKEN;
    const res = await GET(makeRequest('qualquer-token'));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({ error: 'server misconfiguration' });
  });

  it('retorna 401 quando token está ausente na query string', async () => {
    process.env.REVALIDATE_TOKEN = 'secret123';
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: 'unauthorized' });
  });

  it('retorna 401 quando token está incorreto', async () => {
    process.env.REVALIDATE_TOKEN = 'secret123';
    const res = await GET(makeRequest('token-errado'));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: 'unauthorized' });
  });

  it('retorna 200 e chama revalidatePath quando token está correto', async () => {
    process.env.REVALIDATE_TOKEN = 'secret123';
    const res = await GET(makeRequest('secret123'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ revalidated: true });
    expect(mockRevalidatePath).toHaveBeenCalledWith('/transportes');
  });

  it('retorna 401 para token vazio ("")', async () => {
    process.env.REVALIDATE_TOKEN = 'secret123';
    const res = await GET(makeRequest(''));
    expect(res.status).toBe(401);
  });

  it('não expõe o token na resposta de erro', async () => {
    process.env.REVALIDATE_TOKEN = 'secret123';
    const res = await GET(makeRequest('token-errado'));
    const body = await res.json();
    const bodyStr = JSON.stringify(body);
    expect(bodyStr).not.toContain('secret123');
    expect(bodyStr).not.toContain('token-errado');
  });
});
