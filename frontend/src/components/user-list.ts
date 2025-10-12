// src/components/user-list.ts
import { inject } from 'aurelia';
import { IRouter } from '@aurelia/router';
import { IDialogService } from '@aurelia/dialog';
import { api } from '../services/api';
import type { PagedResult, UserSummary } from '../types/users';
import { UserDialog } from './user-dialog';

type CloseResult<T = any> = { wasCancelled: boolean; value?: T };

@inject(IRouter, IDialogService)
export class UserList {
  page = 1;
  pageSize = 10;
  search = '';
  total = 0;
  users: UserSummary[] = [];
  isLoading = true;
  error: string | null = null;

  private _onUsersChanged?: () => void;

  constructor(
    private router: IRouter,
    private dialogService: IDialogService
  ) {}

  connected() {
    this._onUsersChanged = () => this.load();
    window.addEventListener('users:changed', this._onUsersChanged as EventListener);
  }

  disconnected() {
    window.removeEventListener('users:changed', this._onUsersChanged as EventListener);
  }

  async binding() {
    await this.load();
  }

  // =========================
  // Carregamento da listagem
  // =========================
  async load() {
    try {
      this.isLoading = true;
      this.error = null;

      const q = new URLSearchParams({
        page: String(this.page),
        pageSize: String(this.pageSize),
        ...(this.search ? { search: this.search } : {}),
      });

      // Dica: garanta que seu api base esteja em /api/v1
      const res = await api.get(`/users?${q.toString()}`) as PagedResult<UserSummary>;

      this.users = res.items ?? [];
      this.total = res.total ?? 0;
      this.page = res.page ?? this.page;
      this.pageSize = res.pageSize ?? this.pageSize;
    } catch (e: any) {
      this.handleApiError(e, 'Falha ao carregar usuários.');
    } finally {
      this.isLoading = false;
    }
  }

  async newUser() {
    const opened = await this.dialogService.open({
      component: () => UserDialog,
      model: { mode: 'create' },
    });

    if (opened.wasCancelled) return;

    const closed = await opened.dialog.closed; // <- aqui vem { status, value }
    if (closed.status !== 'ok' || !closed.value) return;

    const { mode, ...payload } = closed.value as Record<string, any>; // { usuario, email, senha }

    try {
      await api.post('/users', payload);
      await this.load();
      window.dispatchEvent(new Event('users:changed'));
    } catch (e: any) {
      const msg = String(e?.message || '');
      if (msg.includes('403')) {
        alert('Permissão negada: apenas administradores podem criar usuários.');
      } else if (msg.includes('409')) {
        alert('Usuário ou e-mail já cadastrado.');
      } else if (msg.includes('401')) {
        alert('Sessão expirada. Faça login novamente.');
        await this.router.load('login');
      } else {
        alert('Erro ao criar usuário.');
      }
    }
  }



  async editUser(id: number) {
  const user = this.users.find(u => u.id === id);
  if (!user) return;

  const opened = await this.dialogService.open({
    component: () => UserDialog,
    model: { mode: 'edit', user },
  });

  if (opened.wasCancelled) return;

  const closed = await opened.dialog.closed;
  if (closed.status !== 'ok' || !closed.value) return;

  const { mode, id: returnedId, ...partial } = closed.value as Record<string, any>;
  const targetId = typeof returnedId === 'number' ? returnedId : id;

  const payload = {
    ...partial,                  // usuario?, email?, ativo?
    rowVersion: user.rowVersion, // obrigatório p/ concorrência
  };

  try {
    const updated = await api.put(`/users/${targetId}`, payload);
    this.users = this.users.map(u => (u.id === updated.id ? updated : u));
    window.dispatchEvent(new Event('users:changed'));
  } catch (e: any) {
    const msg = String(e?.message || '');
    if (msg.includes('403')) {
      alert('Permissão negada: apenas administradores podem editar usuários.');
    } else if (msg.includes('409')) {
      alert('Conflito de concorrência. Recarregue a página e tente novamente.');
    } else if (msg.includes('401')) {
      alert('Sessão expirada. Faça login novamente.');
      await this.router.load('login');
    } else {
      alert('Erro ao atualizar usuário.');
    }
  }
}



  // =========================
  // Remover (soft delete)
  // =========================
  async deleteUser(id: number) {
    if (!confirm('Confirma a remoção deste usuário?')) return;
    try {
      await api.delete(`/users/${id}`);
      await this.load();
      window.dispatchEvent(new Event('users:changed'));
    } catch (e: any) {
      const msg = String(e?.message || '');
      if (msg.includes('401')) {
        alert('Sessão expirada. Faça login novamente.');
        await this.router.load('login');
        return;
      }
      if (msg.includes('403')) {
        alert('Permissão negada: apenas administradores podem remover usuários.');
        return;
      }
      alert('Falha ao remover usuário.');
    }
  }

  // =========================
  // Busca / paginação
  // =========================
  onSearchSubmit(e: Event) {
    e.preventDefault();
    this.page = 1;
    this.load();
  }
  nextPage() {
    if (this.page * this.pageSize < this.total) { this.page++; this.load(); }
  }
  prevPage() {
    if (this.page > 1) { this.page--; this.load(); }
  }

  // =========================
  // Tratamento de erros
  // =========================
  private async handleApiError(e: any, fallbackMessage: string) {
    const msg = String(e?.message || '');
    if (msg.includes('401')) {
      this.error = 'Sessão expirada. Redirecionando para login…';
      try { await this.router.load('login'); } catch { /* noop */ }
      return;
    }
    this.error = msg || fallbackMessage;
  }
}
