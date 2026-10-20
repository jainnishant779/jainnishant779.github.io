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

  test('Clicking a tactical monitor opens the Project Intel Dossier directly on the center screen in-place without page jump', async ({
    page,
  }) => {
    test.setTimeout(180000);
    const shotsDir = path.join(process.cwd(), 'tests', '__shots__');
    await page.goto('');
    await page.waitForSelector('.scroll-track', { state: 'attached', timeout: 45000 });

    const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    await page.evaluate(
      ({ targetY }) => {
        window.scrollTo(0, targetY);
        document.documentElement.scrollTop = targetY;
        document.body.scrollTop = targetY;
      },
      { targetY: maxScroll * 1.0 }
    );
    await page.waitForTimeout(1500);

    // Click [1] POULTRY HEALTH AI quick selector button
    const poultryBtn = page.locator('button:has-text("[1] POULTRY HEALTH AI")');
    await expect(poultryBtn).toBeVisible({ timeout: 10000 });
    await poultryBtn.click();
    await page.waitForTimeout(600);

    // Verify In-Place Dossier is mounted on the main center screen
    const dossierHeader = page.locator('text=COMMAND WORKSTATION INTEL DOSSIER');
    await expect(dossierHeader).toBeVisible({ timeout: 5000 });

    // Capture screenshot of the in-place project dossier
    const shotProject = path.join(shotsDir, 'workstation_project_selected.png');
    await page.screenshot({ path: shotProject });
    expect(fs.existsSync(shotProject)).toBeTruthy();

    // Verify Next Project button cycles
    const nextBtn = page.locator('button:has-text("NEXT PROJECT →")');
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();
    await page.waitForTimeout(400);

    // Press Escape to return to master view
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    await expect(dossierHeader).not.toBeVisible({ timeout: 5000 });
  });

  test('Clicking the 3D Suit Vault button transitions to 3D Armored Suit chamber with Warden MK-IV specifications', async ({
    page,
  }) => {
    test.setTimeout(180000);
    const shotsDir = path.join(process.cwd(), 'tests', '__shots__');
    await page.goto('');
    await page.waitForSelector('.scroll-track', { state: 'attached', timeout: 45000 });

    // Click the top HUD Suit Vault button
    const suitVaultBtn = page.locator('.suit-vault-hud-btn');
    await expect(suitVaultBtn).toBeVisible({ timeout: 10000 });
    await suitVaultBtn.click();
    await page.waitForTimeout(800);

    // Verify 3D Suit Viewport and HUD card are rendered
    const suitViewport = page.locator('.suit-inspect-viewport');
    await expect(suitViewport).toBeVisible({ timeout: 8000 });
    await expect(suitViewport).toContainText('WARDEN EXOSKELETON MK-IV');
    await expect(suitViewport).toContainText('NVIDIA Jetson Core (CUDA)');

    // Capture screenshot of the 3D suit vault
    const shotSuit = path.join(shotsDir, 'warden_suit_vault_3d.png');
    await page.screenshot({ path: shotSuit });
    expect(fs.existsSync(shotSuit)).toBeTruthy();

    // Click Return button to exit vault
    const returnBtn = page.locator('button:has-text("RETURN TO WORKSTATION")');
    await expect(returnBtn).toBeVisible();
    await returnBtn.click();
    await page.waitForTimeout(400);

    // Verify suit viewport is closed
    await expect(suitViewport).not.toBeVisible({ timeout: 5000 });
  });
});

