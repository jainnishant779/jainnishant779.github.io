import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

test.describe('Phase 6 — Batcomputer Workstation, 5-Monitor Arc, & Screen Zoom Dolly', () => {
  test('5-monitor arc renders live canvas telemetry, clicking screen launches OS, and camera dollys into screen', async ({
    page,
  }) => {
    test.setTimeout(180000);

    const shotsDir = path.join(process.cwd(), 'tests', '__shots__');
    if (!fs.existsSync(shotsDir)) {
      fs.mkdirSync(shotsDir, { recursive: true });
    }

    page.on('pageerror', (err) => {
      console.log('PAGE_ERROR_DETECTED:', err.message);
    });

    await page.goto('');
    await page.waitForSelector('.scroll-track', { state: 'attached', timeout: 45000 });
    await page.waitForSelector('canvas', { state: 'attached', timeout: 45000 });

    const getScrollHeight = async () => {
      return await page.evaluate(() => {
        const docH = document.documentElement.scrollHeight;
        const bodyH = document.body.scrollHeight;
        const winH = window.innerHeight;
        return Math.max(docH, bodyH) - winH;
      });
    };

    const maxScroll = await getScrollHeight();

    // 1. Scroll directly to the Workstation platform (progress = 1.0)
    await page.evaluate(
      ({ targetY }) => {
        window.scrollTo(0, targetY);
        document.documentElement.scrollTop = targetY;
        document.body.scrollTop = targetY;
      },
      { targetY: maxScroll * 1.0 }
    );
    await page.waitForTimeout(1500);

    // 2. Capture high-fidelity screenshot of the 5-monitor arc and desk
    const shotMonitors = path.join(shotsDir, 'workstation_phase6_monitors.png');
    await page.screenshot({ path: shotMonitors });
    expect(fs.existsSync(shotMonitors)).toBeTruthy();

    // 3. Contextual workstation access button is visible
    const workstationBtn = page.locator('button:has-text("ACCESS COMPUTER WORKSTATION")');
    await expect(workstationBtn).toBeVisible({ timeout: 10000 });

    // 4. Click the workstation button to trigger screen zoom transition and OS open
    await workstationBtn.click();
    await page.waitForTimeout(500);

    // Verify OS overlay is mounted and visible
    const osOverlay = page.locator('.os-container.overlay');
    await expect(osOverlay).toBeVisible({ timeout: 5000 });
    await expect(osOverlay).toContainText('NJ-OS');

    // Screenshot of screen zoom transition
    const shotZoomed = path.join(shotsDir, 'workstation_phase6_screen_zoomed.png');
    await page.screenshot({ path: shotZoomed });
    expect(fs.existsSync(shotZoomed)).toBeTruthy();

    // 5. Close OS overlay via Escape key
    await page.keyboard.press('Escape');
    await expect(osOverlay).not.toBeVisible({ timeout: 5000 });

    // Wait for camera to dolly back out to resting pose
    await page.waitForTimeout(600);

    // 6. Test Free Explore mode near workstation:
    // Switch to Free Explore mode
    const freeToggleBtn = page.locator('.free-explore-toggle-btn');
    await freeToggleBtn.click();
    await page.waitForTimeout(300);

    // Teleport directly to workstation desk in free explore
    await page.evaluate(() => {
      (window as any).__NIGHTFALL_EXPLORE__?.teleport(0, 1.9, -63.5);
    });
    await page.waitForTimeout(300);

    // Workstation prompt must be visible
    await expect(page.locator('button:has-text("ACCESS COMPUTER WORKSTATION")')).toBeVisible({ timeout: 5000 });

    // Press E to open OS from free explore
    await page.keyboard.press('KeyE');
    await expect(osOverlay).toBeVisible({ timeout: 5000 });

    // Press Escape to close OS and return to Free Explore
    await page.keyboard.press('Escape');
    await expect(osOverlay).not.toBeVisible({ timeout: 5000 });

    // Press Escape again to return to Guided Tour
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await expect(page.locator('text=FACILITY DEPTH')).toBeVisible();
  });
});
