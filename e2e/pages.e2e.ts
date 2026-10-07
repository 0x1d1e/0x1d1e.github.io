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

// The hero's transition is longer (Home.tsx `span`): this many viewports of scroll.
const HERO_SPAN = 3.4;

test('the stage dissolves: mid-scroll the pixel canvas is drawn and the old page is still on stage', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'desktop', 'stage is desktop-only');
  await page.goto('/');
  const h = await page.evaluate(() => window.innerHeight);
  await page.evaluate((y) => window.scrollTo(0, y), h * 0.5 * HERO_SPAN);
  const painted = () =>
    page.locator('#intro').evaluate(() => {
      const c = document.querySelector<HTMLCanvasElement>(
        '[data-page] ~ canvas',
      );
      const d = c?.getContext('2d')?.getImageData(0, 0, c.width, c.height).data;
      return !!d && d.some((v, i) => i % 4 === 3 && v > 0);
    });
  await expect.poll(painted).toBe(true);
  // Past the midpoint the next page is the one on stage.
  await page.evaluate((y) => window.scrollTo(0, y), h * 0.8 * HERO_SPAN);
  await expect(page.locator('#intro')).toHaveCSS('opacity', '0');
  await expect(page.locator('#build')).toHaveCSS('opacity', '1');
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
    page.evaluate(([y]) => window.scrollTo(0, y!), [h * frac * HERO_SPAN]);
  const opacity = () =>
    page.locator('#intro').evaluate((e) => getComputedStyle(e).opacity);

  // At rest the shell is already there, idle in the first directory.
  await expect.poll(text).toContain('~/intro $');

  // Typing: part of the command, page not dissolved yet.
  await at(0.35);
  await expect.poll(text).toMatch(/~\/intro \$ cd /);
  await expect.poll(text).not.toContain('what-we-build');
  expect(Number(await opacity())).toBeGreaterThan(0.5);

  // Fully typed, dissolve under way, still in the old directory.
  await at(0.5);
  await expect.poll(text).toContain('~/intro $ cd ./what-we-build');

  // Done: new directory, empty command line.
  await at(0.68);
  await expect.poll(text).toContain('~/build $');
  expect(await text()).not.toContain('cd ./');

  // Scrolling back returns to the old directory and un-types.
  await at(0.35);
  await expect.poll(text).toMatch(/~\/intro \$ cd /);
  await expect.poll(text).not.toContain('what-we-build');
});

// "What we build" is left by the agent eating the page: it takes this many viewports of scroll.
const BUILD_SPAN = 3.2;

test('the agent eats the build page: its illustration agent is replaced and the page is cut away from the right', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'desktop', 'stage is desktop-only');
  await page.goto('/');
  const h = await page.evaluate(() => window.innerHeight);
  const at = (w: number) => {
    const pos = 0.2 + 0.6 * (0.4 + 0.6 * w);
    return h * (HERO_SPAN + pos * BUILD_SPAN);
  };
  const agent = page.locator('#build [data-agent]');
  await page.evaluate((y) => window.scrollTo(0, y), h * HERO_SPAN + 5);
  await expect(agent).toHaveCSS('visibility', 'visible');
  await expect(page.locator('#build')).toHaveCSS('clip-path', 'none');

  // Mid-meal: the little agent is hidden (a big one is drawn), the page is cut from the right.
  await page.evaluate((y) => window.scrollTo(0, y), at(0.5));
  await expect(agent).toHaveCSS('visibility', 'hidden');
  await expect
    .poll(() =>
      page.locator('#build').evaluate((e) => getComputedStyle(e).clipPath),
    )
    .toMatch(/^inset\(0(px)? \d+(\.\d+)?px 0(px)? 0(px)?\)$/);

  // After: the next page is there, and scrolling back gives the agent back.
  await page.evaluate((y) => window.scrollTo(0, y), at(1));
  await expect(page.locator('#research')).toHaveCSS('opacity', '1');
  await page.evaluate((y) => window.scrollTo(0, y), h * HERO_SPAN + 5);
  await expect(agent).toHaveCSS('visibility', 'visible');
});

// Scroll lengths (viewports) of the transitions in Home.tsx, in order: hero, build, research, principles.
const SPANS = [HERO_SPAN, BUILD_SPAN, 3, 3];

test('the AI-research page leaves as tokens and "How we work" as an eval wall; each lands on its next page', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'desktop', 'stage is desktop-only');
  await page.goto('/');
  const h = await page.evaluate(() => window.innerHeight);
  const at = (seg: number, w: number) => {
    const start = SPANS.slice(0, seg).reduce((a, b) => a + b, 0);
    return h * (start + (0.2 + 0.6 * (0.4 + 0.6 * w)) * SPANS[seg]!);
  };
  const painted = () =>
    page.evaluate(() => {
      const c = document.querySelector<HTMLCanvasElement>(
        '[data-page] ~ canvas',
      );
      const d = c?.getContext('2d')?.getImageData(0, 0, c.width, c.height).data;
      return !!d && d.some((v, i) => i % 4 === 3 && v > 0);
    });
  const go = (y: number) => page.evaluate((v) => window.scrollTo(0, v), y);

  // research → principles: tokens. The old words are gone at once, the new page arrives last.
  await go(at(2, 0.5));
  await expect.poll(painted).toBe(true);
  await expect(page.locator('#research')).toHaveCSS('opacity', '0');
  await expect(page.locator('#principles')).toHaveCSS('opacity', '0');
  await go(at(2, 1));
  await expect(page.locator('#principles')).toHaveCSS('opacity', '1');

  // principles → join in: eval wall. The page stays under the wall, then the next one is shown.
  await go(at(3, 0.3));
  await expect.poll(painted).toBe(true);
  // still there under the wall (dimmed a little while its command types)
  await expect
    .poll(async () =>
      Number(
        await page
          .locator('#principles')
          .evaluate((e) => getComputedStyle(e).opacity),
      ),
    )
    .toBeGreaterThan(0.5);
  await go(at(3, 1));
  await expect(page.locator('#next')).toHaveCSS('opacity', '1');
  await expect(page.locator('#principles')).toHaveCSS('opacity', '0');
});

test('the home page never restores a scroll position, so a refresh starts at the first page', async ({
  page,
}) => {
  const mode = () => page.evaluate(() => history.scrollRestoration);
  await page.goto('/');
  expect(await mode()).toBe('manual');
  await page.evaluate(() => window.scrollTo(0, 3000));
  await page.reload();
  expect(await mode()).toBe('manual');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  // other pages keep the browser's own behaviour
  await page.goto('/about');
  expect(await mode()).toBe('auto');
  // and leaving the home page by a link gives it back
  await page.goto('/');
  await page.evaluate(() => {
    history.pushState({}, '', '/about');
    dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect.poll(mode).toBe('auto');
});
