import { expect, test } from '@playwright/test';

// Automated browsers skip the intro unless the URL asks for it.
test('the intro video plays on load, on refresh too; skipping reveals the site', async ({
  page,
}) => {
  await page.goto('/?intro');
  const intro = page.getByRole('dialog', { name: 'Intro' });
  await expect(intro).toBeVisible();
  await expect(intro.locator('video')).toHaveAttribute('src', /intro\.mp4$/);
  await page.getByRole('button', { name: 'Skip intro' }).click();
  await expect(intro).toHaveCount(0);
  await expect(
    page.getByRole('heading', { level: 1, name: '0x1d1e' }),
  ).toBeVisible();

  await page.reload();
  await expect(page.getByRole('dialog', { name: 'Intro' })).toBeVisible();
});

test('deep links skip the intro', async ({ page }) => {
  await page.goto('/about?intro');
  await expect(page.getByRole('dialog', { name: 'Intro' })).toHaveCount(0);
});

test('without ?intro, automation goes straight to the site', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('dialog', { name: 'Intro' })).toHaveCount(0);
});
