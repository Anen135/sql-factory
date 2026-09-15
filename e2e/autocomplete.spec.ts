import { test, expect } from '@playwright/test';

test('SQL completion supports keywords, schema and aliases', async ({ page }) => {
  await page.goto('/');
  const editor = page.locator('.monaco-editor').first();
  await expect(editor).toBeVisible();
  await editor.click();
  const replace = async (text: string) => {
    await page.keyboard.press('Escape');
    await page.keyboard.press('Control+a');
    await page.keyboard.insertText(text);
    await page.keyboard.press('Control+Space');
  };
  const suggestion = (label: string) =>
    page
      .locator('.suggest-widget.visible .monaco-list-row')
      .filter({ has: page.locator('.label-name', { hasText: new RegExp(`^${label}$`) }) });
  await replace('SEL');
  await expect(suggestion('SELECT')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(editor.locator('.view-lines')).toContainText('SELECT');
  await replace('SELECT * FROM stu');
  await expect(suggestion('students')).toBeVisible();
  await suggestion('students').click();
  await expect(editor.locator('.view-lines')).toContainText('SELECT * FROM students');
  await replace('SELECT * FROM students AS s WHERE s.');
  await expect(suggestion('enrollment_date')).toBeVisible();
  await expect(suggestion('grade')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.keyboard.type('ag');
  await expect(suggestion('age')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(editor.locator('.view-lines')).toContainText('s.age');
  await replace("SELECT 'stu");
  await expect(page.locator('.suggest-widget.visible')).toHaveCount(0);
  await replace('-- stu');
  await expect(page.locator('.suggest-widget.visible')).toHaveCount(0);
});
