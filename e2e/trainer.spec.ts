import { test, expect } from '@playwright/test';
test('editor, verification, visualization, persistence and navigation', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Задача 22. Средняя оценка студентов' }),
  ).toBeVisible();
  await expect(page.locator('.monaco-editor').first()).toBeVisible();
  await page.getByRole('button', { name: 'Выполнить', exact: true }).click();
  await expect(page.getByText('Верное решение!')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('.result-panel tbody tr')).toHaveCount(6);
  await page.getByRole('button', { name: 'Разобрать запрос', exact: true }).click();
  await expect(page.locator('.step-buttons')).toBeVisible();
  await page.locator('.step-buttons').getByRole('button', { name: 'GROUP BY' }).click();
  await expect(page.locator('.before-after')).toBeVisible();
  await page.screenshot({ path: 'artifacts/task-desktop.png', fullPage: true });
  await page.reload();
  await expect(page.locator('.tree-task.current .done')).toBeVisible();
  await page.getByRole('link', { name: 'Профиль', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Профиль', exact: true })).toBeVisible();
  await expect(page.locator('.profile-results a')).toContainText(['22. Средняя оценка студентов']);
  await page.reload();
  await expect(page.locator('.profile-results a')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Сообщество' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Справочник', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Всё нужное под рукой.' })).toBeVisible();
  await page.getByRole('link', { name: 'База данных', exact: true }).click();
  await expect(page.locator('tbody tr')).toHaveCount(7);
  await page.getByRole('button', { name: 'grades', exact: true }).click();
  await expect(page.locator('tbody tr')).toHaveCount(18);
  expect(errors).toEqual([]);
});
test('mobile fits viewport and catalogue filters work', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/task/22');
  await expect(page.locator('.monaco-editor').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: 'artifacts/task-mobile.png', fullPage: true });
  await page.getByRole('link', { name: 'Профиль', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Профиль', exact: true })).toBeVisible();
  await expect(page.getByText('Здесь появятся ваши первые победы.')).toBeVisible();
  await page.getByRole('link', { name: 'Задачи', exact: true }).first().click();
  await page.getByLabel('Тема', { exact: true }).selectOption('Подзапросы');
  await expect(page.locator('.task-card')).toHaveCount(3);
});
