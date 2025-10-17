
import Aurelia from 'aurelia';                       
import { RouterConfiguration } from '@aurelia/router';
import { DialogConfigurationStandard } from '@aurelia/dialog';
import { App } from './app';
import './styles.css';
import { ToastCenter } from './shared/toast-center';
import { ThemeToggle } from './components/theme-toggle'

const host = document.querySelector('#app') as HTMLElement;
if (!host) {

  throw new Error('Elemento #app não encontrado no index.html');
}

Aurelia
  .register(
    RouterConfiguration.customize({ useUrlFragmentHash: false }),
    DialogConfigurationStandard,
    ToastCenter,
    ThemeToggle
  )
  .app({ host, component: App })                     
  .start();
