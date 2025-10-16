import { inject } from 'aurelia';
import { IRouteViewModel, IRouter } from '@aurelia/router';
import { api, ApiError } from '../services/api';
import type { UserSummary } from '../types/users';
import { notify } from '../shared/notify';
import { showApiError } from '../shared/error-utils';

type CreateModel = { usuario: string; email: string; senha: string; confirmacaoSenha: string };
type EditModel   = { usuario: string; email: string; ativo: boolean; rowVersion: string };

@inject(IRouter)
export class UserForm implements IRouteViewModel {
  constructor(private router: IRouter) {}

  id?: number | null;
  creating = false;
  saving = false;
  tried = false;
  error: string | null = null;
  debug: string | null = null;

  modelCreate: CreateModel = { usuario: '', email: '', senha: '', confirmacaoSenha: '' };
  modelEdit:   EditModel   = { usuario: '', email: '', ativo: true, rowVersion: '' };

  async loading(params: { id?: number | null }) {
    this.id = params?.id ?? null;
    this.error = null;
    this.debug = null;
    this.tried = false;

    if (this.id) {
      const u = await api.get(`/users/${this.id}`) as UserSummary;
      this.creating = false;
      this.modelEdit = {
        usuario: u.usuario,
        email: u.email,
        ativo: u.ativo,
        rowVersion: u.rowVersion,
      };
    } else {
      this.creating = true;
      this.modelCreate = { usuario: '', email: '', senha: '', confirmacaoSenha: '' };
    }
  }

  get formValid() {
    if (this.creating) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.modelCreate.email.trim());
      return this.modelCreate.usuario.trim().length >= 2
          && emailOk
          && this.modelCreate.senha.length >= 8
          && this.modelCreate.senha === this.modelCreate.confirmacaoSenha;
    } else {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.modelEdit.email.trim());
      return this.modelEdit.usuario.trim().length >= 2
          && emailOk
          && !!this.modelEdit.rowVersion;
    }
  }

  get validationMessage() {
    if (!this.tried) return '';
    if (this.creating) {
      if (this.modelCreate.usuario.trim().length < 2) return 'Usuário deve ter ao menos 2 caracteres.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.modelCreate.email.trim())) return 'E-mail inválido.';
      if (this.modelCreate.senha.length < 8) return 'Senha deve ter pelo menos 8 caracteres.';
      if (this.modelCreate.senha !== this.modelCreate.confirmacaoSenha) return 'Confirmação de senha não confere.';
    } else {
      if (this.modelEdit.usuario.trim().length < 2) return 'Usuário deve ter ao menos 2 caracteres.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.modelEdit.email.trim())) return 'E-mail inválido.';
      if (!this.modelEdit.rowVersion) return 'Token de concorrência ausente (rowVersion).';
    }
    return 'Preencha corretamente os campos obrigatórios.';
  }

  async save(e?: Event) {
    e?.preventDefault();
    this.tried = true;
    this.error = null;
    this.debug = null;

    if (!this.formValid) {
      this.debug = '[validacao] formulário inválido';
      return;
    }

    this.saving = true;
    try {
      if (this.creating) {
        const payload = {
          usuario: this.modelCreate.usuario.trim(),
          email: this.modelCreate.email.trim().toLowerCase(),
          senha: this.modelCreate.senha
        };
        await api.post('/users', payload);
        notify.success('Usuário criado com sucesso.');
      } else {
        const payload = {
          usuario: this.modelEdit.usuario.trim(),
          email: this.modelEdit.email.trim().toLowerCase(),
          ativo: this.modelEdit.ativo,
          rowVersion: this.modelEdit.rowVersion
        };
        await api.put(`/users/${this.id}`, payload);
        notify.success('Usuário atualizado com sucesso.');
      }

      window.dispatchEvent(new CustomEvent('users:changed'));
      await this.router.load('users');
    } catch (e: unknown) {
      // Banner + toast centralizado
      this.error = e instanceof ApiError
        ? (e.problem?.detail || e.problem?.title || e.message)
        : 'Falha ao salvar.';

      showApiError(e, this.creating ? 'Erro ao criar usuário.' : 'Erro ao atualizar usuário.');

      if (e instanceof ApiError && e.status === 401) {
        await this.router.load('login');
      }
    } finally {
      this.saving = false;
    }
  }

  goBack() {
    this.router.load('users');
  }
}
