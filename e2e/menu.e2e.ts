import { expect, test } from '@playwright/test';

test.describe('mobile menu', () => {
  test.beforeEach(async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile', 'menu button is mobile-only');
    await page.goto('/');
  });

  test('opens, traps focus, locks scroll, closes on Escape', async ({
    page,
  }) => {
    const button = page.getByRole('button', { name: 'Menu' });
    await button.click();
    const dialog = page.getByRole('dialog', { name: 'Menu' });
    await expect(dialog).toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe(
      'hidden',
    );

    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      expect(
        await dialog.evaluate((d) => d.contains(document.activeElement)),
      ).toBe(true);
    }

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(button).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
      'hidden',
    );
  });
});
