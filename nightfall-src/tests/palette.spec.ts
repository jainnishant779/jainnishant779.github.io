import { test, expect } from '@playwright/test';

test.describe('NJ-OS command palette', () => {
  test('Ctrl+K opens it, filters, navigates to a project and Esc closes only the palette', async ({ page }) => {
    await page.goto('os');
    await expect(page.locator('.os-container')).toBeVisible();

    await page.keyboard.press('Control+k');
    const input = page.getByPlaceholder('Search modules, projects, actions…');
    await expect(input).toBeVisible();

    await input.fill('edgedesk');
    await page.getByRole('option', { name: /EdgeDesk/ }).first().click();
    await expect(page).toHaveURL(/\/projects\/edgedesk/);
    await expect(input).toBeHidden();

    // Esc inside the palette must not also close the OS (overlay) or leave the project
    await page.keyboard.press('Control+k');
    await expect(input).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(input).toBeHidden();
    await expect(page.locator('.os-container')).toBeVisible();

    // The top-bar button opens it too, and digits typed into the search do not switch modules
    await page.getByRole('button', { name: 'Open command palette' }).click();
    await input.fill('2');
    await expect(input).toHaveValue('2');
    await page.keyboard.press('Escape');
  });

  test('Systems Lab has its own URL (no more /skills detour) and survives a refresh', async ({ page }) => {
    await page.goto('os');
    await page.locator('.os-nav-btn:has-text("SYSTEMS LAB")').click();
    await expect(page).toHaveURL(/\/architecture$/);
    await page.reload();
    await expect(page.locator('.os-container')).toContainText(/SYSTEMS|ARCHITECTURE/i);
  });
});
