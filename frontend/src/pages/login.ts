import { inject } from 'aurelia';
import { IRouter } from '@aurelia/router';
import { auth } from '../services/auth';

@inject(IRouter)

export class Login {

  constructor(private router: IRouter) {}
  
  usuario = '';
  senha = '';
  isLoading = false;
  error: string | null = null;

  async canLoad() {
  console.log('login.canLoad start', { path: location.pathname });
  await auth.ensure().catch(() => {}); // nunca lançar
  const authed = auth.isAuthenticated();
  console.log('login.canLoad authed?', authed);
  if (authed) { await this.router.load('/app'); return false; }
  return true;
  }

  async submit() {
    this.error = null;
    this.isLoading = true;
    try {
      await auth.login(this.usuario.trim(), this.senha);
      await this.router.load('/app');
    } catch (e: unknown) {
      this.error = (e as Error)?.message || 'Usuário ou senha inválidos.';
    } finally {
      this.isLoading = false;
    }
  }

  goForgot() { this.router.load('/forgot'); }
  goSignup() { this.router.load('/signup'); }
}
