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

test('small screens: the hero clears the fixed header', async ({
  page,
}, info) => {
  test.skip(!['mobile', 'small'].includes(info.project.name), 'phones only');
  await page.goto('/');
  await page.waitForTimeout(800);
  const header = await page.locator('header').boundingBox();
  const title = await page.getByRole('heading', { level: 1 }).boundingBox();
  const canvas = await page.locator('#intro h1 canvas').boundingBox();
  const top = (canvas ?? title)!.y;
  expect(top).toBeGreaterThanOrEqual(header!.y + 40);
});

test('touch targets: the menu button and CTAs are at least 44px tall on phones', async ({
  page,
}, info) => {
  test.skip(!['mobile', 'small'].includes(info.project.name), 'phones only');
  await page.goto('/');
  const menu = await page.getByRole('button', { name: 'Menu' }).boundingBox();
  expect(menu!.height).toBeGreaterThanOrEqual(44);
  for (const name of ['See the projects', 'Browse projects']) {
    const box = await page.getByRole('link', { name }).boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});

test('touch: the wordmark scatters under a finger and settles after release', async ({
  page,
  context,
}, info) => {
  test.skip(
    !['mobile', 'small'].includes(info.project.name),
    'touch devices only',
  );
  await page.goto('/');
  await page.waitForTimeout(2500); // let the particles assemble
  const box = (await page.locator('#intro h1 canvas').boundingBox())!;
  // Displaced particles are drawn in the accent colour.
  const accent = () =>
    page.evaluate(() => {
      const c = document.querySelector<HTMLCanvasElement>('#intro h1 canvas')!;
      const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
      let n = 0;
      for (let i = 0; i < d.length; i += 4)
        if (
          d[i + 3]! > 200 &&
          d[i]! < 140 &&
          d[i + 1]! > 120 &&
          d[i + 2]! > 200
        )
          n++;
      return n;
    });
  const cdp = await context.newCDPSession(page);
  const x = box.x + box.width * 0.3;
  const y = box.y + box.height * 0.5;
  expect(await accent()).toBe(0);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y }],
  });
  for (let i = 1; i <= 5; i++) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: x + i * 6, y }],
    });
    await page.waitForTimeout(40);
  }
  await expect.poll(accent).toBeGreaterThan(100);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
  await expect.poll(accent, { timeout: 5000 }).toBe(0);
});
