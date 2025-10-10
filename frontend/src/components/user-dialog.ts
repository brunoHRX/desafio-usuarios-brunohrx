import { IDialogCustomElementViewModel, IDialogController } from '@aurelia/dialog';

type Mode = 'create' | 'edit';
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
      this.id = u.id; this.usuario = u.usuario; this.email = u.email; this.ativo = !!u.ativo;
    }
  }

  ok() {
    if (this.mode === 'create') {
      this.$dialog.ok({ usuario: this.usuario.trim(), email: this.email.trim(), senha: this.senha });
    } else {
      this.$dialog.ok({ usuario: this.usuario.trim(), email: this.email.trim(), ativo: this.ativo });
    }
  }
  cancel() { this.$dialog.cancel(); }
}
