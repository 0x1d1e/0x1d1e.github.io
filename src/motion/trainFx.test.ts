import { expect, test, vi } from 'vitest';
import {
  FX_STYLES,
  checkAt,
  clearFxCache,
  descentPath,
  drawFx,
  hash,
  isFxStyle,
  pageWords,
  type FxEnv,
} from './trainFx';
import { pageOpacity, type Exit } from './stageMath';

/** A canvas context that records which of its methods were called. */
function fakeCtx() {
  const calls: Record<string, ReturnType<typeof vi.fn>> = {};
  const state: Record<string, unknown> = {};
  return new Proxy(state, {
    get: (_, k: string) => (k in state ? state[k] : (calls[k] ??= vi.fn())),
    set: (_, k: string, v) => {
      state[k] = v;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D &
    Record<string, ReturnType<typeof vi.fn>>;
}

const colors = {
  bg: 'k',
  fg: 'w',
  accent: 'b',
  danger: 'r',
  success: 'g',
  muted: 'm',
  chip: 'c',
  card: 'd',
  ring: 'n',
};
const env = (): FxEnv => ({
  ctx: fakeCtx(),
  vw: 800,
  vh: 600,
  colors,
  mono: 'monospace',
  from: null,
  to: null,
});

test('style names are checked', () => {
  expect(FX_STYLES).toHaveLength(6);
  expect(isFxStyle('eval')).toBe(true);
  expect(isFxStyle('nope')).toBe(false);
});

test('hash is stable and spread over 0..1', () => {
  expect(hash(3, 4, 5)).toBe(hash(3, 4, 5));
  const v = Array.from({ length: 200 }, (_, i) => hash(i));
  expect(Math.min(...v)).toBeGreaterThanOrEqual(0);
  expect(Math.max(...v)).toBeLessThan(1);
  expect(Math.max(...v) - Math.min(...v)).toBeGreaterThan(0.8);
});

test('gradient descent rolls downhill and ends at the bottom of the bowl', () => {
  const path = descentPath();
  const first = path[0]!;
  const last = path[path.length - 1]!;
  expect(last.l).toBeLessThan(first.l * 0.5);
  expect(last.x).toBeGreaterThan(-0.1); // moved towards the minimum, near x = 0.25
  expect(
    Math.hypot(
      last.x - path[path.length - 8]!.x,
      last.y - path[path.length - 8]!.y,
    ),
  ).toBeLessThan(0.03); // settled
});

test('the eval wall ends all green and starts with failures', () => {
  let failing = 0;
  for (let j = 0; j < 12; j++)
    for (let i = 0; i < 12; i++) {
      if (checkAt(i, j, 0) === 'FAIL') failing++;
      expect(checkAt(i, j, 1)).toBe('PASS');
    }
  expect(failing).toBeGreaterThan(10);
});

test.each(FX_STYLES)(
  '%s draws through the whole transition without trouble',
  (style) => {
    clearFxCache();
    for (const w of [0.05, 0.25, 0.5, 0.75, 0.95]) {
      const e = env();
      drawFx(style, w, e);
      const c = e.ctx as unknown as Record<string, ReturnType<typeof vi.fn>>;
      // each frame clears the canvas first (or the cover drawing does)
      expect(
        c.clearRect!.mock.calls.length + c.fillRect!.mock.calls.length,
      ).toBeGreaterThan(0);
    }
  },
);

test.each(FX_STYLES.filter((s) => s !== 'tokens'))(
  '%s paints the screen at the midpoint, when the page swaps',
  (style) => {
    clearFxCache();
    const e = env();
    drawFx(style, 0.5, e);
    const c = e.ctx as unknown as Record<string, ReturnType<typeof vi.fn>>;
    expect(c.fillRect!.mock.calls.length).toBeGreaterThan(40);
  },
);

test('a page that is not there has no words', () => {
  expect(pageWords(null, 800, 600)).toEqual([]);
});

test('tokens fade the pages; the other effects swap them under the cover', () => {
  const at = (w: number) => 0.2 + (0.4 + 0.6 * w) * 0.6;
  const tokens: Exit[] = ['fx-tokens', undefined];
  expect(pageOpacity(at(0.2), 0, 3, tokens)).toBe(0); // old words already left the page
  expect(pageOpacity(at(0.5), 1, 3, tokens)).toBe(0); // nothing but tokens on screen
  expect(pageOpacity(at(1), 1, 3, tokens)).toBeCloseTo(1);
  const denoise: Exit[] = ['fx-denoise', undefined];
  expect(pageOpacity(at(0.3), 0, 3, denoise)).toBe(1); // still there under the noise
  expect(pageOpacity(at(0.3), 1, 3, denoise)).toBe(0);
  expect(pageOpacity(at(0.7), 0, 3, denoise)).toBe(0);
  expect(pageOpacity(at(0.7), 1, 3, denoise)).toBe(1);
});
