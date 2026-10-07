import { expect, test } from 'vitest';
import {
  EXPLODE,
  LANDED,
  buildScatter,
  placeParticle,
  SCATTER_STYLES,
  isScatterStyle,
  refreshSources,
  type Placed,
  type ScatterStyle,
} from './logoScatter';
import { pageOpacity, type Exit } from './stageMath';

const W = 1000;
const H = 600;

/** Wordmark pixels (size 5) at the left, and a bot's (size 12, accent eyes) at the right. */
const logo = [
  { x: 100, y: 400, size: 5 },
  { x: 110, y: 400, size: 5 },
  { x: 120, y: 405, size: 5 },
  { x: 130, y: 410, size: 5 },
  { x: 800, y: 300, size: 12 },
  { x: 812, y: 300, size: 12, accent: true },
];

function scatter(style: ScatterStyle = 'donut') {
  const targets = [
    { x: 700, y: 100, size: 3, color: 'white' },
    { x: 720, y: 100, size: 3, color: 'white' },
    { x: 740, y: 120, size: 3, color: 'blue' },
  ];
  return buildScatter(logo, targets, W, H, style)!;
}

test.each(SCATTER_STYLES)(
  'every pixel starts on the wordmark and ends on the page text: %s',
  (style) => {
    const sc = scatter(style);
    const at: Placed = { x: 0, y: 0, size: 0, alpha: 1, settled: false };
    for (let i = 0; i < sc.n; i++) {
      placeParticle(sc, i, 0, at);
      expect([at.x, at.y, at.size]).toEqual([
        expect.closeTo(sc.sx[i]!, 3),
        expect.closeTo(sc.sy[i]!, 3),
        expect.closeTo(sc.s0[i]!, 3),
      ]);
      placeParticle(sc, i, LANDED, at);
      expect(at.x).toBeCloseTo(sc.tx[i]!, 3);
      expect(at.y).toBeCloseTo(sc.ty[i]!, 3);
      expect(at.settled).toBe(true);
    }
  },
);

test('every style stays finite all the way through', () => {
  for (const style of SCATTER_STYLES) {
    const sc = scatter(style);
    const at: Placed = { x: 0, y: 0, size: 0, alpha: 1, settled: false };
    for (let w = 0; w <= 1; w += 0.05)
      for (let i = 0; i < sc.n; i++) {
        placeParticle(sc, i, w, at);
        expect(Number.isFinite(at.x + at.y + at.size + at.alpha)).toBe(true);
      }
  }
});

test('style names from the URL are checked', () => {
  expect(isScatterStyle('vortex')).toBe(true);
  expect(isScatterStyle('nope')).toBe(false);
  expect(isScatterStyle(null)).toBe(false);
});

test('mid-flight the pixels are spread out in depth: some nearer, some farther than the page', () => {
  const sc = scatter();
  const at: Placed = { x: 0, y: 0, size: 0, alpha: 1, settled: false };
  const sizes: number[] = [];
  for (let i = 0; i < sc.n; i++) {
    placeParticle(sc, i, EXPLODE, at);
    sizes.push(at.size);
    expect(at.settled).toBe(false);
  }
  expect(Math.max(...sizes)).toBeGreaterThan(Math.min(...sizes) * 1.2);
});

test('the pixels are the wordmark first: the paired target keeps left-to-right order', () => {
  const sc = scatter();
  expect(sc.n).toBeGreaterThanOrEqual(4);
  for (let i = 1; i < sc.n; i++) {
    expect(sc.sx[i]!).toBeGreaterThanOrEqual(sc.sx[i - 1]!);
    expect(sc.tx[i]!).toBeGreaterThanOrEqual(sc.tx[i - 1]!);
  }
});

test('the bot and the wordmark scatter together, each at its own pixel size, eyes starting blue', () => {
  const sc = scatter();
  const sizes = new Set([...sc.s0]);
  expect(sizes).toEqual(new Set([5, 12]));
  expect([...sc.sa].some((v) => v === 1)).toBe(true);
});

test('refreshing moves the start to where the logos are now', () => {
  const sc = scatter();
  const moved = logo.map((p) => ({ ...p, y: p.y - 7, size: p.size + 1 }));
  refreshSources(sc, moved);
  const at: Placed = { x: 0, y: 0, size: 0, alpha: 1, settled: false };
  placeParticle(sc, 0, 0, at);
  expect(at.y).toBeCloseTo(393, 3);
  expect(at.size).toBeCloseTo(6, 3);
  // a different number of pixels (the logo changed shape): left alone
  const before = sc.sy[0];
  refreshSources(sc, moved.slice(1));
  expect(sc.sy[0]).toBe(before);
});

test('nothing to scatter without a wordmark or page text', () => {
  expect(
    buildScatter([], [{ x: 1, y: 1, size: 2, color: 'w' }], W, H),
  ).toBeNull();
  expect(buildScatter(logo, [], W, H)).toBeNull();
});

test('with the logo scatter the old page drops away early and the new one appears as pixels land', () => {
  const exits: Exit[] = ['logo-scatter', undefined];
  // k = 0, dissolve w = (a - TYPE)/(1 - TYPE), a = (t - REST)/(1 - 2 REST)
  const at = (w: number) => 0.2 + (0.4 + 0.6 * w) * 0.6;
  expect(pageOpacity(0, 0, 3, exits)).toBe(1);
  expect(pageOpacity(at(0.3), 0, 3, exits)).toBe(0);
  expect(pageOpacity(at(0.3), 1, 3, exits)).toBe(0);
  expect(pageOpacity(at(0.8), 1, 3, exits)).toBeCloseTo(0); // pixels still landing
  expect(pageOpacity(at(1), 1, 3, exits)).toBeCloseTo(1);
  // transitions without it keep the swap at the midpoint
  expect(pageOpacity(1.7, 2, 3, exits)).toBe(1);
  expect(pageOpacity(1.7, 1, 3, exits)).toBe(0);
});
