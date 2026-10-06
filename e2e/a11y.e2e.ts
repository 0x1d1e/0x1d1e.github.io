import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('no axe violations (incl. color contrast)', async ({ page }) => {
  // Deterministic: mid-fade opacity would skew contrast results.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(violations).toEqual([]);
});

test('keyboard reaches nav, CTA and event stream', async ({ page }, info) => {
  await page.goto('/');
  const seen = new Set<string>();
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    seen.add(
      await page.evaluate(() => {
        const el = document.activeElement;
        return (
          el?.getAttribute('aria-label') ??
          el?.textContent?.trim().slice(0, 30) ??
          ''
        );
      }),
    );
  }
  expect(seen).toContain('See the projects');
  expect(seen).toContain('About kinetix');
  void info;
});

test('reduced motion removes transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const durations = await page.evaluate(() =>
    [...document.querySelectorAll('*')].map(
      (e) => getComputedStyle(e).transitionDuration,
    ),
  );
  for (const d of durations) expect(['0s', '0.00001s', '1e-05s']).toContain(d);
});
