import { inject } from 'aurelia';
import { IRouter } from '@aurelia/router';
import { api } from '../services/api';
import { auth } from '../services/auth';
import { notify } from '../shared/notify';
import { showApiError } from '../shared/error-utils';
import { ApiError } from '../services/api';

@inject(IRouter)
export class Signup {
  constructor(private router: IRouter) {}

  usuario = '';
  email = '';
  senha = '';
  confirmacaoSenha = '';
  isLoading = false;
  tried = false;
  error: string | null = null;

  get emailOk() {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
  }
  get usuarioOk() {
    return this.usuario.trim().length >= 2;
  }
  get senhaOk() {
    return this.senha.length >= 8 && this.senha === this.confirmacaoSenha;
  }
  get formValid() {
    return this.usuarioOk && this.emailOk && this.senhaOk;
  }

  async submit() {
    this.tried = true;
    this.error = null;
    if (!this.formValid) { this.error = 'Preencha corretamente os campos.'; return; }

    this.isLoading = true;
    try {
      // 1) cria conta
      await api.post('/auth/signup', {
        usuario: this.usuario.trim(),
        email: this.email.trim().toLowerCase(),
        senha: this.senha
      });

      notify.success('Conta criada! Entrando...');
      // 2) login automático
      await auth.login(this.usuario.trim(), this.senha);
      await this.router.load('/app');
    } catch (e) {
      this.error = e instanceof ApiError ? (e.problem?.detail || e.problem?.title || e.message) : 'Falha ao criar conta.';
      showApiError(e, 'Falha ao criar conta.');
    } finally {
      this.isLoading = false;
    }
  }

  goLogin() { this.router.load('/login'); }
}
