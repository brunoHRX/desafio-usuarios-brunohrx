import { route } from '@aurelia/router';
import { customElement } from 'aurelia';

@route({
  routes: [
    { path: ['', 'login'], component: () => import('./pages/login/login') },
    { path: 'register', component: () => import('./pages/register/register') },
    // { path: 'forgot', component: () => import('./pages/forgot/forgot') },
    // { path: 'reset', component: () => import('./pages/reset/reset') },


    { path: 'app/*child', component: () => import('./layouts/app-layout') },
  ],
})
@customElement({ name: 'app', template: `<au-viewport></au-viewport>` })
export class App {}
