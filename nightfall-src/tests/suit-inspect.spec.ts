import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

test.describe('Phase 7 — Armored Tactical Suit Pod & Orbit Inspection', () => {
  test('suit pod display renders, proximity CTA triggers orbit inspection, HUD card displays tactical specs, and ESC restores mode', async ({
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

    // 1. Scroll to the Suit Platform in Guided Mode (progress = 0.70)
    await page.evaluate(
      ({ targetY }) => {
        window.scrollTo(0, targetY);
        document.documentElement.scrollTop = targetY;
        document.body.scrollTop = targetY;
      },
      { targetY: maxScroll * 0.70 }
    );
    await page.waitForTimeout(1500);

    // 2. Verify contextual "INSPECT TACTICAL SUIT POD" CTA button appears
    const inspectBtn = page.locator('button:has-text("INSPECT TACTICAL SUIT POD")');
    await expect(inspectBtn).toBeVisible({ timeout: 10000 });

    // Capture screenshot of the suit display case in guided mode
    const shotSuitCase = path.join(shotsDir, 'suit_phase7_guided_case.png');
    await page.screenshot({ path: shotSuitCase });
    expect(fs.existsSync(shotSuitCase)).toBeTruthy();

    // 3. Click the inspect CTA to enter suit inspection mode
    await inspectBtn.click();
    await page.waitForTimeout(500);

    // Verify mode is now 'suit-inspect' and SuitHudCard is visible
    const suitCard = page.locator('.suit-hud-card');
    await expect(suitCard).toBeVisible({ timeout: 5000 });
    await expect(suitCard).toContainText('WARDEN EXOSKELETON MK-IV');
    await expect(suitCard).toContainText('NVIDIA Jetson Core (CUDA)');
    await expect(suitCard).toContainText('Titanium-Carbon Fiber');

    // Capture screenshot of Orbit Inspection Mode with HUD Card
    const shotOrbitInspect = path.join(shotsDir, 'suit_phase7_orbit_inspect.png');
    await page.screenshot({ path: shotOrbitInspect });
    expect(fs.existsSync(shotOrbitInspect)).toBeTruthy();

    // 4. Test orbit interaction (drag mouse on canvas)
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2, { steps: 5 });
      await page.mouse.up();
    }
    await page.waitForTimeout(300);

    // 5. Exit inspection via HUD button
    const exitBtn = page.locator('.exit-suit-inspect-btn');
    await expect(exitBtn).toBeVisible();
    await exitBtn.click();
    await page.waitForTimeout(400);

    // Verify returned to Guided Mode
    await expect(suitCard).not.toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=FACILITY DEPTH')).toBeVisible();

    // 6. Test 'E' key trigger in Guided Mode
    await page.keyboard.press('KeyE');
    await page.waitForTimeout(400);
    await expect(suitCard).toBeVisible({ timeout: 5000 });

    // 7. Exit inspection via 'Escape' key
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    await expect(suitCard).not.toBeVisible({ timeout: 5000 });

    // 8. Test Suit Inspection from Free Explore mode
    const freeToggleBtn = page.locator('.free-explore-toggle-btn');
    await freeToggleBtn.click();
    await page.waitForTimeout(300);

    // Teleport directly to Suit Platform deck in Free Explore
    await page.evaluate(() => {
      (window as any).__NIGHTFALL_EXPLORE__?.teleport(-16, -0.4, -40.5);
    });
    await page.waitForTimeout(400);

    // Proximity inspect button must appear
    await expect(page.locator('button:has-text("INSPECT TACTICAL SUIT POD")')).toBeVisible({ timeout: 5000 });

    // Press E to enter suit inspect from Free Explore
    await page.keyboard.press('KeyE');
    await page.waitForTimeout(400);
    await expect(suitCard).toBeVisible({ timeout: 5000 });

    // Press Escape to return directly back to Free Explore mode
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    await expect(suitCard).not.toBeVisible({ timeout: 5000 });
    await expect(page.locator('.free-explore-banner')).toBeVisible({ timeout: 5000 });

    // Press Escape again to return to Guided Tour
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    await expect(page.locator('text=FACILITY DEPTH')).toBeVisible();
  });
});
