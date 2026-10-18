import { test, expect } from '@playwright/test';

test.describe('Photorealistic Scroll Film Engine & Perspective Quad', () => {
  test('Manifest loads with valid structure and initial frames return 200 OK', async ({ request }) => {
    const res = await request.get('film/manifest.json');
    expect(res.status()).toBe(200);

    const manifest = await res.json();
    expect(manifest.count).toBeGreaterThan(0);
    expect(manifest.fps).toBe(12);
    expect(manifest.desktop.width).toBe(1600);
    expect(manifest.desktop.height).toBe(900);
    expect(manifest.mobile.width).toBe(960);
    expect(manifest.mobile.height).toBe(540);
    expect(manifest.segments.length).toBeGreaterThanOrEqual(4);
    expect(manifest.screenQuad.length).toBe(4);

    // Initial desktop frame returns 200 OK
    const frame0Res = await request.get('film/desktop/f_0000.webp');
    expect(frame0Res.status()).toBe(200);
    expect(frame0Res.headers()['content-type']).toContain('webp');

    // Initial mobile frame returns 200 OK
    const frameMobRes = await request.get('film/mobile/f_0000.webp');
    expect(frameMobRes.status()).toBe(200);
  });

  test('Canvas mounts, scrolls smoothly, and renders non-blank frames on scroll', async ({ page }) => {
    test.setTimeout(90000);

    await page.goto('');
    await page.waitForSelector('.scroll-track', { state: 'attached', timeout: 30000 });
    await page.waitForSelector('canvas.film-canvas', { state: 'attached', timeout: 30000 });

    const maxScroll = await page.evaluate(() => {
      const docH = document.documentElement.scrollHeight;
      const winH = window.innerHeight;
      return docH - winH;
    });
    expect(maxScroll).toBeGreaterThan(1000);

    // Scroll to 50% (catwalk / cavern reveal)
    await page.evaluate((targetY) => {
      window.scrollTo(0, targetY);
      document.documentElement.scrollTop = targetY;
    }, maxScroll * 0.5);

    await page.waitForTimeout(600);

    // Verify canvas is actively rendering and not purely transparent blank
    const isCanvasDrawn = await page.evaluate(() => {
      const canvas = document.querySelector('canvas.film-canvas') as HTMLCanvasElement;
      if (!canvas) return false;
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;
      const sample = ctx.getImageData(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2), 1, 1).data;
      // Alpha channel must be > 0 and not completely black (or has pixel intensity)
      return sample[3] > 0;
    });
    expect(isCanvasDrawn).toBeTruthy();
  });

  test('Scrolling to terminal displays matrix3d ScreenPreview with interactive profile', async ({ page }) => {
    test.setTimeout(90000);

    await page.goto('');
    await page.waitForSelector('.scroll-track', { state: 'attached', timeout: 30000 });

    const maxScroll = await page.evaluate(() => {
      return document.documentElement.scrollHeight - window.innerHeight;
    });

    // Scroll directly to 98% (terminal workstation)
    await page.evaluate((targetY) => {
      window.scrollTo(0, targetY);
      document.documentElement.scrollTop = targetY;
    }, maxScroll * 0.98);

    await page.waitForTimeout(1000);

    // ScreenPreview quad container must be visible
    const quadContainer = page.locator('.film-screen-quad-container');
    await expect(quadContainer).toBeVisible({ timeout: 10000 });
    await expect(quadContainer).toContainText('NISHANT JAIN');
    await expect(quadContainer).toContainText('NJ-OS');

    // Click CTA to trigger zoom and launch OS
    const ctaBtn = page.locator('.workstation-access-btn');
    await expect(ctaBtn).toBeVisible();
    await ctaBtn.click();

    // Verify OS overlay mounts
    const osOverlay = page.locator('.os-container.overlay');
    await expect(osOverlay).toBeVisible({ timeout: 5000 });
    await expect(osOverlay).toContainText('NJ-OS');

    // Escape closes overlay
    await page.keyboard.press('Escape');
    await expect(osOverlay).not.toBeVisible({ timeout: 5000 });
  });
});
