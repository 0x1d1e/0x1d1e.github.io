import { test } from '@playwright/test';

// Pixel baselines differ across OS font rendering, so these are captured as CI
// artifacts for human review rather than diffed against committed images.
test('full-page screenshot', async ({ page }, info) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: info.outputPath(`${info.project.name}.png`),
    fullPage: true,
  });
});
