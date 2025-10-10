// src/pages/settings/settings.ts
import { AuthService } from '../../api/auth.service';
import { UsersService } from '../../api/users.service';

export class Settings {
  private auth = new AuthService();
  private users = new UsersService();

  me = this.auth.currentUser;
  senhaAtual = '';
  novaSenha = '';
  confirmacaoSenha = '';
  msg = '';

  async changePassword() {
    this.msg = '';
    if (!this.me) return;

    await this.users.changePassword(this.me.id, {
      senhaAtual: this.senhaAtual || undefined,
      novaSenha: this.novaSenha,
      confirmacaoSenha: this.confirmacaoSenha,
    });

    this.senhaAtual = this.novaSenha = this.confirmacaoSenha = '';
    this.msg = 'Senha alterada com sucesso.';
  }
}
