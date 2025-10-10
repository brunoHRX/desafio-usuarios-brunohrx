import { IRouter } from '@aurelia/router';
import { resolve } from 'aurelia';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export class HttpClient {
  private base =
    import.meta.env.DEV
      ? '/api/v1' // usa proxy em dev
      : (import.meta.env.VITE_API_BASE ?? 'http://localhost:5191/api/v1');

  private router = resolve(IRouter);
  private isRefreshing = false;
  private pending: Array<() => void> = [];

  private authHeaders() {
    const t = localStorage.getItem('access_token');
    if (!t) console.warn('[auth] sem access_token no localStorage'); // console
    return t ? { Authorization: `Bearer ${t}` } : {};
  }

  private async request<T>(method: HttpMethod, url: string, body?: unknown): Promise<T> {
    const doFetch = async (): Promise<Response> => {
      return fetch(this.base + url, {
        method,
        headers: {
          'Content-Type': body ? 'application/json' : undefined,
          ...this.authHeaders(),
        } as any,
        body: body ? JSON.stringify(body) : undefined,
      });
    };

    let res = await doFetch();

    // se 401, tenta refresh uma vez
    if (res.status === 401) {
      const ok = await this.tryRefresh();
      if (ok) res = await doFetch();
    }

    if (!res.ok) {
      // 401 novamente -> sessão inválida
      if (res.status === 401) {
        this.clearSession();
        await this.router.load('/login');
      }
      const text = await res.text().catch(() => '');
      throw new Error(text || `HTTP ${res.status}`);
    }

    // 204 sem body
    if (res.status === 204) return undefined as T;

    return res.json() as Promise<T>;
  }

  private async tryRefresh(): Promise<boolean> {
    if (this.isRefreshing) {
      await new Promise<void>(r => this.pending.push(r));
      return !!localStorage.getItem('access_token');
    }

    this.isRefreshing = true;
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      const res = await fetch(this.base + '/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(refreshToken),
      });

      if (!res.ok) return false;

      const data: {
        token: string;
        expiresIn: number;
        refreshToken: string;
        user: { id:number; usuario:string; email:string; ativo:boolean };
      } = await res.json();

      localStorage.setItem('access_token', data.token);
      localStorage.setItem('refresh_token', data.refreshToken);
      localStorage.setItem('me', JSON.stringify(data.user));
      return true;
    } catch {
      return false;
    } finally {
      this.isRefreshing = false;
      this.pending.splice(0).forEach(fn => fn());
    }
  }

  private clearSession() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('me');
  }

  

  // Métodos públicos
  get<T>(url: string) { return this.request<T>('GET', url); }
  post<T>(url: string, body?: unknown) { return this.request<T>('POST', url, body); }
  put<T>(url: string, body?: unknown) { return this.request<T>('PUT', url, body); }
  patch<T>(url: string, body?: unknown) { return this.request<T>('PATCH', url, body); }
  del<T = undefined>(url: string) { return this.request<T>('DELETE', url); }
}
