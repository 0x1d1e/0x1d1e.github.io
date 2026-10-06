import { expect, test } from '@playwright/test';

test('renders every section', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { level: 1, name: '0x1d1e' }),
  ).toBeVisible();
  // Pages overlap on the desktop stage, so check presence rather than visibility.
  for (const name of [
    'Tools for the problems in front of us.',
    'Train it. Measure it. Ship it.',
    'How we work',
  ])
    await expect(page.getByRole('heading', { name })).toBeAttached();
  await expect(page.getByRole('navigation', { name: 'Footer' })).toBeAttached();
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

test('favicon is declared and served', async ({ page, request }) => {
  await page.goto('/');
  for (const sel of [
    'link[rel="icon"][type="image/svg+xml"]',
    'link[rel="apple-touch-icon"]',
  ]) {
    const href = await page.locator(sel).getAttribute('href');
    expect(href).toBeTruthy();
    const res = await request.get(new URL(href!, page.url()).toString());
    expect(res.ok()).toBe(true);
  }
});
