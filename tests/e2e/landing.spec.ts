import { expect, test } from '@playwright/test';

test('public robots route is served', async ({ page }) => {
  await page.goto('/robots.txt');

  await expect(page.locator('body')).toContainText('Disallow: /activity/*');
  await expect(page.locator('body')).toContainText('Sitemap:');
});
