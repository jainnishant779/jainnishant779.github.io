import { test, expect } from '@playwright/test';

test.describe('CV Download and Open Verification', () => {
  test('CV link is present with target=_blank and triggers download event', async ({ page }) => {
    await page.goto('cv');

    const openLink = page.locator('a:has-text("OPEN IN NEW TAB")');
    await expect(openLink).toBeVisible();
    await expect(openLink).toHaveAttribute('target', '_blank');
    await expect(openLink).toHaveAttribute('href', /.*Nishant_Jain_CV\.pdf$/);

    const downloadLink = page.locator('a:has-text("DOWNLOAD PDF")');
    await expect(downloadLink).toBeVisible();
    await expect(downloadLink).toHaveAttribute('download', 'Nishant_Jain_CV.pdf');

    // Trigger download and verify filename ends in .pdf
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      downloadLink.click(),
    ]);
    expect(download.suggestedFilename().endsWith('.pdf')).toBeTruthy();
  });

  test('Direct PDF file request returns 200 and valid file buffer', async ({ request }) => {
    const response = await request.get('cv/Nishant_Jain_CV.pdf');
    expect(response.status()).toBe(200);
    const body = await response.body();
    // PDF magic bytes %PDF
    expect(body.slice(0, 4).toString()).toBe('%PDF');
  });
});
