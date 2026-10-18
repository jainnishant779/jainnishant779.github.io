import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

test.describe('3D Experience & Guided Camera Scroll Journey', () => {
  test('Scroll drives camera, gate opens, captures screenshots, and opens workstation OS', async ({
    page,
  }) => {
    test.setTimeout(240000);

    // Ensure shots directory exists
    const shotsDir = path.join(process.cwd(), 'tests', '__shots__');
    if (!fs.existsSync(shotsDir)) {
      fs.mkdirSync(shotsDir, { recursive: true });
    }

    page.on('pageerror', (err) => {
      console.log('PAGE_ERROR_DETECTED:', err.message);
    });
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        console.log(`PAGE_CONSOLE_${msg.type().toUpperCase()}:`, msg.text());
      }
    });

    await page.goto('');

    // Wait for lazy-loaded HomePage and scroll-track to mount
    await page.waitForSelector('.scroll-track', { state: 'attached', timeout: 45000 });
    await page.waitForSelector('canvas', { state: 'attached', timeout: 45000 });

    const getScrollHeight = async () => {
      const result = await page.evaluate(() => {
        const docH = document.documentElement.scrollHeight;
        const bodyH = document.body.scrollHeight;
        const winH = window.innerHeight;
        const track = document.querySelector('.scroll-track');
        const trackH = track ? (track as HTMLElement).offsetHeight : -1;
        return { docH, bodyH, winH, trackH, diff: Math.max(docH, bodyH) - winH };
      });
      console.log('GET_SCROLL_HEIGHT_RESULT:', result);
      return result.diff;
    };

    const maxScroll = await getScrollHeight();
    expect(maxScroll).toBeGreaterThan(1000);

    const waypoints = [
      { progress: 0.0, name: 'progress_0_0_exterior' },
      { progress: 0.3, name: 'progress_0_3_gate_open' },
      { progress: 0.5, name: 'progress_0_5_cavern_reveal' },
      { progress: 0.65, name: 'progress_0_65_catwalk_approach' },
      { progress: 1.0, name: 'progress_1_0_workstation' },
    ];

    // Scroll forward through waypoints and take screenshots
    for (const wp of waypoints) {
      await page.evaluate(
        ({ targetY }) => {
          window.scrollTo(0, targetY);
          document.documentElement.scrollTop = targetY;
          document.body.scrollTop = targetY;
        },
        { targetY: maxScroll * wp.progress }
      );

      // Wait a moment for lerp damping
      await page.waitForTimeout(300);

      const shotPath = path.join(shotsDir, `${wp.name}.png`);
      await page.screenshot({ path: shotPath });
      expect(fs.existsSync(shotPath)).toBeTruthy();
    }

    // Reverse scroll back to 0.3
    await page.evaluate(
      ({ targetY }) => {
        window.scrollTo(0, targetY);
        document.documentElement.scrollTop = targetY;
        document.body.scrollTop = targetY;
      },
      { targetY: maxScroll * 0.3 }
    );
    await page.waitForTimeout(300);

    // Scroll back to workstation at 1.0
    await page.evaluate(
      ({ targetY }) => {
        window.scrollTo(0, targetY);
        document.documentElement.scrollTop = targetY;
        document.body.scrollTop = targetY;
      },
      { targetY: maxScroll * 1.0 }
    );
    await page.waitForTimeout(1000);

    // Contextual workstation access button must now be visible
    const accessBtn = page.locator('button:has-text("ACCESS COMPUTER WORKSTATION")');
    await expect(accessBtn).toBeVisible({ timeout: 10000 });

    // Click to launch OS Overlay
    await accessBtn.click();

    // Verify OS overlay is mounted
    const osOverlay = page.locator('.os-container.overlay');
    await expect(osOverlay).toBeVisible();
    await expect(osOverlay).toContainText('NJ-OS');

    // Press Escape to close overlay
    await page.keyboard.press('Escape');
    await expect(osOverlay).not.toBeVisible();
  });
});
