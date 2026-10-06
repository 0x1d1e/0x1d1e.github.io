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

test('docs: the Kanade concept video is self-hosted and playable', async ({
  page,
  request,
}) => {
  await page.goto('/docs/kanade/overview');
  const video = page.locator('video');
  await expect(video).toHaveAttribute('controls', '');
  const src = await video.locator('source').getAttribute('src');
  const poster = await video.getAttribute('poster');
  for (const url of [src!, poster!]) {
    const res = await request.get(new URL(url, page.url()).toString());
    expect(res.ok()).toBe(true);
  }
  expect(
    (await request.get(new URL(src!, page.url()).toString())).headers()[
      'content-type'
    ],
  ).toContain('video/mp4');
  // It decodes and starts (muted so the browser allows playback).
  const played = await video.evaluate(async (v: HTMLVideoElement) => {
    v.muted = true;
    await v.play();
    await new Promise((r) => setTimeout(r, 600));
    return v.currentTime > 0;
  });
  expect(played).toBe(true);
});

test('docs: the video page has no axe violations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/docs/kanade/overview');
  await page.locator('video').waitFor();
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(violations).toEqual([]);
});
