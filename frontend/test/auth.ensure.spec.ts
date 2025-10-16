/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auth } from '../src/services/auth';

vi.stubGlobal('fetch', vi.fn());
const VITE_API_BASE = 'http://api.test/v1';

function mockFetchOnce(status: number, body: any) {
  (fetch as any).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  });
}

beforeEach(() => {
  (global as any).importMeta = { env: { VITE_API_BASE } };
  localStorage.clear();
  (fetch as any).mockReset();
});

it('não faz nada se o token ainda estiver válido', async () => {
  localStorage.setItem('token', 'OLD');
  localStorage.setItem('refreshToken', 'R1');
  const future = Date.now() + 60_000;
  localStorage.setItem('expiresAt', String(future));

  await auth.ensure();

  expect(fetch).not.toHaveBeenCalled();
  expect(localStorage.getItem('token')).toBe('OLD');
});

it('faz refresh se expirado e atualiza tokens', async () => {
  localStorage.setItem('token', 'OLD');
  localStorage.setItem('refreshToken', 'R1');
  const past = Date.now() - 1000;
  localStorage.setItem('expiresAt', String(past));

  mockFetchOnce(200, { jwt: 'NEW', refresh: 'R2', expiresIn: 3600 });

  await auth.ensure();

  expect(localStorage.getItem('token')).toBe('NEW');
  expect(localStorage.getItem('refreshToken')).toBe('R2');
});
