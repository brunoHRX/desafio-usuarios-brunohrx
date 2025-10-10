import { IRouter, IRouteViewModel, route } from '@aurelia/router';
import { customElement, resolve } from 'aurelia';
import { AuthService } from '../api/auth.service';

@route({
  routes: [
    // rota vazia cai em /app/users
    { path: ['', 'users'], component: () => import('../pages/users/users') },
    { path: 'settings', component: () => import('../pages/settings/settings') },
    // fallback explícito:
    { path: '(.*)', redirectTo: 'users' }
  ],
})
@customElement({
  name: 'app-layout',
  // 👇 TEMPLATE INLINE (sem depender do .html)
  template: `
  <template>
    <header class="topnav">
      <div class="brand">Minha App</div>
      <nav class="menu">
        <a load="/app/users">Usuários</a>
        <a load="/app/settings">Configurações</a>
      </nav>
      <div class="account">
        <button click.trigger="userMenuOpen = !userMenuOpen">Minha conta ▾</button>
        <div class="dropdown" if.bind="userMenuOpen">
          <a load="/app/settings">Editar usuário</a>
          <button click.trigger="logout()">Sair</button>
        </div>
      </div>
    </header>

    <main class="shell">
      <!-- 👇 viewport NOMEADO precisa bater com *child -->
      <au-viewport name="child"></au-viewport>
    </main>
  </template>
  `
})
export class AppLayout implements IRouteViewModel {
  private router = resolve(IRouter);
  private auth = new AuthService();
  userMenuOpen = false;

  // guarda de entrada: bloqueia /app sem token
  canEnter() {
    return !!localStorage.getItem('access_token') ? true : { redirectTo: 'login' };
  }

  async logout() {
    await this.auth.logout();
    await this.router.load('/login');
  }
}
