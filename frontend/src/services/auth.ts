// src/services/auth.ts
import { api } from './api';

type UserSummary = { id: number; usuario: string; email: string; ativo: boolean };

type AuthResponse = {
  jwt?: string; accessToken?: string; token?: string;
  refresh?: string; refreshToken?: string;
  expiresIn: number; // segundos
  user: UserSummary;
};

// util local
const now = () => Date.now();

function getJwt()        { return localStorage.getItem('token'); }
function getRefresh()    { return localStorage.getItem('refreshToken'); }
function getExpiresAtMs(){ return Number(localStorage.getItem('expiresAt') || '0'); }
function setAuth(jwt?: string|null, refresh?: string|null, expiresIn?: number|null) {
  if (jwt !== undefined) {
    if (jwt) localStorage.setItem('token', jwt);
    else localStorage.removeItem('token');
  }
  if (refresh !== undefined) {
    if (refresh) localStorage.setItem('refreshToken', refresh);
    else localStorage.removeItem('refreshToken');
  }
  if (expiresIn !== undefined) {
    if (expiresIn && expiresIn > 0) {
      const exp = now() + (expiresIn - 10) * 1000;
      localStorage.setItem('expiresAt', String(exp));
    } else {
      localStorage.removeItem('expiresAt');
    }
  }
}

export const auth = {
  async login(usuario: string, senha: string) {
    const data = await api.post('/auth/login', { usuario, senha }) as AuthResponse;
    const jwt = data.jwt ?? data.accessToken ?? data.token;
    const refresh = data.refresh ?? data.refreshToken;
    if (!jwt || !refresh) throw new Error('Resposta de login sem tokens.');

    setAuth(jwt, refresh, data.expiresIn);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async logout() {
    try {
      const refresh = getRefresh();
      if (refresh) await api.post('/auth/logout', refresh);
    } catch { /* ignore */ }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('expiresAt');
  },


  isAuthenticated() {
    const jwt = getJwt();
    if (!jwt) return false;
    const exp = getExpiresAtMs();
    return exp > now();
  },

  currentUser(): UserSummary | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) as UserSummary : null;
  },


  async ensure(): Promise<void> {
    const jwt = getJwt();
    if (!jwt) return;
    const exp = getExpiresAtMs();
    if (exp > now()) return; // ainda válido

    const refresh = getRefresh();
    if (!refresh) { await this.logout(); return; }

    // tenta refresh
    try {
      const data = await api.post('/auth/refresh', refresh) as AuthResponse;
      const newJwt = data.jwt ?? data.accessToken ?? data.token;
      const newRefresh = data.refresh ?? data.refreshToken;
      if (!newJwt || !newRefresh) throw new Error('Refresh inválido.');
      setAuth(newJwt, newRefresh, data.expiresIn);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
    } catch {
      await this.logout();
    }
  },
};
