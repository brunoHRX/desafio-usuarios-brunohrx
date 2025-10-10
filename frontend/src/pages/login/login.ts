import { IRouter } from '@aurelia/router';
import { resolve } from 'aurelia';
import { AuthService } from '../../api/auth.service';

export class Login {
  usuario = ''; senha = ''; error = '';
  private router = resolve(IRouter);
  private auth = new AuthService();

  async submit() {
    this.error = '';
    try {
      await this.auth.login(this.usuario, this.senha);
      await this.router.load('/app/users');
    } catch (e:any) {
      this.error = this.parseError(e);
    }
  }

  private parseError(e:any) {
    try { const p = JSON.parse(e.message); return p.title ?? 'Falha no login'; } catch { return e.message ?? 'Falha no login'; }
  }
}
