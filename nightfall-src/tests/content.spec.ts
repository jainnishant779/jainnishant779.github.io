import { test, expect, type Page } from '@playwright/test';

// Content guard: the UI may only say what the CV supports. These strings were invented, out of scope, or Batman IP,
// and must never reappear anywhere visitors can see (see .claude/skills/nightfall-ui/SKILL.md, rule 1).
const FORBIDDEN = [
  'years exp',
  '10+',
  '98.4',
  '99.2',
  'tls 1.3',
  'lora',
  'parkfnb',
  'suit vault',
  'suit chamber',
  'warden',
  'batcomputer',
  'watch intro',
  'dr. bruce',
  'open to high-impact',
  'gpu cuda',
  'cpu arm',
  'facility secure',
  'live system status',
  'rtsp',
  'ampere',
  'cgpa',
  'verified',
];

function assertClean(text: string, where: string) {
  expect(text.length, `no text captured on ${where} — the guard would pass vacuously`).toBeGreaterThan(200);
  const lower = text.toLowerCase();
  const hits = FORBIDDEN.filter((term) => lower.includes(term));
  expect(hits, `forbidden content on ${where}: ${hits.join(', ')}`).toEqual([]);
}

const bodyText = (page: Page) => page.locator('body').innerText();

const ROUTES = [
  'os',
  'about',
  'projects',
  'experience',
  'skills',
  'achievements',
  'contact',
  'cv',
  'projects/edgedesk',
  'projects/crowd-analytics',
  'projects/poultry-health-ai',
  'projects/on-device-ai',
  'projects/facial-attendance',
];

test.describe('Content guard — no invented or out-of-scope content', () => {
  for (const route of ROUTES) {
    test(`route /${route}`, async ({ page }) => {
      await page.goto(route);
      await page.waitForTimeout(500);
      let text = await bodyText(page);

      if (route.startsWith('projects/')) {
        await page.locator('button:has-text("architecture")').first().click();
        await page.waitForTimeout(300);
        text += '\n' + (await bodyText(page));
      }

      assertClean(text, `/${route}`);
    });
  }

  test('every OS module (standalone) and every architecture diagram tab (overlay)', async ({ page }) => {
    await page.goto('os');
    await page.waitForTimeout(500);
    let text = await bodyText(page);

    for (const key of ['1', '2', '3', '4', '5', '6', '7', '8', '9']) {
      await page.keyboard.press(key);
      await page.waitForTimeout(250);
      text += '\n' + (await bodyText(page));
    }

    // Overlay (opened from the home page): module 6 = systems lab with one diagram per project
    await page.goto('?view=os');
    await expect(page.locator('.os-container.overlay')).toBeVisible({ timeout: 15000 });
    await page.keyboard.press('6');
    await page.waitForTimeout(300);
    for (const tab of ['Crowd Analytics', 'Poultry AI', 'Facial Attendance', 'On-Device AI', 'EdgeDesk']) {
      await page.locator(`.os-container.overlay button:has-text("${tab}")`).first().click();
      await page.waitForTimeout(250);
      text += '\n' + (await page.locator('.os-container.overlay').innerText());
    }

    assertClean(text, 'OS modules');
  });

  test('HUD and on-monitor workstation screens', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('');
    await page.waitForSelector('.scroll-track', { state: 'attached', timeout: 45000 });

    let text = await page.locator('.hud-overlay').innerText();

    const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    await page.evaluate((y) => window.scrollTo(0, y), maxScroll);
    await page.waitForTimeout(2000);

    const quad = page.locator('.film-screen-quad-container');
    await expect(quad).toBeVisible({ timeout: 15000 });
    text += '\n' + (await quad.innerText());

    // Left monitor is a terminal: every command answers from the content, so run them all.
    const term = page.locator('.workstation-left-screen input[aria-label="Terminal input"]');
    for (const cmd of ['help', 'whoami', 'neofetch', 'about', 'projects', 'open 1', 'skills', 'experience', 'achievements', 'contact', 'cv', 'ls', 'sudo hire nishant', 'nonsense']) {
      await term.fill(cmd);
      await term.press('Enter');
      await page.waitForTimeout(60);
    }
    text += '\n' + (await page.locator('.workstation-left-screen').innerText());
    for (const tab of ['EXPERIENCE', 'HONORS']) {
      await page.locator(`.workstation-right-screen button:has-text("${tab}")`).first().click();
      text += '\n' + (await page.locator('.workstation-right-screen').innerText());
    }
    for (const tab of ['projects', 'architecture', 'contact']) {
      await page.locator(`.workstation-center-screen button:has-text("${tab}")`).first().click();
      text += '\n' + (await page.locator('.workstation-center-screen').innerText());
    }
    for (const n of ['1', '2', '3', '4', '5']) {
      await page.locator(`button:has-text("[${n}] ")`).first().click();
      await page.waitForTimeout(150);
      text += '\n' + (await page.locator('.workstation-center-screen').innerText());
    }

    assertClean(text, 'home HUD + workstation screens');
  });
});
