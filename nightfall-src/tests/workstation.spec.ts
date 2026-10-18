import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

test.describe('Workstation Primary Terminal & Perspective Quad Screen', () => {
  test('Workstation renders live terminal screen, clicking button launches OS with zoom, and Escape returns', async ({
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

    // 2. Capture high-fidelity screenshot of the terminal workstation
    const shotMonitors = path.join(shotsDir, 'workstation_terminal.png');
    await page.screenshot({ path: shotMonitors });
    expect(fs.existsSync(shotMonitors)).toBeTruthy();

    // 3. Workstation access button is visible on the perspective screen quad
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
    const shotZoomed = path.join(shotsDir, 'workstation_screen_zoomed.png');
    await page.screenshot({ path: shotZoomed });
    expect(fs.existsSync(shotZoomed)).toBeTruthy();

    // 5. Close OS overlay via Escape key
    await page.keyboard.press('Escape');
    await expect(osOverlay).not.toBeVisible({ timeout: 5000 });
  });
});
