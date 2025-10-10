// src/main.ts
import { Aurelia } from 'aurelia';
import { RouterConfiguration } from '@aurelia/router';
import { DialogConfigurationStandard } from '@aurelia/dialog';
import { App } from './app';
import './styles/base.css';

Aurelia
  .register(
    
    RouterConfiguration.customize({
      useUrlFragmentHash: false, 
    }),
    
    DialogConfigurationStandard
  )
  .app(App)
  .start();
