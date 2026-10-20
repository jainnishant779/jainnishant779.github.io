import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const AUDIT_DIR = path.join(process.cwd(), 'audit_shots');
if (!fs.existsSync(AUDIT_DIR)) {
  fs.mkdirSync(AUDIT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: '1080p_desktop', width: 1920, height: 1080 },
  { name: 'laptop_scaled', width: 1536, height: 864 },
  { name: 'compact_laptop', width: 1366, height: 768 },
];

async function runAudit() {
  console.log('=== STARTING AUTONOMOUS AUDIT & VERIFICATION LOOP ===');
  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    console.log(`\n--- Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });

    const consoleLogs = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warn') {
        consoleLogs.push(`[${msg.type().toUpperCase()}] ${msg.text()}`);
      }
    });

    await page.goto('http://localhost:4173/nightfall/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 1. Initial State (Progress 0.0)
    await page.screenshot({ path: path.join(AUDIT_DIR, `${vp.name}_01_entrance.png`) });

    const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);

    // 2. Midpoint (Progress 0.5)
    await page.evaluate((y) => window.scrollTo(0, y), maxScroll * 0.5);
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(AUDIT_DIR, `${vp.name}_02_catwalk_mid.png`) });

    // 3. Workstation Arrival (Progress 1.0)
    await page.evaluate((y) => window.scrollTo(0, y), maxScroll * 1.0);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(AUDIT_DIR, `${vp.name}_03_workstation_3monitors.png`) });

    // 4. Test Left Monitor Interactivity (Tabs)
    const hardwareTab = page.locator('.workstation-left-screen button:has-text("HARDWARE")');
    if (await hardwareTab.isVisible()) {
      await hardwareTab.click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(AUDIT_DIR, `${vp.name}_04_left_hardware_tab.png`) });
    }

    const networkTab = page.locator('.workstation-left-screen button:has-text("NETWORK")');
    if (await networkTab.isVisible()) {
      await networkTab.click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(AUDIT_DIR, `${vp.name}_05_left_network_tab.png`) });
    }

    // 5. Test Center Monitor Interactivity (Projects & Dossiers)
    const poultryBtn = page.locator('button:has-text("[1] POULTRY HEALTH AI")');
    if (await poultryBtn.isVisible()) {
      await poultryBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(AUDIT_DIR, `${vp.name}_06_dossier_poultry.png`) });

      // Next project (EdgeDesk)
      const nextBtn = page.locator('button:has-text("NEXT PROJECT →")');
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
        await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(AUDIT_DIR, `${vp.name}_07_dossier_edgedesk.png`) });

        // Next project (Facial Attendance)
        await nextBtn.click();
        await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(AUDIT_DIR, `${vp.name}_08_dossier_facial.png`) });
      }

      // Close dossier
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    }

    // 6. Test Right Monitor Interactivity (Tabs)
    const expTab = page.locator('.workstation-right-screen button:has-text("EXPERIENCE")');
    if (await expTab.isVisible()) {
      await expTab.click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(AUDIT_DIR, `${vp.name}_09_right_experience_tab.png`) });
    }

    const honorsTab = page.locator('.workstation-right-screen button:has-text("HONORS")');
    if (await honorsTab.isVisible()) {
      await honorsTab.click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(AUDIT_DIR, `${vp.name}_10_right_honors_tab.png`) });
    }

    // 7. Check Suit Vault
    const suitBtn = page.locator('.suit-vault-hud-btn');
    if (await suitBtn.isVisible()) {
      await suitBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(AUDIT_DIR, `${vp.name}_11_suit_vault_3d.png`) });

      const returnBtn = page.locator('button:has-text("RETURN TO WORKSTATION")');
      if (await returnBtn.isVisible()) {
        await returnBtn.click();
        await page.waitForTimeout(500);
      }
    }

    console.log(`Console issues (${consoleLogs.length}):`, consoleLogs);
    await page.close();
  }

  await browser.close();
  console.log('=== AUDIT RUN COMPLETE ===');
}

runAudit().catch(console.error);
