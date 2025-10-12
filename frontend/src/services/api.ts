const baseUrl = import.meta.env.VITE_API_BASE;


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


async function request(path: string, init: RequestInit = {}, retry = true): Promise<any> {
  let res = await rawRequest(path, init);

  if (res.status === 401 && retry) {
    const ok = await tryRefreshToken();
    if (ok) {
      res = await rawRequest(path, init); // refaz com novo JWT
    }
  }

  if (!res.ok) {
    const text = await res.text();
    
    throw new Error(text || res.statusText);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
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

  const data = await res.json();
  const newJwt = data.jwt ?? data.accessToken ?? data.token;
  const newRefresh = data.refresh ?? data.refreshToken;
  setAuth(newJwt, newRefresh);
  if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
  return true;
}

export const api = {
  get: (p: string) => request(p),
  post: (p: string, body?: any) =>
    request(p, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: (p: string, body?: any) =>
    request(p, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: (p: string) => request(p, { method: 'DELETE' }),

  _setAuth: setAuth,
  _getAuth: getAuth,
};
