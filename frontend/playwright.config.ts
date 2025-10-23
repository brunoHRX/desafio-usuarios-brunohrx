import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test',               // onde ficam seus testes
  timeout: 30 * 1000,               // 30 segundos por teste
  use: {
    baseURL: 'http://localhost:9000', // porta do seu app local
    headless: true,                  // true = sem abrir janela do navegador
    video: 'on-first-retry',         // grava vídeo se falhar
    screenshot: 'only-on-failure',   // tira screenshot se falhar
  },

  webServer: {
    command: 'npm start',           
    url: 'http://localhost:9000',     // update to the actual port your app uses
    reuseExistingServer: true,        // don’t kill a locally running server
    timeout: 120_000,                 // give Vite/Aurelia time to boot
  },

  // projetos = cada motor de navegador
  projects: [
    { name: 'Chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'WebKit',   use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 14'] } },
  ],
});
