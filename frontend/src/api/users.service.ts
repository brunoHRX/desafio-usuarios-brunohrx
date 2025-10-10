import { HttpClient } from './http';

export type UserSummary = {
  id: number;
  usuario: string;
  email: string;
  ativo: boolean;
  rowVersion: string; // virá base64/bytes -> tratar como string
};

export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type UsuarioCreateDto = {
  usuario: string;
  email: string;
  senha: string;
};

export type UsuarioUpdateDto = {
  usuario?: string;
  email?: string;
  ativo?: boolean;
  rowVersion: string; // obrigatório
};

export type PasswordChangeDto = {
  senhaAtual?: string;        // se não admin
  novaSenha: string;
  confirmacaoSenha: string;
};

export class UsersService {
  constructor(private http = new HttpClient()) {}

  list(page = 1, pageSize = 20, search?: string) {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) params.append('search', search);
    return this.http.get<PagedResult<UserSummary>>(`/users?${params.toString()}`);
  }

  getById(id: number) {
    return this.http.get<UserSummary>(`/users/${id}`);
  }

  create(dto: UsuarioCreateDto) {
    return this.http.post<UserSummary>('/users', dto);
  }

  update(id: number, dto: UsuarioUpdateDto) {
    return this.http.put<UserSummary>(`/users/${id}`, dto);
  }

  changePassword(id: number, dto: PasswordChangeDto) {
    return this.http.patch<void>(`/users/${id}/password`, dto);
  }

  softDelete(id: number) {
    return this.http.del<void>(`/users/${id}`);
  }

  restore(id: number) {
    return this.http.post<void>(`/users/${id}/restore`);
  }
}
