import { test, expect } from '@playwright/test';

test.describe('WebGL Unsupported Fallback', () => {
  test('Displays fallback UI and direct links when WebGL2 is disabled', async ({ page }) => {
    // Override getContext to return null simulating no WebGL2 support
    await page.addInitScript(() => {
      // @ts-expect-error Mocking getContext
      HTMLCanvasElement.prototype.getContext = () => null;
    });

    await page.goto('');

    // Fallback notice must be visible
    await expect(page.locator('.webgl-fallback-screen')).toBeVisible();
    await expect(page.locator('h1')).toContainText('3D ENGINE UNAVAILABLE');

    // Quick access buttons must be present
    const osLink = page.locator('a:has-text("ENTER NJ-OS COMMAND CENTER")');
    await expect(osLink).toBeVisible();

    const cvLink = page.locator('a:has-text("DOWNLOAD CV")');
    await expect(cvLink).toBeVisible();
  });
});
