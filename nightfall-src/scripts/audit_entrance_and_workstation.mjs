import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const outDir = 'C:/Users/nishant/.gemini/antigravity/brain/3c45581e-2b3d-427a-9e1d-ee97ef706df7/fresh_audit';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function runAudit() {
  console.log('=== STARTING FRESH AUDIT: ENTRANCE TO WORKSTATION ===');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  await page.goto('http://localhost:4173/nightfall/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Initial State (Progress 0.0) -> Closed Vault Door & Access Button
  console.log('Capturing: 01_entrance_closed_gate.png');
  await page.screenshot({ path: path.join(outDir, '01_entrance_closed_gate.png') });

  const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);

  // 2. Gate Opening (Progress 0.10) -> Doors parting, golden light pouring through
  console.log('Capturing: 02_gate_unlatching_parting.png');
  await page.evaluate((y) => window.scrollTo(0, y), maxScroll * 0.10);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, '02_gate_unlatching_parting.png') });

  // 3. Catwalk Threshold (Progress 0.20) -> Entering the cavern
  console.log('Capturing: 03_catwalk_threshold.png');
  await page.evaluate((y) => window.scrollTo(0, y), maxScroll * 0.20);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, '03_catwalk_threshold.png') });

  // 4. Catwalk Midpoint (Progress 0.50) -> Walking past waterfall
  console.log('Capturing: 04_catwalk_midpoint.png');
  await page.evaluate((y) => window.scrollTo(0, y), maxScroll * 0.50);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, '04_catwalk_midpoint.png') });

  // 5. Workstation Arrival (Progress 1.0) -> Multi-monitor console with diegetic CRT scanlines
  console.log('Capturing: 05_workstation_arrival.png');
  await page.evaluate((y) => window.scrollTo(0, y), maxScroll * 1.0);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(outDir, '05_workstation_arrival.png') });

  // 6. Test clicking Center Monitor Dossier (Poultry Health AI architecture diagram)
  console.log('Testing Center Monitor interaction...');
  const poultryBtn = page.locator('.workstation-right-screen button:has-text("POULTRY")');
  if (await poultryBtn.isVisible()) {
    await poultryBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, '06_center_poultry_architecture.png') });
  }

  // 7. Test clicking EdgeDesk topology
  const edgeDeskBtn = page.locator('.workstation-left-screen button:has-text("EDGEDESK")');
  if (await edgeDeskBtn.isVisible()) {
    await edgeDeskBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, '07_center_edgedesk_topology.png') });
  }

  await browser.close();
  console.log('=== AUDIT COMPLETE! Screenshots saved to fresh_audit/ ===');
}

runAudit().catch(console.error);
