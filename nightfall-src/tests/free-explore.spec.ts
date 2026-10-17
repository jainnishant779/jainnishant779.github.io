import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

test.describe('Phase 5 — Free Explore Mode, Rapier Physics, & World Colliders', () => {
  test('Mode toggle, WASD locomotion, collider bounds, stair autostep, and workstation interaction', async ({
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

    // 1. Initial State: Mode Toggle Button is visible in top HUD
    const toggleBtn = page.locator('.free-explore-toggle-btn');
    await expect(toggleBtn).toBeVisible({ timeout: 10000 });
    await expect(toggleBtn).toContainText('FREE EXPLORE [WASD]');

    // 2. Toggle to Free Explore Mode
    await toggleBtn.click();
    await page.waitForTimeout(500);

    // Verify Free Explore mode activated
    const freeBanner = page.locator('.free-explore-banner');
    await expect(freeBanner).toBeVisible({ timeout: 5000 });
    await expect(freeBanner).toContainText('WASD to walk');
    await expect(toggleBtn).toContainText('EXIT FREE EXPLORE [ESC]');
    await expect(page.locator('text=FREE EXPLORE MODE // MANUAL LOCOMOTION ACTIVE')).toBeVisible();

    // 3. Verify Player Initial Spawn and Pose on Walkway
    const initialPos = await page.evaluate(() => {
      return (window as any).__NIGHTFALL_EXPLORE__?.getCameraPosition();
    });
    expect(initialPos).toBeDefined();
    expect(initialPos.z).toBeCloseTo(-22, 0.5);
    expect(initialPos.y).toBeGreaterThan(-1.0);

    // Screenshot initial free explore view
    const shotWalkway = path.join(shotsDir, 'free_explore_walkway.png');
    await page.screenshot({ path: shotWalkway });
    expect(fs.existsSync(shotWalkway)).toBeTruthy();

    // 4. Test WASD Locomotion: Press W to walk forward into cavern
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(2000);
    await page.keyboard.up('KeyW');

    const walkedPos = await page.evaluate(() => {
      return (window as any).__NIGHTFALL_EXPLORE__?.getCameraPosition();
    });
    expect(walkedPos).toBeDefined();
    console.log('WALKED_POSITION:', walkedPos);
    // Player must have moved forward (more negative Z toward cavern)
    expect(walkedPos.z).toBeLessThan(-22.1);
    // Player must not have fallen through the floor
    expect(walkedPos.y).toBeGreaterThan(-2.0);

    // 5. Test Stair Autostep: Walk across stairs onto raised command platform
    // Teleport just before stair base at z = -54
    await page.evaluate(() => {
      (window as any).__NIGHTFALL_EXPLORE__?.teleport(0, -0.15, -54);
    });
    await page.waitForTimeout(200);

    // Walk forward up the stairs
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(2500);
    await page.keyboard.up('KeyW');

    const stairsPos = await page.evaluate(() => {
      return (window as any).__NIGHTFALL_EXPLORE__?.getCameraPosition();
    });
    console.log('STAIRS_CLIMBED_POSITION:', stairsPos);
    // Autostep climbed the stairs: camera Y rises as autostep steps onto stairs (higher than walkway eye level ~0.60)
    expect(stairsPos.y).toBeGreaterThan(0.62);
    expect(stairsPos.z).toBeLessThan(-54.3);

    // 6. Test Workstation Proximity & E Key
    // Move to workstation interaction radius on command platform
    await page.evaluate(() => {
      (window as any).__NIGHTFALL_EXPLORE__?.teleport(0, 1.9, -63.5);
    });
    await page.waitForTimeout(300);

    // Contextual button must be visible
    const workstationBtn = page.locator('button:has-text("ACCESS COMPUTER WORKSTATION")');
    await expect(workstationBtn).toBeVisible({ timeout: 5000 });

    // Press E key to access NJ-OS Console
    await page.keyboard.press('KeyE');
    await page.waitForTimeout(500);

    // Verify NJ-OS Overlay is open
    const osOverlay = page.locator('.os-container.overlay');
    await expect(osOverlay).toBeVisible({ timeout: 5000 });
    await expect(osOverlay).toContainText('NJ-OS');

    // Screenshot with OS open from Free Explore
    const shotOS = path.join(shotsDir, 'free_explore_workstation_os.png');
    await page.screenshot({ path: shotOS });
    expect(fs.existsSync(shotOS)).toBeTruthy();

    // 7. Press Escape to close NJ-OS Overlay
    await page.keyboard.press('Escape');
    await expect(osOverlay).not.toBeVisible({ timeout: 5000 });

    // 8. Press Escape again to exit Free Explore Mode and return to Guided Tour
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Banner should be gone, mode returned to guided tour
    await expect(freeBanner).not.toBeVisible();
    await expect(toggleBtn).toContainText('FREE EXPLORE [WASD]');
    await expect(page.locator('text=FACILITY DEPTH')).toBeVisible();
  });
});
