import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('docs: navigate from the landing page, deep link survives reload', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByRole('navigation', { name: 'Footer' })
    .getByRole('link', { name: 'Docs' })
    .click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Docs' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'merro', exact: true }).click();
  await expect(page).toHaveURL(/\/docs\/merro\/overview$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Overview' }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Overview' }),
  ).toBeVisible();
});

test('docs: search finds pages across projects', async ({ page }) => {
  await page.goto('/docs/kinetix/overview');
  await page
    .getByRole('searchbox', { name: 'Search docs' })
    .fill('worker protocol');
  await page.getByRole('link', { name: /Worker protocol/ }).click();
  await expect(page).toHaveURL(/\/docs\/merro\/worker-protocol$/);
});

test('docs: no axe violations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/docs/merro/overview');
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(violations).toEqual([]);
});

test('docs: no horizontal overflow on a long page', async ({ page }) => {
  await page.goto('/docs/kinetix/overview');
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test('unknown route shows not found', async ({ page }) => {
  await page.goto('/nope');
  await expect(page.getByRole('heading', { name: 'Not found' })).toBeVisible();
});
