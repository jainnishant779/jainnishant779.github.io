import { test, expect } from '@playwright/test';

test.describe('Camera zoom into the monitor', () => {
  async function gotoWorkstation(page: import('@playwright/test').Page) {
    await page.goto('');
    await page.waitForSelector('canvas.film-canvas');
    await page.waitForTimeout(2500);
    const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    await page.evaluate((y) => window.scrollTo(0, y), max);
    await page.waitForTimeout(2000);
  }

  test('opening the OS zooms the stage into the monitor, then zooms back out on close', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await gotoWorkstation(page);
    const stage = page.locator('.film-stage');
    await expect(stage).toHaveCSS('transform', 'none');

    await page.locator('button:has-text("ACCESS COMPUTER WORKSTATION")').click();
    // The stage starts scaling immediately; the overlay appears only once the move is nearly done.
    await expect(stage).not.toHaveCSS('transform', 'none', { timeout: 500 });
    await expect(page.locator('.os-container.overlay')).toBeHidden();
    await expect(page.locator('.os-container.overlay')).toBeVisible({ timeout: 3000 });

    await page.keyboard.press('Escape');
    await expect(page.locator('.os-container.overlay')).toBeHidden();
    await expect(stage).toHaveCSS('transform', 'none', { timeout: 3000 });
  });

  test('reduced motion: the OS opens right away, with no zoom', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoWorkstation(page);
    await page.locator('button:has-text("ACCESS COMPUTER WORKSTATION")').click();
    await expect(page.locator('.os-container.overlay')).toBeVisible({ timeout: 1000 });
    await expect(page.locator('.film-stage')).toHaveCSS('transform', 'none');
  });
});
