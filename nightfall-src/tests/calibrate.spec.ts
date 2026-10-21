import { test, expect } from '@playwright/test';

test.describe('Monitor calibration (/calibrate) and screens.json', () => {
  test('12 clicks produce screens.json with the clicked native coordinates', async ({ page }) => {
    // Tall viewport so the whole frame is on screen (mouse clicks outside the viewport are ignored).
    await page.setViewportSize({ width: 1400, height: 1300 });
    await page.route('**/film/screens.json', (route) => route.fulfill({ status: 404, body: '' }));
    await page.goto('calibrate');
    const stage = page.getByTestId('cal-stage');
    await expect(stage.locator('img')).toBeVisible();
    await expect(page.getByTestId('cal-prompt')).toContainText('left monitor — top-left');

    const box = (await stage.boundingBox())!;
    // fractions of the frame for each corner: left, centre, right monitor (TL, TR, BR, BL)
    const fractions: [number, number][] = [
      [0.05, 0.5], [0.3, 0.5], [0.3, 0.8], [0.05, 0.8],
      [0.33, 0.35], [0.67, 0.35], [0.67, 0.83], [0.33, 0.83],
      [0.7, 0.5], [0.95, 0.5], [0.95, 0.8], [0.7, 0.8],
    ];
    for (const [fx, fy] of fractions) {
      await page.mouse.click(box.x + box.width * fx, box.y + box.height * fy);
    }

    const json = JSON.parse(await page.getByTestId('cal-json').innerText());
    const [w, h] = [1600, 900];
    const expected = {
      left: fractions.slice(0, 4),
      center: fractions.slice(4, 8),
      right: fractions.slice(8, 12),
    };
    for (const key of ['left', 'center', 'right'] as const) {
      expect(json[key]).toHaveLength(4);
      json[key].forEach((p: [number, number], i: number) => {
        expect(Math.abs(p[0] - expected[key][i][0] * w)).toBeLessThanOrEqual(3);
        expect(Math.abs(p[1] - expected[key][i][1] * h)).toBeLessThanOrEqual(3);
      });
    }

    await page.getByTestId('cal-reset').click();
    await expect(page.getByTestId('cal-prompt')).toContainText('left monitor — top-left');
  });

  test('a screens.json on the server moves the live OS panels onto the calibrated monitors', async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 }); // same size as the film frames: no cover-fit offset
    await page.route('**/film/screens.json', (route) =>
      route.fulfill({
        json: {
          left: [[40, 480], [420, 480], [420, 760], [40, 760]],
          center: [[400, 200], [1200, 200], [1200, 700], [400, 700]],
          right: [[1180, 480], [1560, 480], [1560, 760], [1180, 760]],
        },
      }),
    );
    await page.goto('');
    await page.waitForSelector('canvas.film-canvas');
    await page.waitForTimeout(2500);
    const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    await page.evaluate((y) => window.scrollTo(0, y), max);
    await page.waitForTimeout(2000);

    const rect = await page.locator('.workstation-center-screen').evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    });
    expect(Math.abs(rect.x - 400)).toBeLessThanOrEqual(4);
    expect(Math.abs(rect.y - 200)).toBeLessThanOrEqual(4);
    expect(Math.abs(rect.w - 800)).toBeLessThanOrEqual(6);
    expect(Math.abs(rect.h - 500)).toBeLessThanOrEqual(6);
  });
});
