import { inject } from 'aurelia';
import { IRouter } from '@aurelia/router';
import { api, ApiError } from '../services/api';
import { notify } from '../shared/notify';
import { showApiError } from '../shared/error-utils';

@inject(IRouter)
export class Reset {
  constructor(private router: IRouter) {}

  token = '';
  novaSenha = '';
  confirmacaoSenha = '';
  tried = false;
  isLoading = false;
  error: string | null = null;

  loading() {
    // Lê o token da query string
    const url = new URL(window.location.href);
    this.token = url.searchParams.get('token') ?? '';
  }

  get senhaOk() {
    return this.novaSenha.length >= 8 && this.novaSenha === this.confirmacaoSenha;
  }

  async submit() {
    this.tried = true;
    this.error = null;

    if (!this.token) { this.error = 'Token inválido.'; return; }
    if (!this.senhaOk) { this.error = 'Senha deve ter 8+ caracteres e coincidir com a confirmação.'; return; }

    this.isLoading = true;
    try {
      await api.post('/auth/reset', {
        token: this.token,
        novaSenha: this.novaSenha,
        confirmacaoSenha: this.confirmacaoSenha
      });

      notify.success('Senha redefinida com sucesso. Faça login.');
      await this.router.load('login');
    } catch (e) {
      // banner + toast
      this.error = e instanceof ApiError ? (e.problem?.detail || e.problem?.title || e.message) : 'Falha ao redefinir senha.';
      showApiError(e, 'Falha ao redefinir senha.');
    } finally {
      this.isLoading = false;
    }
  }

  goLogin() { this.router.load('login'); }
}
