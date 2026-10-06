import { expect, test } from '@playwright/test';

const routes = [
  '/',
  '/about',
  '/projects',
  '/projects/kinetix',
  '/docs',
  '/docs/merro/overview',
];

for (const path of routes) {
  test(`no horizontal overflow: ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForTimeout(500);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('mobile docs: the page tree sits behind a toggle', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'mobile', 'tree is always open on desktop');
  await page.goto('/docs/merro/overview');
  const toggle = page.getByRole('button', { name: /Browse pages/ });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(
    page
      .getByRole('navigation', { name: 'Docs pages' })
      .getByRole('link', { name: 'Lifecycle' }),
  ).toBeHidden();
  await toggle.click();
  await expect(
    page
      .getByRole('navigation', { name: 'Docs pages' })
      .getByRole('link', { name: 'Lifecycle' }),
  ).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Docs pages' })
    .getByRole('link', { name: 'Lifecycle' })
    .click();
  await expect(page).toHaveURL(/\/docs\/merro\/lifecycle$/);
  await expect(
    page.getByRole('button', { name: /Browse pages/ }),
  ).toHaveAttribute('aria-expanded', 'false');
});

test('desktop docs: the page tree is always visible, no toggle', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'desktop', 'mobile has the toggle');
  await page.goto('/docs/merro/overview');
  await expect(
    page
      .getByRole('navigation', { name: 'Docs pages' })
      .getByRole('link', { name: 'Lifecycle' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: /Browse pages/ })).toBeHidden();
});

test('mobile: home is a normal column with the menu button', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'mobile', 'mobile only');
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Sections' })).toBeHidden();
  await expect(page.locator('[data-page]')).toHaveCount(5);
});
