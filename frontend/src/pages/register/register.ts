import { IRouter } from '@aurelia/router';
import { resolve } from 'aurelia';
import { UsersService } from '../../api/users.service';
import { AuthService } from '../../api/auth.service';

export class Register {
  usuario = '';
  email = '';
  senha = '';
  loading = false;
  error = '';
  info = '';

  private router = resolve(IRouter);
  private users = new UsersService();
  private auth = new AuthService();

  get isLoggedIn() {
    return !!localStorage.getItem('access_token');
  }

  async submit() {
    this.error = '';
    this.info = '';
    this.loading = true;
    try {
      // ALERTA: /users exige ROLE admin no backend atual
      await this.users.create({ usuario: this.usuario.trim(), email: this.email.trim(), senha: this.senha });
      this.info = 'Usuário criado com sucesso.';
      // se quiser, já direciona para login:
      await this.router.load('/login');
    } catch (e: any) {
      this.error = this.parseProblem(e);
      // dica ao usuário
      if (!this.isLoggedIn) {
        this.info = 'Este endpoint exige um usuário admin autenticado. Faça login como admin ou crie um endpoint público (ex.: /auth/register).';
      }
    } finally {
      this.loading = false;
    }
  }

  backToLogin() {
    this.router.load('/login');
  }

  private parseProblem(e: any) {
    try {
      const p = JSON.parse(e.message);
      return p.title || 'Falha no cadastro';
    } catch {
      return e.message || 'Falha no cadastro';
    }
  }
}
