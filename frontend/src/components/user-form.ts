import { inject } from 'aurelia';
import { IRouteViewModel, IRouter } from '@aurelia/router';
import { api } from '../services/api';
import type { UserSummary } from '../types/users';

type CreateModel = { usuario: string; email: string; senha: string; confirmacaoSenha: string };
type EditModel   = { usuario: string; email: string; ativo: boolean; rowVersion: string };

@inject(IRouter)
export class UserForm implements IRouteViewModel {
  constructor(private router: IRouter) {}

  id?: number | null;
  creating = false;
  saving = false;
  tried = false;              // marca que tentamos salvar (para exibir msgs)
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
        console.log('[POST /users] payload', payload);
        await api.post('/users', payload);
      } else {
        const payload = {
          usuario: this.modelEdit.usuario.trim(),
          email: this.modelEdit.email.trim().toLowerCase(),
          ativo: this.modelEdit.ativo,
          rowVersion: this.modelEdit.rowVersion
        };
        console.log('[PUT /users/{id}] payload', payload);
        await api.put(`/users/${this.id}`, payload);
      }

      window.dispatchEvent(new CustomEvent('users:changed'));
      await this.router.load('users'); // volta para a lista
    } catch (e: any) {
      const msg = String(e?.message || '');
      console.error('[save error]', msg);
      if (msg.includes('401')) {
        this.error = 'Sessão expirada. Faça login novamente.';
        await this.router.load('login');
      } else if (msg.includes('403')) {
        this.error = 'Sem permissão: ação restrita a admin.';
      } else if (msg.includes('409')) {
        this.error = this.creating
          ? 'Usuário ou e-mail já cadastrado.'
          : 'Conflito de concorrência. Recarregue e tente novamente.';
      } else if (msg.includes('404')) {
        this.error = 'Endpoint não encontrado. Confira a base URL (/api/v1).';
      } else {
        this.error = 'Falha ao salvar.';
      }
    } finally {
      this.saving = false;
    }
  }

  goBack() {
    // volta para a lista
    this.router.load('users');
  }
}
