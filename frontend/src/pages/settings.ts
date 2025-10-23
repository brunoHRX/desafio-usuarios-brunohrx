// src/pages/settings.ts
import { IRouteViewModel } from '@aurelia/router';
import { userService, type UserSummary, type InactiveUser } from '../services/user';
import { ApiError } from '../services/api';

export class Settings implements IRouteViewModel {
  // UI
  activeTab: 'profile' | 'inactive' = 'profile';
  isSaving = false;
  isLoadingMe = true;
  isLoadingInactive = false;
  error?: string;
  feedback?: string;

  // Perfil
  me?: UserSummary;
  profile = {
    usuario: '',
    email: '',
    senhaAtual: '',
    novaSenha: '',
    confirmaSenha: '',
  };

  // Inativos
  search = '';
  users: InactiveUser[] = [];
  page = 1;
  pageSize = 10;
  total = 0;

  // ===== lifecycle
  async attaching() {
    await this.loadMe();
  }

  // ===== tabs
  setTab(tab: 'profile' | 'inactive') {
    this.activeTab = tab;
    if (tab === 'inactive') this.loadInactive();
  }

  // ===== perfil
  get senhaOk() {
    const { novaSenha, confirmaSenha } = this.profile;
    if (!novaSenha && !confirmaSenha) return true;
    return novaSenha.length >= 8 && novaSenha === confirmaSenha;
  }

  private copyMeToForm(me: UserSummary) {
    this.profile.usuario = me.usuario ?? '';
    this.profile.email = me.email ?? '';
  }

  async loadMe() {
    this.error = undefined;
    this.isLoadingMe = true;
    try {
      const me = await userService.me();
      this.me = me;
      this.copyMeToForm(me);
    } catch (err) {
      this.error = this.humanError(err, 'Falha ao carregar perfil.');
    } finally {
      this.isLoadingMe = false;
    }
  }

  async saveProfile(e?: Event) {
    e?.preventDefault();
    this.error = undefined;
    this.feedback = undefined;

    if (!this.me?.id) {
      this.error = 'Sessão expirada.';
      return;
    }
    if (!this.senhaOk) {
      this.error = 'A nova senha deve ter 8+ caracteres e coincidir com a confirmação.';
      return;
    }

    this.isSaving = true;
    try {
      // Atualiza usuário (usuario/email)
      await userService.update(this.me.id, {
        usuario: this.profile.usuario,
        email: this.profile.email,
        rowVersion: this.me.rowVersion,
      });
      
      // Troca de senha (opcional)
      if (this.profile.novaSenha) {
        await userService.changePassword(this.me.id, this.profile.senhaAtual, this.profile.novaSenha, this.profile.confirmaSenha);
      }

      

      await this.loadMe();
      this.profile.senhaAtual = '';
      this.profile.novaSenha = '';
      this.profile.confirmaSenha = '';
      this.feedback = 'Perfil atualizado com sucesso.';
    } catch (err) {
      this.error = this.humanError(err, 'Falha ao salvar perfil.');
    } finally {
      this.isSaving = false;
    }
  }
  

  // ===== inativos
  async loadInactive() {
    this.isLoadingInactive = true;
    this.error = undefined;
    try {
      const resp = await userService.listInactive({
        search: this.search,
        page: this.page,
        pageSize: this.pageSize,
      });
      this.users = resp.data ?? [];
      this.total = resp.total ?? this.users.length;
    } catch (err) {
      this.error = this.humanError(err, 'Falha ao carregar usuários inativos.');
      this.users = [];
      this.total = 0;
    } finally {
      this.isLoadingInactive = false;
    }
  }

  onSearchSubmit(e: Event) {
    e.preventDefault();
    this.page = 1;
    this.loadInactive();
  }

  async reactivateUser(id: number) {
    try {
      await userService.reactivate(id);
      // atualiza lista local ou recarrega
      this.users = this.users.filter(u => u.id !== id);
      this.total = Math.max(0, this.total - 1);
      if (this.users.length === 0 && this.page > 1) {
        this.page--;
        await this.loadInactive();
      }
    } catch (err) {
      this.error = this.humanError(err, 'Falha ao reativar usuário.');
    }
  }

  async deleteUser(id: number) {
    if (!confirm('Remover definitivamente este usuário?')) return;
    try {
      await userService.hardDelete(id);
      this.users = this.users.filter(u => u.id !== id);
      this.total = Math.max(0, this.total - 1);
      if (this.users.length === 0 && this.page > 1) {
        this.page--;
        await this.loadInactive();
      }
    } catch (err) {
      this.error = this.humanError(err, 'Falha ao remover usuário.');
    }
  }

  prevPage() {
    if (this.page > 1) { this.page--; this.loadInactive(); }
  }
  nextPage() {
    if (this.page * this.pageSize < this.total) { this.page++; this.loadInactive(); }
  }

  // ===== util erro
  private humanError(err: unknown, fallback: string) {
    if (err instanceof ApiError) {
      const d = err.problem;
      const detail = d?.detail || Object.values(d?.errors ?? {})[0]?.[0];
      return detail || err.message || fallback;
    }
    return (err as any)?.message ?? fallback;
  }
}
