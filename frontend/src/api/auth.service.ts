import { HttpClient } from './http';

export type AuthUser = { id:number; usuario:string; email:string; ativo:boolean };
export type AuthResponse = {
  token: string;
  expiresIn: number;
  refreshToken: string;
  user: AuthUser;
};

export class AuthService {
  constructor(private http = new HttpClient()) {}

  async login(usuario: string, senha: string) {
    const r = await this.http.post<AuthResponse>('/auth/tokens', { usuario, senha });
    localStorage.setItem('access_token', r.token);
    localStorage.setItem('refresh_token', r.refreshToken);
    localStorage.setItem('me', JSON.stringify(r.user));
  }

  async me(): Promise<AuthUser> {
    const u = await this.http.get<AuthUser>('/auth/me');
    localStorage.setItem('me', JSON.stringify(u));
    return u;
  }

  async logout() {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      try { await this.http.post('/auth/logout', refresh); } catch {}
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('me');
  }

  get currentUser(): AuthUser | null {
    const raw = localStorage.getItem('me');
    return raw ? JSON.parse(raw) : null;
  }
}
