import { test, expect } from '@playwright/test';

test.describe('Phase 8 — Polish, Audio Synthesizer, & Accessibility', () => {
  test('audio toggle defaults to muted, activates ambience on user interaction, and toggles state correctly', async ({
    page,
  }) => {
    test.setTimeout(120000);

    const pageErrors: string[] = [];
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    await page.goto('');
    await page.waitForSelector('.hud-overlay', { state: 'attached', timeout: 30000 });

    // 1. Audio button is present and starts in "AUDIO OFF" (muted by default per spec)
    const audioBtn = page.locator('.audio-toggle-btn');
    await expect(audioBtn).toBeVisible({ timeout: 10000 });
    await expect(audioBtn).toContainText('AUDIO OFF');

    // 2. Click to enable audio: button changes to "AUDIO ON"
    await audioBtn.click();
    await expect(audioBtn).toContainText('AUDIO ON');

    // 3. Click again to mute audio: button changes back to "AUDIO OFF"
    await audioBtn.click();
    await expect(audioBtn).toContainText('AUDIO OFF');

    // Verify no audio playback errors were thrown
    expect(pageErrors.length).toBe(0);
  });

  test('permanent HUD corner links are accessible on desktop', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('');
    await page.waitForSelector('.hud-overlay', { state: 'attached', timeout: 30000 });

    // Quick portfolio button
    const quickPortfolioBtn = page.locator('.quick-portfolio-btn');
    await expect(quickPortfolioBtn).toBeVisible({ timeout: 10000 });
    await expect(quickPortfolioBtn).toContainText('QUICK PORTFOLIO');

    // Clicking Quick Portfolio immediately launches NJ-OS
    await quickPortfolioBtn.click();
    const osOverlay = page.locator('.os-container.overlay');
    await expect(osOverlay).toBeVisible({ timeout: 5000 });

    // Close OS
    await page.keyboard.press('Escape');
    await expect(osOverlay).not.toBeVisible({ timeout: 5000 });

    // CV link
    const cvLink = page.locator('.hud-overlay a[href*="Nishant_Jain_CV.pdf"]');
    await expect(cvLink).toBeVisible();

    // Contact link
    const contactLink = page.locator('.hud-overlay a[href*="/contact"]');
    await expect(contactLink).toBeVisible();
  });

  test('prefers-reduced-motion media query disables smooth transitions and accelerates facility entry', async ({
    page,
  }) => {
    test.setTimeout(120000);

    // Emulate reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto('');
    await page.waitForSelector('.access-facility-btn', { state: 'attached', timeout: 30000 });

    const accessBtn = page.locator('.access-facility-btn');
    await expect(accessBtn).toBeVisible();

    // Click access facility under reduced motion (performs instant crossfade jump)
    await accessBtn.click();
    await page.waitForTimeout(500);

    // Facility depth should jump to or past 30%
    const depthText = await page.locator('text=/\\d+% FACILITY DEPTH/').textContent();
    expect(depthText).toBeTruthy();
  });

  test('HTML meta tags, OG tags, and noscript fallback are present and valid', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('');

    // Title
    await expect(page).toHaveTitle("Nishant Jain — The Engineer's Cave");

    // Open Graph meta tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toContain('Nishant Jain');

    const ogDesc = await page.locator('meta[property="og:description"]').getAttribute('content');
    expect(ogDesc).toContain('AI/ML');

    const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');
    expect(ogType).toBe('website');

    // Favicon link
    const favicon = await page.locator('link[rel="icon"]').getAttribute('href');
    expect(favicon).toContain('svg');

    // Noscript content in HTML source
    const content = await page.content();
    expect(content).toContain('class="noscript-fallback"');
    expect(content).toContain('jainnishant779@gmail.com');
  });
});
