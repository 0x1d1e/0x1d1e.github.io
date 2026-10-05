import { expect, test } from '@playwright/test';

test('renders every section', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { level: 1, name: '0x1d1e' }),
  ).toBeVisible();
  for (const name of ['Projects', 'Event stream', 'Regression'])
    await expect(page.getByRole('heading', { name })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Footer' })).toBeVisible();
});

test('no horizontal overflow', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test('event stream row takes focus state', async ({ page }) => {
  await page.goto('/');
  const row = page.getByRole('row', { name: /install/ });
  await row.click();
  await expect(row).toHaveAttribute('data-active', 'true');
});
