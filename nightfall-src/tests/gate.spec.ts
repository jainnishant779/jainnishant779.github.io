import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

test.describe('Phase 3 — Gate Cinematic & Controls', () => {
  test('Access facility button, audio toggle, skip intro, and forward/backward gate scrubbing', async ({
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
    expect(maxScroll).toBeGreaterThan(1000);

    // 1. Initial State: Access Facility button and Skip Intro button are visible
    const accessFacilityBtn = page.locator('.access-facility-btn');
    await expect(accessFacilityBtn).toBeVisible({ timeout: 10000 });
    await expect(accessFacilityBtn).toContainText('ACCESS THE FACILITY');

    const skipIntroBtn = page.locator('.skip-intro-btn');
    await expect(skipIntroBtn).toBeVisible({ timeout: 5000 });

    // 2. Audio Toggle Test
    const audioBtn = page.locator('button:has-text("AUDIO OFF")');
    await expect(audioBtn).toBeVisible();
    await audioBtn.click();
    await expect(page.locator('button:has-text("AUDIO ON")')).toBeVisible();
    await page.locator('button:has-text("AUDIO ON")').click();
    await expect(page.locator('button:has-text("AUDIO OFF")')).toBeVisible();

    // Take initial gate-closed screenshot
    const shotClosed = path.join(shotsDir, 'gate_phase3_closed.png');
    await page.screenshot({ path: shotClosed });
    expect(fs.existsSync(shotClosed)).toBeTruthy();

    // 3. Test "ACCESS THE FACILITY" button click
    await accessFacilityBtn.click();
    await page.waitForTimeout(2000);

    // After scrolling past 0.12, ACCESS THE FACILITY button should no longer be visible
    await expect(accessFacilityBtn).not.toBeVisible({ timeout: 10000 });

    // Take gate-open screenshot
    const shotOpen = path.join(shotsDir, 'gate_phase3_opened.png');
    await page.screenshot({ path: shotOpen });
    expect(fs.existsSync(shotOpen)).toBeTruthy();

    // 4. Test Reverse Scrubbing back to 0.0
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.dispatchEvent(new Event('scroll'));
    });
    await page.waitForTimeout(1000);

    // Re-verification of initial state after reverse scrubbing
    await expect(accessFacilityBtn).toBeVisible({ timeout: 10000 });

    // 5. Test "SKIP INTRO" button click
    await skipIntroBtn.click();
    await page.waitForTimeout(2000);

    // Depth indicator should now be >= 40%
    await expect(page.locator('text=FACILITY DEPTH')).toBeVisible({ timeout: 5000 });
    const depthText = await page.locator('text=FACILITY DEPTH').textContent();
    console.log('DEPTH_AFTER_SKIP:', depthText);
    const depthNumber = parseInt(depthText?.match(/\d+/)?.[0] || '0', 10);
    expect(depthNumber).toBeGreaterThanOrEqual(40);
  });
});
