import { IDialogCustomElementViewModel, IDialogController } from '@aurelia/dialog';

type Mode = 'create' | 'edit';

type CreatePayload = {
  mode: 'create';
  usuario: string;
  email: string;
  senha: string;
};
type EditPayload = {
  mode: 'edit';
  id: number;
  usuario: string;
  email: string;
  ativo: boolean;
};

export class UserDialog implements IDialogCustomElementViewModel {
  constructor(public $dialog: IDialogController) {}

  mode: Mode = 'create';
  id?: number;
  usuario = '';
  email = '';
  ativo = true;
  senha = ''; // só para create

  activate(model: { mode: Mode; user?: any }) {
    this.mode = model?.mode ?? 'create';
    if (model?.user) {
      const u = model.user;
      this.id = u.id;
      this.usuario = u.usuario ?? '';
      this.email = u.email ?? '';
      this.ativo = !!u.ativo;
    }
  }

  
  ok(e?: Event) {
  e?.preventDefault();

  const usuario = this.usuario.trim();
  const email = this.email.trim().toLowerCase();

  // exemplo de validação simples:
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!usuario || !emailOk) {
    alert('Preencha usuário e e-mail válidos.'); // troque por UI melhor
    return;
  }

  if (this.mode === 'create') {
    if (!this.senha || this.senha.length < 8) {
      alert('Senha deve ter pelo menos 8 caracteres.');
      return;
    }
    this.$dialog.ok({ mode: 'create', usuario, email, senha: this.senha });
  } else {
    if (this.id == null) return;
    this.$dialog.ok({ mode: 'edit', id: this.id, usuario, email, ativo: !!this.ativo });
  }
}


  cancel() {
    this.$dialog.cancel();
  }
}
