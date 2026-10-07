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

test('link previews: every address is served with its own tags and a preview image', async ({
  request,
}) => {
  const html = async (path: string) => (await request.get(path)).text();
  const tag = (h: string, key: string) =>
    new RegExp(`<meta[^>]*${key}[^>]*content="([^"]*)"`).exec(h)?.[1];

  const home = await html('/');
  expect(tag(home, 'property="og:title"')).toBe(
    '0x1d1e: software made during idle cycles',
  );
  expect(tag(home, 'property="og:image"')).toMatch(/^https:\/\/.+\/og\.png$/);
  expect(tag(home, 'name="twitter:card"')).toBe('summary_large_image');
  expect(home).not.toContain('%SITE_URL%');

  // (`vite preview` finds a page's own file at its directory address; real hosts do at both.)
  const project = await html('/projects/kinetix/');
  expect(project).toContain('<title>kinetix · 0x1d1e</title>');
  expect(tag(project, 'property="og:description"')).toMatch(/LLM traffic/);
  expect(project).toMatch(
    /rel="canonical" href="https:\/\/[^"]+\/projects\/kinetix"/,
  );

  const doc = await html('/docs/merro/lifecycle/');
  expect(doc).toContain('<title>Lifecycle: merro docs · 0x1d1e</title>');

  // the card's image exists and is the size the tags promise
  const img = await request.get('/og.png');
  expect(img.ok()).toBe(true);
  expect(img.headers()['content-type']).toBe('image/png');
  const png = await img.body();
  expect(png.readUInt32BE(16)).toBe(1200);
  expect(png.readUInt32BE(20)).toBe(630);

  const sitemap = await html('/sitemap.xml');
  expect(sitemap).toContain('/projects/kinetix</loc>');
  expect((await request.get('/robots.txt')).ok()).toBe(true);
});
