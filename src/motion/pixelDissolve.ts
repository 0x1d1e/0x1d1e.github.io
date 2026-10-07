/**
 * Pixel dissolve between two pages. Progress 0..1: in the first half the old
 * page breaks into pixels that scatter away (a grid of cells covers it); in the
 * second half pixels converge from all around and the cells clear to reveal the
 * new page. Fully covered at 0.5, which is when the page underneath swaps.
 */

export type Cells = {
  cols: number;
  rows: number;
  size: number;
  key: Float32Array;
};

/** Mulberry32: a tiny seeded PRNG, so the pattern is the same on every visit. */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Origin = { x: number; y: number; clear?: number };

/**
 * `origin`: cells clear in rings outward from it (ring order, plus a little
 * noise), and everything within `clear` px of it goes first. Without one the
 * order is random with a slight sweep from the left.
 */
export function makeCells(w: number, h: number, origin?: Origin): Cells {
  const size = Math.max(24, Math.round(w / 56));
  const cols = Math.ceil(w / size);
  const rows = Math.ceil(h / size);
  const rand = rng(0x1d1e);
  const key = new Float32Array(cols * rows);
  // Mostly random, with a slight sweep from the left so it reads as a wave.
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      key[r * cols + c] = origin
        ? radial(origin, (c + 0.5) * size, (r + 0.5) * size, w, h, rand())
        : 0.8 * rand() + 0.2 * (c / cols);
  return { cols, rows, size, key };
}

function radial(
  o: Origin,
  x: number,
  y: number,
  w: number,
  h: number,
  noise: number,
) {
  const far = Math.max(
    Math.hypot(o.x, o.y),
    Math.hypot(w - o.x, o.y),
    Math.hypot(o.x, h - o.y),
    Math.hypot(w - o.x, h - o.y),
  );
  const d = Math.max(0, Math.hypot(x - o.x, y - o.y) - (o.clear ?? 0));
  return (
    0.82 * Math.min(1, d / Math.max(1, far - (o.clear ?? 0))) + 0.18 * noise
  );
}

const ease = (x: number) => 1 - (1 - x) * (1 - x);
const part = (u: number, key: number) =>
  Math.min(1, Math.max(0, (u - key * 0.7) / 0.3));

type Colors = { bg: string; accent: string };

/**
 * The covering half's second phase: the cover shrinks away cell by cell while
 * a pixel settles into each cell. `out`: the pixels travel outwards from
 * (cx, cy); otherwise they fly in from outside.
 */
function uncover(
  ctx: CanvasRenderingContext2D,
  { cols, rows, size, key }: Cells,
  u: number,
  colors: Colors,
  cx: number,
  cy: number,
  out: boolean,
) {
  const sign = out ? -1 : 1;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const k = key[r * cols + c]!;
      const a = ease(part(u, k));
      if (a >= 1) continue;
      const x = c * size;
      const y = r * size;
      // Cover shrinks away to show the page...
      const cover = size * (1 - a);
      ctx.fillStyle = colors.bg;
      ctx.fillRect(
        x + (size - cover) / 2,
        y + (size - cover) / 2,
        cover + 1,
        cover + 1,
      );
      if (a <= 0) continue;
      // ...while a pixel settles into place.
      const dx = x + size / 2 - cx;
      const dy = y + size / 2 - cy;
      const d = Math.hypot(dx, dy) || 1;
      const fly = size * (3 + 6 * k) * sign;
      const s = size * 0.5 * a;
      ctx.fillStyle = colors.accent;
      ctx.fillRect(
        x + (size - s) / 2 + (dx / d) * fly * (1 - a),
        y + (size - s) / 2 + (dy / d) * fly * (1 - a),
        s,
        s,
      );
    }
}

/** Draws the dissolve at `progress` (0..1). Draws nothing at either end. */
export function drawDissolve(
  ctx: CanvasRenderingContext2D,
  cells: Cells,
  w: number,
  h: number,
  progress: number,
  colors: Colors,
) {
  ctx.clearRect(0, 0, w, h);
  if (progress <= 0 || progress >= 1) return;
  const { cols, rows, size, key } = cells;
  if (progress >= 0.5)
    return uncover(
      ctx,
      cells,
      (progress - 0.5) * 2,
      colors,
      w / 2,
      h / 2,
      false,
    );
  const u = progress * 2;
  const cx = w / 2;
  const cy = h / 2;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const k = key[r * cols + c]!;
      const a = ease(part(u, k));
      if (a <= 0) continue;
      const x = c * size;
      const y = r * size;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(x, y, size + 1, size + 1);
      if (a < 1) {
        // The pixel that just left the old page, flying off (away from the centre) and shrinking.
        const dx = x + size / 2 - cx;
        const dy = y + size / 2 - cy;
        const d = Math.hypot(dx, dy) || 1;
        const fly = size * (3 + 6 * k);
        const s = size * 0.5 * (1 - a);
        ctx.fillStyle = colors.accent;
        ctx.fillRect(x + (dx / d) * fly * a, y + (dy / d) * fly * a, s, s);
      }
    }
}

/**
 * The page appearing out of a cover: everything covered at u = 0, nothing at
 * u = 1, clearing in rings that spread out from `at` (the cells' origin).
 */
export function drawUncover(
  ctx: CanvasRenderingContext2D,
  cells: Cells,
  w: number,
  h: number,
  u: number,
  colors: Colors,
  at: { x: number; y: number },
) {
  ctx.clearRect(0, 0, w, h);
  if (u >= 1) return;
  uncover(ctx, cells, u, colors, at.x, at.y, true);
}
