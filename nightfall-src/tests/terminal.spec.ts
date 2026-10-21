import { test, expect } from '@playwright/test';

test.describe('On-monitor terminal', () => {
  test('answers from content, completes with Tab and drives the centre screen', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('');
    await page.waitForSelector('.scroll-track', { state: 'attached', timeout: 45000 });
    const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    await page.evaluate((y) => window.scrollTo(0, y), max);

    const left = page.locator('.workstation-left-screen');
    const input = left.locator('input[aria-label="Terminal input"]');
    await expect(input).toBeVisible({ timeout: 20000 });

    // The typed intro runs by itself
    await expect(left).toContainText('Nishant Jain', { timeout: 10000 });

    await input.fill('whoami');
    await input.press('Enter');
    await expect(left).toContainText('Indore');

    // Tab completion
    await input.fill('exper');
    await input.press('Tab');
    await expect(input).toHaveValue('experience ');

    // An unknown command says so instead of failing silently
    await input.fill('definitely-not-a-command');
    await input.press('Enter');
    await expect(left).toContainText('command not found');

    // `open 2` loads that project's dossier on the centre monitor (numbers match the desk strip)
    await input.fill('open 2');
    await input.press('Enter');
    await expect(page.locator('text=COMMAND WORKSTATION INTEL DOSSIER')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.workstation-center-screen')).toContainText('EdgeDesk');

    // Typing digits in the terminal must not trigger the global 1-5 shortcuts
    await input.fill('');
    await input.press('3');
    await expect(page.locator('.workstation-center-screen')).toContainText('EdgeDesk');
  });
});
