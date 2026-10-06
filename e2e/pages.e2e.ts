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
  await pager.getByRole('link', { name: 'What we build' }).click();
  await expect(
    pager.getByRole('link', { name: 'What we build' }),
  ).toHaveAttribute('aria-current', 'true');
  await expect(
    page.getByRole('heading', {
      name: 'Tools for the problems in front of us.',
    }),
  ).toHaveCSS('opacity', '1');
});

test('the stage scans: mid-scroll the outgoing page is partly clipped and a scan line shows', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'desktop', 'stage is desktop-only');
  await page.goto('/');
  const h = await page.evaluate(() => window.innerHeight);
  await page.evaluate((h) => window.scrollTo(0, h * 0.5), h);
  const intro = page.locator('#intro');
  await expect
    .poll(async () => intro.evaluate((e) => getComputedStyle(e).clipPath))
    .toMatch(/inset\((?!0px 0px 0px 0px)/);
});

test('project pages show their illustration', async ({ page }) => {
  await page.goto('/projects/kinetix');
  await expect(page.getByRole('img', { name: /gateway/ })).toBeVisible();
});

test('projects filter by topic', async ({ page }) => {
  await page.goto('/projects?topic=desktop');
  await expect(
    page.getByRole('link', { name: 'kanade', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'merro', exact: true }),
  ).toHaveCount(0);
});

// The browser normalises inset(0 0 0 0) to inset(0px).
const UNWIPED = /^inset\(0(px)?( 0(px)?){0,3}\)$/;

test('the shell line types the next command, runs it, then shows the new directory', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'desktop', 'stage is desktop-only');
  await page.goto('/');
  const h = await page.evaluate(() => window.innerHeight);
  const shell = page.getByTestId('stage-prompt');
  const text = async () =>
    ((await shell.textContent()) ?? '').replace(/\s+/g, ' ');
  const at = (frac: number) =>
    page.evaluate(([y]) => window.scrollTo(0, y!), [h * frac]);
  const clip = () =>
    page.locator('#intro').evaluate((e) => getComputedStyle(e).clipPath);

  // At rest the shell is already there, idle in the first directory.
  await expect.poll(text).toContain('~/intro $');

  // Typing: part of the command, page not wiped yet.
  await at(0.35);
  await expect.poll(text).toMatch(/~\/intro \$ cd /);
  await expect.poll(text).not.toContain('what-we-build');
  expect(await clip()).toMatch(UNWIPED);

  // Fully typed, wipe under way, still in the old directory.
  await at(0.5);
  await expect.poll(text).toContain('~/intro $ cd ./what-we-build');
  await expect.poll(clip).not.toMatch(UNWIPED);

  // Done: new directory, empty command line.
  await at(0.68);
  await expect.poll(text).toContain('~/build $');
  expect(await text()).not.toContain('cd ./');

  // Scrolling back returns to the old directory and un-types.
  await at(0.35);
  await expect.poll(text).toMatch(/~\/intro \$ cd /);
  await expect.poll(text).not.toContain('what-we-build');
});
