// src/pages/settings.ts
import { IRouteViewModel } from '@aurelia/router';

type Me = { id: number; usuario: string; email: string; ativo: boolean };
type InactiveUser = { id: number; usuario: string; email: string; motivo?: string; desativadoEm?: string };

// ---- Ajuste aqui se tiver prefixo (ex.: '/api')
const API = {
  me: '/auth/me',
  users: '/users',
  user: (id: number) => `/users/${id}`,
  userPassword: (id: number) => `/users/${id}/password`,
};

async function api<T = unknown>(
  input: RequestInfo,
  init?: RequestInit & { expect?: number | number[] }
): Promise<T> {
  const res = await fetch(input, {
    credentials: 'include', // envia cookies de auth
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });

  const okCodes = Array.isArray(init?.expect)
    ? init?.expect
    : init?.expect
    ? [init.expect]
    : [200, 201, 204];

  if (!okCodes.includes(res.status)) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      msg = data?.message ?? data?.error ?? msg;
    } catch {
      // response sem JSON
    }
    throw new Error(msg);
  }

  // 204 no content
  if (res.status === 204) return undefined as unknown as T;

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return (await res.json()) as T;

  // fallback: texto
  return (await res.text()) as unknown as T;
}

export class Settings implements IRouteViewModel {
  // UI state
  activeTab: 'profile' | 'inactive' = 'profile';
  isSaving = false;
  isLoadingInactive = false;
  error?: string;
  feedback?: string;

  // Perfil
  me?: Me;
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

  // ===== Lifecycle
  async attaching() {
    await this.loadMe();
  }

  // ===== Tabs
  setTab(tab: 'profile' | 'inactive') {
    this.activeTab = tab;
    if (tab === 'inactive') this.loadInactive();
  }

  // ===== Perfil
  get senhaOk() {
    const { novaSenha, confirmaSenha } = this.profile;
    if (!novaSenha && !confirmaSenha) return true; // troca de senha é opcional
    return novaSenha.length >= 8 && novaSenha === confirmaSenha;
  }

  private copyMeToForm(me: Me) {
    this.profile.usuario = me.usuario ?? '';
    this.profile.email = me.email ?? '';
  }

  async loadMe() {
    this.error = undefined;
    try {
      const me = await api<Me>(API.me, { method: 'GET' });
      this.me = me;
      this.copyMeToForm(me);
    } catch (err: any) {
      this.error = err?.message ?? 'Falha ao carregar perfil.';
    }
  }

  async saveProfile(e?: Event) {
    e?.preventDefault();
    this.error = undefined;
    this.feedback = undefined;

    if (!this.me) {
      this.error = 'Sessão expirada.';
      return;
    }
    if (!this.senhaOk) {
      this.error = 'A nova senha deve ter 8+ caracteres e coincidir com a confirmação.';
      return;
    }

    this.isSaving = true;
    try {
      // 1) PATCH básico (usuario/email)
      const patchBody: Partial<Pick<Me, 'usuario' | 'email'>> = {
        usuario: this.profile.usuario,
        email: this.profile.email,
      };
      await api(API.user(this.me.id), {
        method: 'PATCH',
        body: JSON.stringify(patchBody),
        expect: [200, 204],
      });

      // 2) Troca de senha (opcional)
      if (this.profile.novaSenha) {
        await api(API.userPassword(this.me.id), {
          method: 'PUT',
          body: JSON.stringify({
            currentPassword: this.profile.senhaAtual,
            newPassword: this.profile.novaSenha,
          }),
          expect: [200, 204],
        });
      }

      // Atualiza estado local e limpa senha
      await this.loadMe();
      this.profile.senhaAtual = '';
      this.profile.novaSenha = '';
      this.profile.confirmaSenha = '';
      this.feedback = 'Perfil atualizado com sucesso.';
    } catch (err: any) {
      this.error = err?.message ?? 'Falha ao salvar perfil.';
    } finally {
      this.isSaving = false;
    }
  }

  // ===== Inativos
  async loadInactive() {
    this.isLoadingInactive = true;
    this.error = undefined;
    try {
      const params = new URLSearchParams({
        status: 'inactive',
        search: this.search ?? '',
        page: String(this.page),
        pageSize: String(this.pageSize),
      });
      // Espera { data, total } no padrão REST comum; ajuste se necessário
      const resp = await api<{ data: InactiveUser[]; total: number }>(`${API.users}?${params.toString()}`, {
        method: 'GET',
        expect: 200,
      });

      this.users = resp.data ?? [];
      this.total = resp.total ?? this.users.length;
    } catch (err: any) {
      this.error = err?.message ?? 'Falha ao carregar usuários inativos.';
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
    this.error = undefined;
    try {
      await api(API.user(id), {
        method: 'PATCH',
        body: JSON.stringify({ ativo: true }),
        expect: [200, 204],
      });
      // Atualiza a lista local
      this.users = this.users.filter(u => u.id !== id);
      this.total = Math.max(0, this.total - 1);
      if (this.users.length === 0 && this.page > 1) {
        this.page--;
        await this.loadInactive();
      }
    } catch (err: any) {
      this.error = err?.message ?? 'Falha ao reativar usuário.';
    }
  }

  async deleteUser(id: number) {
    if (!confirm('Remover definitivamente este usuário?')) return;
    this.error = undefined;
    try {
      await api(API.user(id), { method: 'DELETE', expect: [200, 204] });
      this.users = this.users.filter(u => u.id !== id);
      this.total = Math.max(0, this.total - 1);
      if (this.users.length === 0 && this.page > 1) {
        this.page--;
        await this.loadInactive();
      }
    } catch (err: any) {
      this.error = err?.message ?? 'Falha ao remover usuário.';
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadInactive();
    }
  }

  nextPage() {
    if (this.page * this.pageSize < this.total) {
      this.page++;
      this.loadInactive();
    }
  }
}
