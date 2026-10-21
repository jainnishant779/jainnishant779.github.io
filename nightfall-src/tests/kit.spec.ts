import { test, expect } from '@playwright/test';

// Living style guide at /kit — covers the shared kit (src/components/kit) and adapted vendor components (src/components/ui).
test.describe('Nightfall kit (/kit)', () => {
  test('renders every component with no page or console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(`console: ${m.text()}`);
    });

    await page.goto('kit');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Nightfall UI kit');

    for (const id of ['kit-surfaces', 'kit-buttons', 'kit-text', 'kit-cards', 'kit-beam', 'kit-tabs', 'kit-timeline']) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
    await expect(page.getByTestId('kit-panel')).toBeVisible();
    await expect(page.getByTestId('kit-tabs')).toBeVisible();

    // content comes from src/content (spot-check a timeline entry and a project badge)
    await expect(page.locator('body')).toContainText('Founding Engineer');
    await expect(page.locator('body')).toContainText('Patent Application Filed — Not Granted');

    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('DynamicIsland morphs between states', async ({ page }) => {
    await page.goto('kit');
    // During a morph the outgoing and incoming content briefly coexist, so always read the newest one.
    const text = page.getByTestId('kit-island-text').last();
    await expect(text).toHaveText('Scroll to enter ↓');
    await page.getByTestId('kit-island-next').click();
    await expect(text).toHaveText('Gate · 12%');
    await page.getByTestId('kit-island-next').click();
    await expect(text).toHaveText('Access system ⏎');
    await expect(page.getByTestId('kit-island-text')).toHaveCount(1); // exit animation finished
  });

  test('Tabs switch panels', async ({ page }) => {
    await page.goto('kit');
    await page.getByRole('tab', { name: 'Architecture' }).click();
    await expect(page.getByText('Simplified diagram built from the project description.')).toBeVisible();
  });

  test('Ctrl+K opens the command palette, filters, and Escape closes it', async ({ page }) => {
    await page.goto('kit');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible(); // lazy chunk loaded, key listener attached
    await page.keyboard.press('Control+k');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.getByPlaceholder('Search projects and links…').fill('EdgeDesk');
    await expect(dialog.getByText('EdgeDesk: Secure Multi-Device Remote Access Platform')).toBeVisible();
    await expect(dialog.getByText('AI-Powered Poultry Health Monitoring')).toHaveCount(0);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('Tooltip shows on keyboard focus', async ({ page }) => {
    await page.goto('kit');
    await page.getByTestId('kit-tooltip-trigger').focus();
    await expect(page.getByRole('tooltip').first()).toContainText('Open the command palette');
  });

  test('reduced motion: WordRotate stays put and BorderBeam is not rendered', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('kit');
    const rotate = page.getByTestId('kit-word-rotate');
    const first = (await rotate.innerText()).trim();
    await page.waitForTimeout(3200); // longer than WordRotate's 2500 ms interval
    expect((await rotate.innerText()).trim()).toBe(first);
    await expect(page.getByTestId('kit-border-beam-card').locator('div')).toHaveCount(0);
  });

  test('animations run when motion is allowed (WordRotate cycles, BorderBeam renders)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('kit');
    const rotate = page.getByTestId('kit-word-rotate');
    const first = (await rotate.innerText()).trim();
    await expect.poll(async () => (await rotate.innerText()).trim(), { timeout: 8000 }).not.toBe(first);
    expect(await page.getByTestId('kit-border-beam-card').locator('div').count()).toBeGreaterThan(0);
  });

  test('no horizontal overflow at 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('kit');
    await page.waitForTimeout(500);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow).toBe(false);
  });
});
