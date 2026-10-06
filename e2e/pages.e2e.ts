import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('top nav reaches About and Projects, detail page links docs', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'desktop', 'primary nav is hidden on mobile');
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  await nav.getByRole('link', { name: 'About' }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'About' }),
  ).toBeVisible();
  await nav.getByRole('link', { name: 'Projects' }).click();
  await page.getByRole('link', { name: 'kinetix', exact: true }).click();
  await expect(page).toHaveURL(/\/projects\/kinetix$/);
  await page
    .getByRole('main')
    .getByRole('link', { name: 'Docs', exact: true })
    .click();
  await expect(page).toHaveURL(/\/docs\/kinetix\/overview$/);
});

for (const path of ['/', '/about', '/projects', '/projects/merro']) {
  test(`axe: ${path}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(violations).toEqual([]);
  });
}

test('side pager jumps between pages and tracks the current one', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'desktop', 'pager is hidden on mobile');
  await page.goto('/');
  const pager = page.getByRole('navigation', { name: 'Sections' });
  await expect(pager.getByRole('link', { name: 'Intro' })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await pager.getByRole('link', { name: 'Merro' }).click();
  await expect(pager.getByRole('link', { name: 'Merro' })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await expect(
    page.getByRole('heading', { name: 'Backlog to merged PR.' }),
  ).toHaveCSS('opacity', '1');
});

test('the pages turn: the outgoing page fades and tilts mid-scroll', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'desktop', 'stage is desktop-only');
  await page.goto('/');
  const h = await page.evaluate(() => window.innerHeight);
  await page.evaluate((h) => window.scrollTo(0, h * 0.5), h);
  const intro = page.locator('#intro');
  await expect
    .poll(async () =>
      Number(await intro.evaluate((e) => getComputedStyle(e).opacity)),
    )
    .toBeLessThan(0.6);
  expect(await intro.evaluate((e) => getComputedStyle(e).transform)).not.toBe(
    'none',
  );
});
