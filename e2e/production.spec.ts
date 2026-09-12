import { test, expect } from '@playwright/test';
test('production assets and workers work under a GitHub Pages subpath', async ({ page }) => {
  test.skip(!process.env.PRODUCTION_TEST, 'Run with production config');
  await page.goto('/sql-factory/#/task/22');
  await expect(page.locator('.monaco-editor').first()).toBeVisible();
  await page.getByRole('button', { name: 'Выполнить', exact: true }).click();
  await expect(page.getByText('Верное решение!')).toBeVisible({ timeout: 15000 });
  await page.reload();
  await expect(page.locator('.tree-task.current .done')).toBeVisible();
});
