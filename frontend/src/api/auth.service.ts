// src/api/auth.service.ts
import { HttpClient } from './http';

export type AuthUser = { id:number; usuario:string; email:string; ativo:boolean };
export type AuthResponseLoose = {
  token?: string;
  jwt?: string;
  accessToken?: string;
  expiresIn?: number;
  refreshToken?: string;
  refresh?: string;
  user?: AuthUser;
};

export class AuthService {
  constructor(private http = new HttpClient()) {}

  async login(usuario: string, senha: string) {
    const r = await this.http.post<AuthResponseLoose>('/auth/tokens', { usuario, senha });

    // normaliza campos com fallback
    const access = r.token ?? r.jwt ?? r.accessToken;
    const refresh = r.refreshToken ?? r.refresh;

    if (!access) {
      throw new Error('Resposta de login sem token');
    }

    localStorage.setItem('access_token', access);
    if (refresh) localStorage.setItem('refresh_token', refresh);
    if (r.user) localStorage.setItem('me', JSON.stringify(r.user));
  }

  async me(): Promise<AuthUser> {
    const u = await this.http.get<AuthUser>('/auth/me');
    localStorage.setItem('me', JSON.stringify(u));
    return u;
  }

  async logout() {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) { try { await this.http.post('/auth/logout', refresh); } catch {} }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('me');
  }

  get currentUser(): AuthUser | null {
    const raw = localStorage.getItem('me');
    return raw ? JSON.parse(raw) : null;
  }
}
