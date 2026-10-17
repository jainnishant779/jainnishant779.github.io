import { test, expect } from '@playwright/test';

const routes = [
  { path: '', heading: "THE ENGINEER'S CAVE" },
  { path: 'os', heading: 'NJ-OS // COMMAND CENTER' },
  { path: 'about', heading: '01 // IDENTITY DOSSIER' },
  { path: 'projects', heading: '02 // PROJECT ARCHIVES' },
  { path: 'projects/edgedesk', heading: 'EdgeDesk: Secure Multi-Device Remote Access Platform' },
  { path: 'projects/crowd-analytics', heading: 'Real-Time Crowd Analytics & Stampede Detection' },
  { path: 'experience', heading: '03 // EXPERIENCE LOG' },
  { path: 'skills', heading: '04 // TECHNICAL CAPABILITIES' },
  { path: 'achievements', heading: '05 // HONORS & CREDENTIALS' },
  { path: 'contact', heading: '07 // TRANSMISSION PROTOCOL' },
  { path: 'cv', heading: '06 // CURRICULUM VITAE' },
];

test.describe('Phase 1 Routes & Deep Links', () => {
  for (const { path, heading } of routes) {
    test(`route "/${path}" loads and displays "${heading}"`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);

      // Verify the expected content/heading is in the page
      await expect(page.locator('body')).toContainText(heading);

      // Test page reload to verify SPA static route fallback works
      const reloadResponse = await page.reload();
      expect(reloadResponse?.status()).toBe(200);
      await expect(page.locator('body')).toContainText(heading);
    });
  }
});
