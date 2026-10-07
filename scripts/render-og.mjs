// Renders public/og.png (1200x630), the image that link previews show: the pixel
// wordmark, the agent bot standing on a terminal card, like the hero.
// Run with `pnpm og` after changing the brand. Colours come from theme.css, the
// bot from the Agent component's sprite, fonts from node_modules.
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const theme = readFileSync('src/styles/theme.css', 'utf8');
const color = (name) => {
  const m = new RegExp(`--color-${name}:\\s*([^;]+);`).exec(theme);
  if (!m) throw new Error(`theme.css has no --color-${name}`);
  return m[1].trim();
};
const sprite = [
  ...readFileSync('src/components/Agent/Agent.tsx', 'utf8').matchAll(
    /'([.xe]{10})'/g,
  ),
]
  .slice(0, 10)
  .map((m) => m[1]);
if (sprite.length !== 10) throw new Error('could not read the worker sprite');

// Fonts go into the page as data URLs: a page set from a string cannot load file:// URLs.
const woff2 = (pkg, file) =>
  `data:font/woff2;base64,${readFileSync(`node_modules/@fontsource-variable/${pkg}/files/${file}`).toString('base64')}`;

const colors = Object.fromEntries(
  ['bg', 'card', 'chip', 'text', 'text-soft', 'muted', 'accent', 'success'].map(
    (n) => [n, color(n)],
  ),
);
const ring = color('ring');

const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Inter;font-weight:100 900;src:url(${woff2('inter', 'inter-latin-opsz-normal.woff2')})}
@font-face{font-family:Mono;font-weight:100 900;src:url(${woff2('geist-mono', 'geist-mono-latin-wght-normal.woff2')})}
body{margin:0;background:${colors.bg}}</style><canvas id="c" width="1200" height="630"></canvas>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.evaluate(
  async ({ c, ring, sprite }) => {
    await Promise.all([
      document.fonts.load('600 100px Inter'),
      document.fonts.load('500 20px Mono'),
    ]);
    const cv = document.getElementById('c');
    const x = cv.getContext('2d');
    x.fillStyle = c.bg;
    x.fillRect(0, 0, 1200, 630);

    // The site's faint drifting specks, fixed.
    let seed = 0x1d1e;
    const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
    for (let i = 0; i < 90; i++) {
      x.globalAlpha = 0.15 + rnd() * 0.25;
      x.fillStyle = rnd() < 0.2 ? c.accent : c.muted;
      const s = 2 + Math.floor(rnd() * 3);
      x.fillRect(Math.floor(rnd() * 1200), Math.floor(rnd() * 630), s, s);
    }
    x.globalAlpha = 1;

    // The wordmark, as pixels, the way the hero draws it.
    const text = '0x1d1e';
    const size = 188;
    const off = document.createElement('canvas');
    off.width = 640;
    off.height = 260;
    const o = off.getContext('2d', { willReadFrequently: true });
    o.font = '600 ' + size + 'px Inter';
    o.fillStyle = c.text;
    o.fillText(text, 0, size * 0.92);
    const d = o.getImageData(0, 0, off.width, off.height).data;
    const step = 6;
    const ox = 70;
    const oy = 150;
    x.fillStyle = c.text;
    for (let y = 0; y < off.height; y += step)
      for (let px = 0; px < off.width; px += step)
        if (d[(y * off.width + px) * 4 + 3] > 128)
          x.fillRect(ox + px, oy + y, step - 1, step - 1);

    x.textBaseline = 'alphabetic';
    x.font = '500 26px Mono';
    x.fillStyle = c.muted;
    x.fillText('software made during idle cycles', 70, 440);

    // Topic chips.
    let cx = 70;
    x.font = '500 17px Mono';
    for (const t of [
      'developer tools',
      'AI and LLM',
      'agents',
      'Linux desktop',
    ]) {
      const w = x.measureText(t).width + 28;
      x.fillStyle = c.chip;
      x.beginPath();
      x.roundRect(cx, 478, w, 34, 17);
      x.fill();
      x.fillStyle = c['text-soft'];
      x.fillText(t, cx + 14, 501);
      cx += w + 10;
    }
    x.font = '500 22px Mono';
    x.fillStyle = c['text-soft'];
    x.fillText('0x1d1e.tech', 70, 580);

    // The bot, standing on the card.
    const cell = 24;
    const bx = 835;
    const by = 52;
    sprite.forEach((row, ry) =>
      [...row].forEach((ch, rx) => {
        if (ch === '.') return;
        x.fillStyle = ch === 'e' ? c.accent : c.text;
        x.fillRect(bx + rx * cell, by + ry * cell, cell, cell);
      }),
    );

    // The terminal card.
    const cardX = 700;
    const cardY = by + 10 * cell;
    x.fillStyle = c.card;
    x.fillRect(cardX, cardY, 440, 300);
    x.strokeStyle = ring;
    x.lineWidth = 2;
    x.strokeRect(cardX + 1, cardY + 1, 438, 298);
    x.font = '500 18px Mono';
    x.fillStyle = c.muted;
    x.fillText('$ agent run', cardX + 70, cardY + 52);
    const mini = 4;
    sprite.forEach((row, ry) =>
      [...row].forEach((ch, rx) => {
        if (ch === '.') return;
        x.fillStyle = ch === 'e' ? c.accent : c.text;
        x.fillRect(cardX + 24 + rx * mini, cardY + 28 + ry * mini, mini, mini);
      }),
    );
    const lines = [
      ['backlog', 'item picked'],
      ['worker', 'sandbox up, branch ready'],
      ['worker', 'change made, tests run'],
      ['review', 'agent review passed'],
    ];
    x.font = '500 17px Mono';
    lines.forEach(([k, v], i) => {
      const y = cardY + 100 + i * 40;
      x.fillStyle = c.success;
      x.fillText('✓', cardX + 28, y);
      x.fillStyle = c.muted;
      x.fillText(k, cardX + 62, y);
      x.fillStyle = c['text-soft'];
      x.fillText(v, cardX + 170, y);
    });
    x.fillStyle = c.accent;
    x.fillText('⠹', cardX + 28, cardY + 100 + 4 * 40);
    x.fillText('merge', cardX + 62, cardY + 100 + 4 * 40);
    x.fillText('working', cardX + 170, cardY + 100 + 4 * 40);
  },
  { c: colors, ring, sprite },
);
await page.locator('#c').screenshot({ path: 'public/og.png', type: 'png' });
await browser.close();
console.log('wrote public/og.png');
