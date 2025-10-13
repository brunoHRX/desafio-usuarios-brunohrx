import { inject } from 'aurelia';
import { IRouter } from '@aurelia/router';
import { api, ApiError } from '../services/api';
import { notify } from '../shared/notify';
import { showApiError } from '../shared/error-utils';

@inject(IRouter)
export class Forgot {
  constructor(private router: IRouter) {}

  email = '';
  tried = false;
  isLoading = false;
  error: string | null = null;

  get emailOk() {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
  }

  async submit() {
    this.tried = true;
    this.error = null;

    if (!this.emailOk) {
      this.error = 'Informe um e-mail válido.';
      return;
    }

    this.isLoading = true;
    try {
      await api.post('/auth/forgot', { email: this.email.trim().toLowerCase() });
      notify.success('Se existir uma conta com esse e-mail, enviaremos instruções.');
      await this.router.load('login');
    } catch (e) {
      // banner + toast
      this.error = e instanceof ApiError ? (e.problem?.detail || e.problem?.title || e.message) : 'Falha ao enviar instruções.';
      showApiError(e, 'Falha ao enviar instruções.');
    } finally {
      this.isLoading = false;
    }
  }

  goLogin() { this.router.load('login'); }
}
