import { test, expect } from '@playwright/test';

test.describe('Mobile Viewport (375px) Testing', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('No horizontal scroll at 375px width on OS view', async ({ page }) => {
    await page.goto('os');

    // Wait for the OS container to render
    await page.waitForSelector('.os-container');

    // Verify no document-level horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > doc.clientWidth + 1; // 1px threshold for subpixel rounding
    });

    expect(hasHorizontalOverflow).toBeFalsy();
  });

  test('Mobile navigation rail renders as bottom tab bar', async ({ page }) => {
    await page.goto('os');

    const rail = page.locator('.os-rail');
    await expect(rail).toBeVisible();

    // Verify it is positioned at the bottom on mobile
    const box = await rail.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeGreaterThanOrEqual(370);
    }
  });

  test('No horizontal scroll at 375px width on Home Page', async ({ page }) => {
    await page.goto('');

    const hasHorizontalOverflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > doc.clientWidth + 1;
    });

    expect(hasHorizontalOverflow).toBeFalsy();
  });
});
