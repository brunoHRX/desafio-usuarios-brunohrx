// src/components/user-list.ts
import { inject } from 'aurelia';
import { IRouter } from '@aurelia/router';
import { IDialogService } from '@aurelia/dialog';
import { api } from '../services/api';
import type { PagedResult, UserSummary } from '../types/users';
import { UserDialog } from './user-dialog';
import { showApiError } from '../shared/error-utils';
import { notify } from '../shared/notify';  
import { ApiError } from '../services/api';

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


  // Carregamento da listagem

  async load() {
    try {
      this.isLoading = true;
      this.error = null;

      const q = new URLSearchParams({
        page: String(this.page),
        pageSize: String(this.pageSize),
        ...(this.search ? { search: this.search } : {}),
      });


      const res = await api.get(`/users?${q.toString()}`) as PagedResult<UserSummary>;

      this.users = res.items ?? [];
      this.total = res.total ?? 0;
      this.page = res.page ?? this.page;
      this.pageSize = res.pageSize ?? this.pageSize;
    } catch (e: unknown) {
      await this.handleApiError(e, 'Falha ao carregar usuários.');
    } finally {
      this.isLoading = false;
    }
  }

  async newUser() {
    const opened = await this.dialogService.open({
      component: () => UserDialog,
      model: { mode: 'create' },
    });

    const closed = await opened.dialog.closed;
    if (closed.status === 'ok') {
      notify.success('Usuário criado com sucesso.');
      await this.load();
      window.dispatchEvent(new Event('users:changed'));
    }
  }



  async editUser(id: number) {
    const user = this.users.find(u => u.id === id);
    if (!user) return;

    const opened = await this.dialogService.open({
      component: () => UserDialog,
      model: { mode: 'edit', user }, // inclui rowVersion; o dialog usa
    });

    const closed = await opened.dialog.closed;
    if (closed.status === 'ok') {
      notify.success('Usuário atualizado com sucesso.');
      await this.load();
      window.dispatchEvent(new Event('users:changed'));
    }
  }




  // Remover (soft delete)

  async deleteUser(id: number) {
    if (!confirm('Confirma a remoção deste usuário?')) return;
    try {
      await api.delete(`/users/${id}`);
      notify.success('Usuário removido.');
      await this.load();
      window.dispatchEvent(new Event('users:changed'));
    } catch (e) {
      showApiError(e, 'Falha ao remover usuário.');
      if (e instanceof ApiError && e.status === 401) {
        await this.router.load('login');
      }
    }
  }


  // Busca / paginação

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


  // Tratamento de erros

  private async handleApiError(e: unknown, fallbackMessage: string) {
  showApiError(e, fallbackMessage);
  if (e instanceof ApiError && e.status === 401) {
    this.error = 'Sessão expirada. Redirecionando para login…';
    try { await this.router.load('login'); } catch { /* ignore */ }
    return;
  }
  // banner na página
  this.error = e instanceof ApiError
    ? (e.problem?.detail || e.problem?.title || e.message)
    : fallbackMessage;
}
}
