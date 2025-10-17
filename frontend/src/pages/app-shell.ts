import { IRouteViewModel, IRouter } from '@aurelia/router';
import { inject } from 'aurelia';
import { auth } from '../services/auth';

@inject(IRouter)
export class AppShell implements IRouteViewModel {
  constructor(private router: IRouter) {}

  user = auth.currentUser();
  mobileOpen = false;

  // defina aqui as entradas da navbar
  nav = [
    { label: 'Usuários', path: 'users', icon: 'users' },
    { label: 'Configurações', path: 'settings', icon: 'settings' },
  ];

  async canLoad() {
    console.log('app-shell.canLoad start', { path: location.pathname });
    await auth.ensure().catch(() => {});
    const authed = auth.isAuthenticated();
    console.log('app-shell.canLoad authed?', authed);
    if (!authed) {
      await this.router.load('/login');
      return false;
    }
    this.user = auth.currentUser();
    return true;
  }

  static routes = [
    { path: '', redirectTo: 'users' },
    { path: 'users', component: () => import('../components/user-list'), viewport: 'vp-main' },
    { path: 'settings', component: () => import('../pages/settings'), viewport: 'vp-main' },
    ];

  isActive(path: string) {
    // simples e eficaz: início do pathname
    return location.pathname.startsWith(path);
  }

  toggleMobile() {
    this.mobileOpen = !this.mobileOpen;
  }

  async logout() {
    await auth.logout();
    await this.router.load('/login');
  }
}
