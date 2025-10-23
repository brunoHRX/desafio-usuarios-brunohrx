import { test, expect } from '@playwright/test';

test('login e abrir Configurações', async ({ page }) => {
  // acessa a página de login
  await page.goto('/login');

  // preenche o formulário
  await page.getByLabel('Usuário').fill('admin');
  await page.getByLabel('Senha').fill('inverno22@');
  await page.getByRole('button', { name: /entrar/i }).click();

  // navega para Configurações
  await page.getByRole('link', { name: /configurações/i }).click();

  // verifica se a página abriu
  await expect(page.getByRole('heading', { name: /configurações/i })).toBeVisible();
});
