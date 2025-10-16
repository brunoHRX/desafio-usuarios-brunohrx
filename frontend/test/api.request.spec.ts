/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */


// test/api.request.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.stubGlobal('fetch', vi.fn());

const VITE_API_BASE = 'http://api.test/v1';

function mockFetchOnce(status: number, body: any, headers: Record<string, string> = {}) {
  (fetch as any).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
    json: async () => body,
    headers: new Map(Object.entries(headers)),
  });
}

describe('api.request', () => {
  let api: any;

  beforeEach(async () => {
    // ⬇️ define VITE_API_BASE *antes* de importar o módulo
    vi.stubEnv('VITE_API_BASE', VITE_API_BASE);
    (fetch as any).mockReset();
    localStorage.clear();

    // ⬇️ força recarregar o módulo com o env novo
    vi.resetModules();
    api = (await import('../src/services/api')).api;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('refaz a chamada após 401 usando refresh e atualiza tokens', async () => {
    localStorage.setItem('token', 'OLD');
    localStorage.setItem('refreshToken', 'REF1');

    // 1ª tentativa => 401
    mockFetchOnce(401, 'Unauthorized');
    // refresh OK
    mockFetchOnce(200, { jwt: 'NEW', refresh: 'REF2' });
    // refaz a request original => 200
    mockFetchOnce(200, { ok: true });

    const res = await api.get('/users');
    expect(res).toEqual({ ok: true });

    expect(localStorage.getItem('token')).toBe('NEW');
    expect(localStorage.getItem('refreshToken')).toBe('REF2');

    // chamadas realizadas
    expect((fetch as any).mock.calls[0][0]).toBe(`${VITE_API_BASE}/users`);
    expect((fetch as any).mock.calls[1][0]).toBe(`${VITE_API_BASE}/auth/refresh`);
    expect((fetch as any).mock.calls[2][0]).toBe(`${VITE_API_BASE}/users`);
  });
});
