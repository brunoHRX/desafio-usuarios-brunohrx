const baseUrl = import.meta.env.VITE_API_BASE as string;

export class ApiError extends Error {
  constructor(
    public status: number,
    public bodyText: string,
    public problem?: { title?: string; detail?: string; errors?: Record<string, string[]> }
  ) {
    super(problem?.title || bodyText || `HTTP ${status}`);
    this.name = 'ApiError';
  }
}

function getAuth() {
  const jwt = localStorage.getItem('token');
  const refresh = localStorage.getItem('refreshToken');
  return { jwt, refresh };
}
function setAuth(jwt?: string | null, refresh?: string | null) {
  if (jwt !== undefined) {
    if (jwt) localStorage.setItem('token', jwt);
    else localStorage.removeItem('token');
  }
  if (refresh !== undefined) {
    if (refresh) localStorage.setItem('refreshToken', refresh);
    else localStorage.removeItem('refreshToken');
  }
}

async function rawRequest(path: string, init: RequestInit = {}) {
  const { jwt } = getAuth();
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');
  if (jwt) headers.set('Authorization', `Bearer ${jwt}`);

  const res = await fetch(`${baseUrl}${path}`, { ...init, headers });
  return res;
}

async function toJsonSafe<T>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text) as T; } catch { return null; }
}

async function request<T = unknown>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  let res = await rawRequest(path, init);

  if (res.status === 401 && retry) {
    const ok = await tryRefreshToken();
    if (ok) {
      res = await rawRequest(path, init); // refaz com novo JWT
    }
  }

  if (!res.ok) {
    const bodyText = await res.text();
    let problem: ApiError['problem'] | undefined;
    try { problem = JSON.parse(bodyText); } catch { /* noop */ }
    throw new ApiError(res.status, bodyText, problem);
  }

  const data = await toJsonSafe<T>(res);
  return (data ?? (null as unknown as T));
}

async function tryRefreshToken(): Promise<boolean> {
  const { refresh } = getAuth();
  if (!refresh) return false;

  const res = await fetch(`${baseUrl}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(refresh),
  });

  if (!res.ok) {
    // limpa auth
    setAuth(null, null);
    return false;
  }

  type RefreshResponse = { jwt?: string; accessToken?: string; token?: string; refresh?: string; refreshToken?: string; user?: unknown; };
  const data: RefreshResponse = await res.json();
  const newJwt = data.jwt ?? data.accessToken ?? data.token;
  const newRefresh = data.refresh ?? data.refreshToken;
  setAuth(newJwt ?? null, newRefresh ?? null);
  if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
  return true;
}

export const api = {
  get: <T = unknown>(p: string) => request<T>(p),
  post: <T = unknown>(p: string, body?: unknown) =>
    request<T>(p, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: <T = unknown>(p: string, body?: unknown) =>
    request<T>(p, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T = unknown>(p: string) => request<T>(p, { method: 'DELETE' }),

  _setAuth: setAuth,
  _getAuth: getAuth,
};
