import { test, expect } from '@playwright/test';

test('staging app loads', async ({ page }) => {
  await page.goto('https://cedar-beta.vercel.app');
  await expect(page).toHaveURL(/cedar-beta\.vercel\.app/);
});
