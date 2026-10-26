import { test, expect } from '@playwright/test';

test.describe('/story — Editorial VOX-style portfolio page', () => {
  test('renders without console errors and all section IDs exist', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('story');
    await page.waitForLoadState('domcontentloaded');

    // Expected section IDs
    const sectionIds = ['hero', 'work', 'about', 'skills', 'record', 'hire'];
    for (const id of sectionIds) {
      const section = page.locator(`#${id}`);
      await expect(section).toBeAttached();
    }

    // Top brand link and navigation exist
    await expect(page.locator('header nav')).toBeVisible();
    await expect(page.locator('header a:has-text("NISHANT JAIN")')).toBeVisible();

    // Verify zero page errors
    expect(errors).toEqual([]);
  });

  test('flashlight element reveals content and responds to pointer coordinates', async ({ page }) => {
    await page.goto('story');
    await page.waitForSelector('#hero');

    // The hero flashlight container
    const hero = page.locator('#hero');
    await expect(hero).toBeVisible();

    // Move pointer across the hero section
    await hero.hover({ position: { x: 200, y: 250 } });
    await page.waitForTimeout(300);

    // Verify lit mask layer exists
    const litLayer = hero.locator('div[aria-hidden="true"]').nth(1);
    await expect(litLayer).toBeAttached();

    // Check that CSS variable style was written by pointer or rAF
    const hasStyle = await hero.locator('> div').first().evaluate((el) => {
      const x = el.style.getPropertyValue('--x');
      const y = el.style.getPropertyValue('--y');
      return Boolean(x && y);
    });
    expect(hasStyle).toBe(true);
  });

  test('clicking LETS COLLABORATE opens dialog with contact details, Esc closes and returns focus', async ({ page }) => {
    await page.goto('story');
    await page.waitForSelector('#hire');

    // Scroll directly to hire section
    await page.locator('#hire').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const collaborateBtn = page.locator('button:has-text("LET\'S COLLABORATE")');
    await expect(collaborateBtn).toBeVisible();

    // Click button to open overlay
    await collaborateBtn.click();

    // Dialog appears
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 4000 });

    // Verify verified contact details
    await expect(dialog).toContainText('jainnishant779@gmail.com');
    await expect(dialog.locator('a[href*="linkedin.com"]')).toBeVisible();
    await expect(dialog.locator('a[href*="github.com"]')).toBeVisible();
    await expect(dialog.locator('a[href*="Nishant_Jain_CV.pdf"]')).toBeVisible();

    // Press Escape to dismiss
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden({ timeout: 3000 });

    // Focus returns to the trigger button
    await expect(collaborateBtn).toBeFocused();
  });

  test('reduced motion disables scrubbed animations and keeps all section text visible', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('story');
    await page.waitForLoadState('domcontentloaded');

    // Every key section heading must be visible
    await expect(page.locator('#hero h1').first()).toBeVisible();
    await expect(page.locator('#about h2')).toBeVisible();
    await expect(page.locator('#skills h2')).toBeVisible();
    await expect(page.locator('#record h2')).toBeVisible();
    await expect(page.locator('#hire h2')).toBeVisible();
  });

  test('mobile viewport (390px) has zero horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('story');
    await page.waitForLoadState('networkidle');

    // Scroll through the page and verify no horizontal scrollbar overflow
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    expect(hasOverflow).toBe(false);
  });
});
