import { expect, test, vi } from 'vitest';
import { drawDissolve, drawUncover, makeCells } from './pixelDissolve';

const colors = { bg: 'black', accent: 'blue' };
function fakeCtx() {
  return {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: '',
  } as unknown as CanvasRenderingContext2D & {
    fillRect: ReturnType<typeof vi.fn>;
  };
}

test('cells tile the screen and are the same on every visit', () => {
  const a = makeCells(1440, 900);
  const b = makeCells(1440, 900);
  expect(a.cols * a.size).toBeGreaterThanOrEqual(1440);
  expect(a.rows * a.size).toBeGreaterThanOrEqual(900);
  expect(a.key).toEqual(b.key);
});

test('nothing is drawn outside the dissolve', () => {
  const cells = makeCells(800, 600);
  for (const p of [0, 1]) {
    const ctx = fakeCtx();
    drawDissolve(ctx, cells, 800, 600, p, colors);
    expect(ctx.fillRect).not.toHaveBeenCalled();
  }
});

test('the screen is fully covered at the midpoint and pixels are drawn on the way', () => {
  const cells = makeCells(800, 600);
  const mid = fakeCtx();
  drawDissolve(mid, cells, 800, 600, 0.5, colors);
  expect(mid.fillRect.mock.calls.length).toBe(cells.cols * cells.rows);
  const early = fakeCtx();
  drawDissolve(early, cells, 800, 600, 0.2, colors);
  expect(early.fillRect).toHaveBeenCalled();
  expect(early.fillRect.mock.calls.length).toBeLessThan(
    mid.fillRect.mock.calls.length * 2,
  );
});

test('with an origin, cells clear outwards from it and the zone around it goes first', () => {
  const cells = makeCells(800, 600, { x: 200, y: 300, clear: 100 });
  const at = (x: number, y: number) =>
    cells.key[
      Math.floor(y / cells.size) * cells.cols + Math.floor(x / cells.size)
    ]!;
  expect(at(220, 300)).toBeLessThan(0.2); // inside the clear zone
  expect(at(760, 40)).toBeGreaterThan(0.6); // far corner is last
  expect(Math.max(...cells.key)).toBeLessThanOrEqual(1);
});

test('uncovering goes from fully covered to nothing, and the pixels are drawn on the way', () => {
  const cells = makeCells(800, 600, { x: 400, y: 300 });
  const at = { x: 400, y: 300 };
  const start = fakeCtx();
  drawUncover(start, cells, 800, 600, 0, colors, at);
  expect(start.fillRect.mock.calls.length).toBe(cells.cols * cells.rows);
  const mid = fakeCtx();
  drawUncover(mid, cells, 800, 600, 0.5, colors, at);
  expect(mid.fillRect).toHaveBeenCalled();
  const end = fakeCtx();
  drawUncover(end, cells, 800, 600, 1, colors, at);
  expect(end.fillRect).not.toHaveBeenCalled();
});
