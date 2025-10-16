import { IDialogCustomElementViewModel, IDialogController } from '@aurelia/dialog';
import { inject } from 'aurelia';
import { api } from '../services/api';             
import { notify } from '../shared/notify';
import type { UserSummary } from '../types/users';

type Mode = 'create' | 'edit';
type Problem = { title?: string; detail?: string; errors?: Record<string, string[]> };
type ApiErrorLike = { status: number; message: string; problem?: Problem };

function asApiError(e: unknown): ApiErrorLike | null {
  if (e && typeof e === 'object' && 'status' in e) {
    const anyE = e as Record<string, unknown>;
    if (typeof anyE.status === 'number') return anyE as ApiErrorLike;
  }
  return null;
}

@inject()
export class UserDialog implements IDialogCustomElementViewModel {
  constructor(public $dialog: IDialogController) {}

  mode: Mode = 'create';
  id?: number;
  usuario = '';
  email = '';
  ativo = true;
  senha = '';
  tried = false;
  saving = false;
  rowVersion?: string;

  fieldErrors: Record<string, string | null> = { usuario: null, email: null, senha: null };
  formError: string | null = null;

  activate(model: { mode: Mode; user?: Partial<UserSummary> }) {
    this.mode = model?.mode ?? 'create';
    if (model?.user) {
      const u = model.user;
      this.id = u.id;
      this.usuario = u.usuario ?? '';
      this.email = u.email ?? '';
      this.ativo = !!u.ativo;
      this.rowVersion = u.rowVersion;
    }
  }

  get emailOk()  { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim().toLowerCase()); }
  get usuarioOk(){ return this.usuario.trim().length >= 2; }
  get senhaOk()  { return this.mode === 'create' ? this.senha.length >= 8 : true; }
  get formValid(){ return this.usuarioOk && this.emailOk && this.senhaOk; }

  private setFieldErrorsFromApi(err: ApiErrorLike) {
    this.fieldErrors = { usuario: null, email: null, senha: null };
    const errors = err.problem?.errors;
    if (!errors) return;
    const pick = (k: string) => (errors[k]?.[0] ?? null);
    this.fieldErrors.usuario = pick('usuario') ?? pick('Usuario');
    this.fieldErrors.email   = pick('email')   ?? pick('Email');
    this.fieldErrors.senha   = pick('senha')   ?? pick('Senha');
  }

  async ok(e?: Event) {
    e?.preventDefault();
    this.tried = true;
    this.formError = null;
    this.fieldErrors = { usuario: null, email: null, senha: null };

    if (!this.formValid) {
      this.formError = 'Corrija os campos destacados.';
      return;
    }

    this.saving = true;
    try {
      const usuario = this.usuario.trim();
      const email = this.email.trim().toLowerCase();

      if (this.mode === 'create') {
        await api.post('/users', { usuario, email, senha: this.senha });
        notify.success('Usuário criado com sucesso.');
        this.$dialog.ok({ mode: 'create' });
      } else {
        if (this.id == null) return;
        await api.put(`/users/${this.id}`, { usuario, email, ativo: !!this.ativo, rowVersion: this.rowVersion });
        notify.success('Usuário atualizado com sucesso.');
        this.$dialog.ok({ mode: 'edit', id: this.id });
      }
    } catch (err: unknown) {
      const apiErr = asApiError(err);
      if (apiErr) {
        this.setFieldErrorsFromApi(apiErr);
        this.formError = apiErr.problem?.detail || apiErr.problem?.title || apiErr.message;
      } else {
        this.formError = 'Falha ao salvar.';
      }
      return; // mantém o diálogo aberto
    } finally {
      this.saving = false;
    }
  }

  cancel() { this.$dialog.cancel(); }
}
