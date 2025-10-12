import { IRouteViewModel, IRouter } from '@aurelia/router';
import { inject } from 'aurelia';
import { auth } from '../services/auth';

@inject(IRouter)

export class AppShell implements IRouteViewModel {
  constructor(private router: IRouter) {}

  user = auth.currentUser();
  
    async canLoad() {
      console.log('app-shell.canLoad start', { path: location.pathname });
      await auth.ensure().catch(() => {});         // nunca lançar
      const authed = auth.isAuthenticated();
      console.log('app-shell.canLoad authed?', authed);
      if (!authed) {
        await this.router.load('/login');          // ABSOLUTO
        return false;
      }
      this.user = auth.currentUser();
      return true;
    }
  
  
  
  static routes = [
    { path: '', redirectTo: 'users' },

    // LISTA: sempre no viewport principal
    {
      path: 'users',
      component: () => import('../components/user-list'),
      viewport: 'vp-main',
    },
  ];

  async logout() {
    await auth.logout();
    await this.router.load('/login');
  }

}
