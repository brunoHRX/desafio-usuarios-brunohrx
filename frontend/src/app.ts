export class App {
  static routes = [
    { path: '', redirectTo: 'login' },
    { path: 'login', component: () => import('./pages/login') },
    // { path: 'signup', component: () => import('./pages/signup') },
    // { path: 'forgot', component: () => import('./pages/forgot') },
    { path: 'app', component: () => import('./pages/app-shell') },
    { path: '**', redirectTo: 'login' }, // <- fallback
  ];
}
