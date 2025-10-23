import { api } from './api';

export type UserSummary = {
  id: number;
  usuario: string;
  email: string;
  ativo: boolean;
  rowVersion?: string; // base64 vindo do backend
};

export type InactiveUser = UserSummary;

type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

// helpers
const USERS = '/users';
const AUTH  = '/auth';

function normPaged<T>(resp: any): { data: T[]; total: number; page?: number; pageSize?: number } {
  if (!resp) return { data: [], total: 0 };
  if (Array.isArray(resp)) return { data: resp, total: resp.length };
  const items = resp.items ?? resp.data ?? [];
  const total = resp.total ?? items.length;
  return { data: items, total, page: resp.page, pageSize: resp.pageSize };
}

export const userService = {
  me() {
    return api.get<UserSummary>(`${AUTH}/me`);
  },

  // PUT /users/{id}
  update(id: number, patch: { usuario?: string; email?: string; ativo?: boolean; rowVersion?: string }) {
    return api.put<UserSummary>(`${USERS}/${id}`, patch);
  },

  // PATCH /users/{id}/password 
  changePassword(id: number, senhaAtual: string, novaSenha: string, confirmacaoSenha?: string) {
    return api.patch<void>(`${USERS}/${id}/password`, {
      senhaAtual,
      novaSenha,
      confirmacaoSenha: confirmacaoSenha ?? novaSenha,
    });
  },

  // GET /users (paginado) — ATIVOS
  async listActive(params: { page?: number; pageSize?: number; search?: string }) {
    const q = new URLSearchParams({
      page: String(params.page ?? 1),
      pageSize: String(params.pageSize ?? 10),
      ...(params.search ? { search: params.search } : {}),
    });
    const resp = await api.get<PagedResult<UserSummary>>(`${USERS}?${q.toString()}`);
    return normPaged<UserSummary>(resp);
  },

  // GET /users/inactive (paginado) — INATIVOS
  async listInactive(params: { page?: number; pageSize?: number; search?: string }) {
    const q = new URLSearchParams({
      page: String(params.page ?? 1),
      pageSize: String(params.pageSize ?? 10),
      ...(params.search ? { search: params.search } : {}),
    });
    const resp = await api.get<PagedResult<InactiveUser>>(`${USERS}/inactive?${q.toString()}`);
    return normPaged<InactiveUser>(resp);
  },

  // DELETE /users/{id} (soft delete: ativo=false)
  hardDelete(id: number) {
    return api.delete<void>(`${USERS}/${id}`);
  },

  // POST /users/{id}/restore
  reactivate(id: number) {
    return api.post<void>(`${USERS}/${id}/restore`);
  },
};
