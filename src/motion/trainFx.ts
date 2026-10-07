/**
 * Transitions for the AI-research page: six ways to leave it, all scrubbed by
 * scroll. Progress `w` runs 0..1. Except for `tokens`, each one covers the
 * whole screen with an opaque canvas at w = 0.5 (when the page underneath is
 * swapped) and then clears it to reveal the next page.
 *
 * - denoise: the page turns to static, then resolves out of it (diffusion)
 * - descent: a ball rolls down a loss landscape; the page appears from the minimum
 * - forward: a signal passes through a network, left to right; the page blooms from the output
 * - backprop: red error flows back through the network; the page is rewritten from the input
 * - tokens: the page's words become tokens, go through a model, and come out as the next page
 * - eval: a wall of checks goes from FAIL to PASS, then ships out
 */
import { drawUncover, makeCells, type Cells } from './pixelDissolve';

export const FX_STYLES = [
  'denoise',
  'descent',
  'forward',
  'backprop',
  'tokens',
  'eval',
] as const;
export type FxStyle = (typeof FX_STYLES)[number];
export const isFxStyle = (s: unknown): s is FxStyle =>
  FX_STYLES.includes(s as FxStyle);

export type FxColors = {
  bg: string;
  fg: string;
  accent: string;
  danger: string;
  success: string;
  muted: string;
  chip: string;
  card: string;
  ring: string;
};

export type FxEnv = {
  ctx: CanvasRenderingContext2D;
  vw: number;
  vh: number;
  colors: FxColors;
  mono: string;
  /** The page being left and the one arriving (the `tokens` style reads their words). */
  from: HTMLElement | null;
  to: HTMLElement | null;
};

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const inOutCubic = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

/** A small deterministic hash to 0..1, so every frame of a scrub looks the same. */
export function hash(a: number, b = 0, c = 0) {
  let h =
    (Math.imul(a, 374761393) +
      Math.imul(b, 668265263) +
      Math.imul(c, 2147483647)) |
    0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Everything built from the screen size or the pages, kept until the size changes. */
let cache = new Map<string, unknown>();
export const clearFxCache = () => {
  cache = new Map();
};
function cached<T>(key: string, make: () => T): T {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key) as T;
}

/** The part of the transition's two halves: how far the cover has come in (0..1), and how far it has cleared (0..1). */
const coverIn = (w: number) => clamp(w * 2);
const coverOut = (w: number) => clamp((w - 0.5) * 2);

function label(env: FxEnv, text: string, alpha = 1) {
  const { ctx, vw, colors, mono } = env;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `12px ${mono}`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = colors.muted;
  ctx.fillText(text, vw - 56, 96);
  ctx.restore();
}

// ---------------------------------------------------------------- denoise

type Grain = { size: number; cols: number; rows: number; key: Float32Array };

function grain(vw: number, vh: number): Grain {
  const size = 12;
  const cols = Math.ceil(vw / size);
  const rows = Math.ceil(vh / size);
  const SCALE = 6; // blobs of about six cells, so it clears in patches
  const at = (cx: number, cy: number) => hash(cx, cy, 91);
  const key = new Float32Array(cols * rows);
  let lo = 1;
  let hi = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const fx = c / SCALE;
      const fy = r / SCALE;
      const x0 = Math.floor(fx);
      const y0 = Math.floor(fy);
      const tx = fx - x0;
      const ty = fy - y0;
      const smooth = lerp(
        lerp(at(x0, y0), at(x0 + 1, y0), tx),
        lerp(at(x0, y0 + 1), at(x0 + 1, y0 + 1), tx),
        ty,
      );
      const v = 0.7 * smooth + 0.3 * hash(c, r, 5);
      key[r * cols + c] = v;
      lo = Math.min(lo, v);
      hi = Math.max(hi, v);
    }
  for (let i = 0; i < key.length; i++) key[i] = (key[i]! - lo) / (hi - lo);
  return { size, cols, rows, key };
}

function drawDenoise(w: number, env: FxEnv) {
  const { ctx, vw, vh, colors } = env;
  const g = cached(`denoise:${vw}x${vh}`, () => grain(vw, vh));
  // How much of the picture is noise: it builds up, then is removed again.
  const amount = w < 0.5 ? coverIn(w) : 1 - coverOut(w);
  const tick = Math.floor(w * 90);
  ctx.clearRect(0, 0, vw, vh);
  for (let r = 0; r < g.rows; r++)
    for (let c = 0; c < g.cols; c++) {
      const k = g.key[r * g.cols + c]!;
      if (k > amount) continue;
      const n = hash(c, r + 7919, tick);
      const front = amount - k < 0.08; // the edge of the noise is brighter
      ctx.fillStyle =
        n < 0.035
          ? colors.fg
          : n < 0.06
            ? colors.accent
            : front && n < 0.4
              ? colors.muted
              : n < 0.55
                ? colors.chip
                : n < 0.8
                  ? colors.card
                  : colors.bg;
      ctx.fillRect(c * g.size, r * g.size, g.size + 1, g.size + 1);
    }
  label(
    env,
    `denoise  t=${String(Math.round(amount * 1000)).padStart(4, '0')}`,
  );
}

// ---------------------------------------------------------------- descent

/** The loss surface: a bowl with ripples, and a global minimum near (0.25, -0.1). */
const loss = (x: number, y: number) =>
  0.8 * ((x - 0.25) ** 2 + (y + 0.1) ** 2) +
  0.12 * Math.sin(6 * x) * Math.cos(5 * y) +
  0.06 * Math.sin(11 * x + 2 * y) +
  0.15;

/** Gradient descent with momentum from a bad start, as a list of points ending at the minimum. */
export function descentPath(steps = 140) {
  let x = -0.85;
  let y = 0.8;
  let vx = 0;
  let vy = 0;
  const path: { x: number; y: number; l: number }[] = [{ x, y, l: loss(x, y) }];
  const e = 1e-3;
  for (let i = 0; i < steps; i++) {
    const gx = (loss(x + e, y) - loss(x - e, y)) / (2 * e);
    const gy = (loss(x, y + e) - loss(x, y - e)) / (2 * e);
    vx = 0.86 * vx - 0.04 * gx;
    vy = 0.86 * vy - 0.04 * gy;
    x += vx;
    y += vy;
    path.push({ x, y, l: loss(x, y) });
  }
  return path;
}

type Descent = {
  path: ReturnType<typeof descentPath>;
  /** Projects a point on the surface to the screen. */
  at: (x: number, y: number) => { x: number; y: number; k: number };
  cells: Cells;
  end: { x: number; y: number };
};

function descent(vw: number, vh: number): Descent {
  const path = descentPath();
  const theta = 1.0;
  const D0 = 720;
  const F = 900;
  const at = (x: number, y: number) => {
    const X = x * vw * 0.5;
    const Z = y * vw * 0.3;
    const H = loss(x, y) * vh * 0.7;
    const yv = -H * Math.cos(theta) - Z * Math.sin(theta);
    const zv = Z * Math.cos(theta) - H * Math.sin(theta) + D0;
    const k = F / zv;
    return { x: vw / 2 + X * k, y: vh * 0.52 + yv * k, k };
  };
  const last = path[path.length - 1]!;
  const end = at(last.x, last.y);
  return {
    path,
    at,
    cells: makeCells(vw, vh, { x: end.x, y: end.y, clear: 30 }),
    end,
  };
}

function drawTerrain(env: FxEnv, d: Descent, alpha: number, ball: number) {
  const { ctx, colors } = env;
  ctx.save();
  const N = 56;
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++) {
      const x = (i / (N - 1)) * 2 - 1;
      const y = (j / (N - 1)) * 2 - 1;
      const p = d.at(x, y);
      const low = clamp(1 - (loss(x, y) - 0.1) / 1.3); // lower is brighter
      ctx.globalAlpha = alpha * (0.18 + 0.6 * low);
      ctx.fillStyle = colors.accent;
      const s = Math.max(1.5, 3.2 * p.k);
      ctx.fillRect(p.x, p.y, s, s);
    }
  // The trail and the ball.
  const at = ball * (d.path.length - 1);
  const head = Math.floor(at);
  for (let t = Math.max(0, head - 28); t <= head; t++) {
    const q = d.path[t]!;
    const p = d.at(q.x, q.y);
    ctx.globalAlpha = alpha * (1 - (head - t) / 30);
    ctx.fillStyle = colors.fg;
    const s = Math.max(2, 7 * p.k);
    ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
  }
  const a = d.path[head]!;
  const b = d.path[Math.min(head + 1, d.path.length - 1)]!;
  const f = at - head;
  const p = d.at(lerp(a.x, b.x, f), lerp(a.y, b.y, f));
  ctx.globalAlpha = alpha;
  ctx.shadowColor = colors.accent;
  ctx.shadowBlur = 24;
  ctx.fillStyle = colors.fg;
  const s = Math.max(6, 22 * p.k);
  ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
  ctx.restore();
}

function drawDescent(w: number, env: FxEnv) {
  const { ctx, vw, vh, colors } = env;
  const d = cached(`descent:${vw}x${vh}`, () => descent(vw, vh));
  if (w < 0.5) {
    const u = coverIn(w);
    ctx.clearRect(0, 0, vw, vh);
    ctx.globalAlpha = clamp(u * 1.6);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, vw, vh);
    ctx.globalAlpha = 1;
    drawTerrain(env, d, clamp(u * 2), u);
    const last = d.path[d.path.length - 1]!;
    label(
      env,
      `epoch ${Math.round(u * 140)}  loss ${lerp(d.path[0]!.l, last.l, u).toFixed(3)}`,
      clamp(u * 3),
    );
  } else {
    const u = coverOut(w);
    // The page appears in rings from the minimum, where the ball came to rest.
    drawUncover(ctx, d.cells, vw, vh, u, colors, d.end);
    drawTerrain(env, d, 0.8 * (1 - u), 1);
    const last = d.path[d.path.length - 1]!;
    label(env, `converged  loss ${last.l.toFixed(3)}`, 1 - u);
  }
}

// ----------------------------------------------------------- the network

type Net = {
  layers: { x: number; nodes: { x: number; y: number }[] }[];
  edges: {
    a: { x: number; y: number };
    b: { x: number; y: number };
    seed: number;
  }[];
  cells: Cells;
  forward: Cells;
  backward: Cells;
  output: { x: number; y: number };
  input: { x: number; y: number };
};

function network(vw: number, vh: number): Net {
  const xs = [0.1, 0.3, 0.5, 0.7, 0.9];
  const counts = [3, 6, 7, 6, 3];
  const layers = xs.map((fx, li) => ({
    x: fx * vw,
    nodes: Array.from({ length: counts[li]! }, (_, i) => ({
      x: fx * vw,
      y: vh * (0.22 + (0.56 * (i + 0.5)) / counts[li]!),
    })),
  }));
  const edges: Net['edges'] = [];
  for (let l = 0; l < layers.length - 1; l++)
    for (const a of layers[l]!.nodes)
      for (const b of layers[l + 1]!.nodes)
        edges.push({ a, b, seed: hash(Math.round(a.y), Math.round(b.y), l) });
  const output = { x: layers[4]!.x, y: vh / 2 };
  const input = { x: layers[0]!.x, y: vh / 2 };
  return {
    layers,
    edges,
    cells: makeCells(vw, vh),
    forward: makeCells(vw, vh, { ...output, clear: 50 }),
    backward: makeCells(vw, vh, { ...input, clear: 50 }),
    output,
    input,
  };
}

/** Draws the network with the signal at x = `front`; `dir` is 1 for forward, -1 for backward. */
function drawNet(
  env: FxEnv,
  n: Net,
  front: number,
  dir: 1 | -1,
  alpha: number,
  tint: string,
  done = false,
) {
  const { ctx, colors } = env;
  ctx.save();
  ctx.lineCap = 'square';
  for (const e of n.edges) {
    const span = e.b.x - e.a.x;
    // How far the signal is along this edge (0 before it, 1 after it).
    const t = clamp(
      dir === 1 ? (front - e.a.x) / span : (e.b.x - front) / span,
    );
    const weight = done
      ? 1
      : 0.7 +
        1.8 *
          (dir === -1 ? Math.max(0, Math.sin(e.seed * 20 + front * 0.01)) : 0);
    ctx.globalAlpha = alpha * (0.1 + 0.3 * t);
    ctx.strokeStyle = t > 0 ? tint : colors.muted;
    ctx.lineWidth = weight;
    ctx.beginPath();
    ctx.moveTo(e.a.x, e.a.y);
    ctx.lineTo(e.b.x, e.b.y);
    ctx.stroke();
    if (t > 0 && t < 1) {
      // The pulse: a short bright run along the edge.
      ctx.globalAlpha = alpha;
      ctx.fillStyle = tint;
      for (let s = 0; s < 6; s++) {
        const q = clamp(dir === 1 ? t - s * 0.03 : 1 - t + s * 0.03);
        ctx.fillRect(
          lerp(e.a.x, e.b.x, q) - 2,
          lerp(e.a.y, e.b.y, q) - 2,
          4,
          4,
        );
      }
    }
  }
  for (const L of n.layers) {
    const lit = done || (dir === 1 ? front >= L.x : front <= L.x);
    for (const p of L.nodes) {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(p.x - 9, p.y - 9, 18, 18);
      ctx.strokeStyle = lit ? tint : colors.muted;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(p.x - 9, p.y - 9, 18, 18);
      if (lit) {
        ctx.fillStyle = tint;
        ctx.fillRect(p.x - 5, p.y - 5, 10, 10);
      }
    }
  }
  ctx.restore();
}

/** A cover that sweeps across by columns, from the left (`dir` 1) or from the right (-1). */
function sweep(env: FxEnv, n: Net, u: number, dir: 1 | -1, edge: string) {
  const { ctx, vw, vh, colors } = env;
  const c = n.cells;
  ctx.clearRect(0, 0, vw, vh);
  for (let r = 0; r < c.rows; r++)
    for (let q = 0; q < c.cols; q++) {
      const x = (q + 0.5) / c.cols;
      const k = (dir === 1 ? x : 1 - x) * 0.9 + 0.1 * c.key[r * c.cols + q]!;
      if (k > u) continue;
      ctx.fillStyle = u - k < 0.03 ? edge : colors.bg;
      ctx.fillRect(q * c.size, r * c.size, c.size + 1, c.size + 1);
    }
}

function drawForward(w: number, env: FxEnv) {
  const { ctx, vw, vh, colors } = env;
  const n = cached(`net:${vw}x${vh}`, () => network(vw, vh));
  if (w < 0.5) {
    const u = coverIn(w);
    sweep(env, n, u, 1, colors.accent);
    drawNet(env, n, u * vw, 1, 1, colors.accent);
    label(env, `forward pass  layer ${Math.min(5, Math.floor(u * 5) + 1)}/5`);
  } else {
    const u = coverOut(w);
    // The output node blooms into the next page.
    drawUncover(ctx, n.forward, vw, vh, u, colors, n.output);
    drawNet(env, n, vw, 1, 1 - u, colors.accent, true);
    label(env, 'output ready', 1 - u);
  }
}

function drawBackprop(w: number, env: FxEnv) {
  const { ctx, vw, vh, colors } = env;
  const n = cached(`net:${vw}x${vh}`, () => network(vw, vh));
  if (w < 0.5) {
    const u = coverIn(w);
    sweep(env, n, u, -1, colors.danger);
    drawNet(env, n, vw - u * vw, -1, 1, colors.danger);
    label(env, `backprop  error ${(1 - u * 0.9).toFixed(2)}`);
  } else {
    const u = coverOut(w);
    // Weights updated: the network settles green and the page is rewritten from the input.
    drawUncover(ctx, n.backward, vw, vh, u, colors, n.input);
    drawNet(env, n, 0, -1, 1 - u, colors.success, true);
    label(env, 'weights updated', 1 - u);
  }
}

// ----------------------------------------------------------------- tokens

type Word = {
  text: string;
  /** Centre of the word on screen, and its size. */
  x: number;
  y: number;
  w: number;
  h: number;
  font: { weight: string; family: string; size: number };
  color: string;
  lag: number;
  /** Which side of the straight line the word curves to. */
  bend: number;
};

const MAX_WORDS = 160;

/** Every word of a page, where the browser laid it out (SVG text is left out). */
export function pageWords(
  page: HTMLElement | null,
  vw: number,
  vh: number,
): Word[] {
  if (!page) return [];
  const out: Word[] = [];
  const walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const el = node.parentElement;
    if (!el || el.closest('svg') || ['SCRIPT', 'STYLE'].includes(el.tagName))
      continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    for (const m of (node.textContent ?? '').matchAll(/\S+/g)) {
      range.setStart(node, m.index);
      range.setEnd(node, m.index + m[0].length);
      const r = range.getClientRects()[0];
      if (
        !r ||
        !r.width ||
        r.right < 0 ||
        r.left > vw ||
        r.bottom < 0 ||
        r.top > vh
      )
        continue;
      const i = out.length;
      out.push({
        text: cs.textTransform === 'uppercase' ? m[0].toUpperCase() : m[0],
        x: r.left + r.width / 2,
        y: r.top + r.height / 2,
        w: r.width,
        h: r.height,
        font: {
          weight: cs.fontWeight,
          family: cs.fontFamily,
          size: parseFloat(cs.fontSize) || 16,
        },
        color: cs.color,
        lag: hash(i, 3),
        bend: hash(i, 9) < 0.5 ? -1 : 1,
      });
    }
  }
  // Keep an even share of the page when there are more words than we want to move.
  if (out.length <= MAX_WORDS) return out;
  const keep = MAX_WORDS / out.length;
  return out.filter((_, i) => hash(i, 77) < keep);
}

/** Where a word is on its way between `from` and `to`, bowing out sideways. */
function arc(
  a: { x: number; y: number },
  b: { x: number; y: number },
  t: number,
  bend: number,
) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx + (-dy / len) * len * 0.25 * bend;
  const cy = my + (dx / len) * len * 0.25 * bend;
  const s = 1 - t;
  return {
    x: s * s * a.x + 2 * s * t * cx + t * t * b.x,
    y: s * s * a.y + 2 * s * t * cy + t * t * b.y,
  };
}

function drawWord(
  env: FxEnv,
  wd: Word,
  at: { x: number; y: number },
  scale: number,
  chip: number,
  tag?: string,
) {
  const { ctx, colors } = env;
  const size = wd.font.size * scale;
  if (size < 2) return;
  ctx.font = `${wd.font.weight} ${size}px ${wd.font.family}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (chip > 0.02) {
    // While in flight a word is a token: boxed.
    ctx.globalAlpha = chip;
    ctx.fillStyle = colors.card;
    const bw = wd.w * scale + 10;
    const bh = wd.h * scale + 6;
    ctx.fillRect(at.x - bw / 2, at.y - bh / 2, bw, bh);
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1;
    ctx.strokeRect(at.x - bw / 2, at.y - bh / 2, bw, bh);
    if (tag) {
      ctx.font = `10px ${env.mono}`;
      ctx.fillStyle = colors.accent;
      ctx.fillText(tag, at.x, at.y - bh / 2 - 8);
      ctx.font = `${wd.font.weight} ${size}px ${wd.font.family}`;
    }
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = wd.color;
  ctx.fillText(wd.text, at.x, at.y);
}

function drawTokens(w: number, env: FxEnv) {
  const { ctx, vw, vh, colors } = env;
  const from = cached(`words-from:${vw}x${vh}`, () =>
    pageWords(env.from, vw, vh),
  );
  const to = cached(`words-to:${vw}x${vh}`, () => pageWords(env.to, vw, vh));
  ctx.clearRect(0, 0, vw, vh);
  const model = { x: vw / 2, y: vh / 2 };
  // The model in the middle, pulsing while words pass through it.
  const live = Math.sin(Math.PI * clamp((w - 0.05) / 0.9));
  if (live > 0.01) {
    ctx.save();
    ctx.globalAlpha = live;
    ctx.fillStyle = colors.card;
    ctx.fillRect(model.x - 70, model.y - 34, 140, 68);
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(model.x - 70, model.y - 34, 140, 68);
    ctx.fillStyle = colors.muted;
    ctx.font = `12px ${env.mono}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('model', model.x, model.y - 8);
    for (let i = 0; i < 5; i++) {
      const on = hash(i, Math.floor(w * 40)) < 0.6;
      ctx.fillStyle = on ? colors.accent : colors.chip;
      ctx.fillRect(model.x - 30 + i * 13, model.y + 8, 9, 9);
    }
    ctx.restore();
  }
  ctx.save();
  if (w < 0.5) {
    const u = coverIn(w);
    for (const wd of from) {
      const t = inOutCubic(clamp((u - wd.lag * 0.35) / 0.65));
      if (t >= 1) continue;
      const to2 = {
        x: model.x + (hash(wd.lag * 99) - 0.5) * 60,
        y: model.y + (hash(wd.lag * 77) - 0.5) * 30,
      };
      drawWord(env, wd, arc(wd, to2, t, wd.bend), 1 - 0.8 * t, clamp(t * 6));
    }
  } else {
    const u = coverOut(w);
    for (const wd of to) {
      const t = 1 - inOutCubic(clamp((u - wd.lag * 0.35) / 0.65));
      const from2 = {
        x: model.x + (hash(wd.lag * 55) - 0.5) * 60,
        y: model.y + (hash(wd.lag * 33) - 0.5) * 30,
      };
      const tag =
        t > 0.15 ? (0.5 + hash(wd.lag * 1000) * 0.49).toFixed(2) : undefined;
      drawWord(
        env,
        wd,
        arc(wd, from2, t, wd.bend),
        1 - 0.8 * t,
        clamp(t * 6),
        tag,
      );
    }
  }
  ctx.restore();
}

// -------------------------------------------------------------------- eval

type Wall = { cw: number; ch: number; cols: number; rows: number };
const wall = (vw: number, vh: number): Wall => ({
  cw: 116,
  ch: 44,
  cols: Math.ceil(vw / 116),
  rows: Math.ceil(vh / 44),
});

type Check = 'PASS' | 'WARN' | 'FAIL';
/** A check's result as the run progresses (u: 0..1): it starts as FAIL, WARN or PASS and ends as PASS. */
export function checkAt(i: number, j: number, u: number): Check {
  const resolve = 0.5 + 0.45 * hash(i, j, 2);
  if (u >= resolve) return 'PASS';
  const s = hash(i, j, 1);
  return s < 0.3 ? 'FAIL' : s < 0.6 ? 'WARN' : 'PASS';
}

function drawEval(w: number, env: FxEnv) {
  const { ctx, vw, vh, colors, mono } = env;
  const g = wall(vw, vh);
  ctx.clearRect(0, 0, vw, vh);
  ctx.font = `600 11px ${mono}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const shipping = w >= 0.5;
  const u = shipping ? 1 : coverIn(w);
  const out = coverOut(w);
  let pass = 0;
  for (let j = 0; j < g.rows; j++)
    for (let i = 0; i < g.cols; i++) {
      const x = i * g.cw;
      const y = j * g.ch;
      const key = 0.55 * hash(i, j, 4) + 0.45 * ((i / g.cols + j / g.rows) / 2);
      const a = clamp((u - key * 0.7) / 0.3);
      if (a <= 0) continue;
      const status = checkAt(i, j, u);
      if (status === 'PASS') pass++;
      // Shipping: the checks leave in a wave from the left.
      const k2 = (i / g.cols) * 0.8 + 0.2 * hash(i, j, 6);
      const b = shipping ? clamp((out - k2 * 0.7) / 0.3) : 0;
      if (b >= 1) continue;
      const s = a * (1 - b);
      // The cover under the chip, so nothing shows through the gaps.
      ctx.fillStyle = colors.bg;
      const cw = g.cw * s + 1;
      const ch = g.ch * s + 1;
      ctx.fillRect(x + (g.cw - cw) / 2, y + (g.ch - ch) / 2, cw, ch);
      if (s < 0.6) continue;
      const colour =
        status === 'PASS'
          ? colors.success
          : status === 'WARN'
            ? colors.muted
            : colors.danger;
      const slide = b * -40;
      ctx.globalAlpha = 1 - b;
      if (status === 'FAIL') {
        ctx.fillStyle = colors.danger;
        ctx.globalAlpha = 0.16 * (1 - b);
        ctx.fillRect(x + 4, y + 5 + slide, g.cw - 8, g.ch - 10);
        ctx.globalAlpha = 1 - b;
      }
      ctx.strokeStyle = colour;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 4.5, y + 5.5 + slide, g.cw - 9, g.ch - 11);
      ctx.fillStyle = colour;
      ctx.fillText(status, x + g.cw / 2, y + g.ch / 2 + slide);
      ctx.globalAlpha = 1;
    }
  // The tally, big in the middle when the whole wall is green.
  const total = g.cols * g.rows;
  const show = Math.sin(Math.PI * clamp((w - 0.3) / 0.4));
  if (show > 0.02) {
    ctx.save();
    ctx.globalAlpha = show;
    ctx.fillStyle = colors.bg;
    ctx.fillRect(vw / 2 - 150, vh / 2 - 34, 300, 68);
    ctx.strokeStyle = colors.success;
    ctx.strokeRect(vw / 2 - 150, vh / 2 - 34, 300, 68);
    ctx.fillStyle = colors.success;
    ctx.font = `600 22px ${mono}`;
    ctx.fillText(`${Math.min(total, pass)}/${total} passed`, vw / 2, vh / 2);
    ctx.restore();
  }
}

// -------------------------------------------------------------------- entry

/** Draws style `style` at progress `w` (0..1) onto the stage canvas. */
export function drawFx(style: FxStyle, w: number, env: FxEnv) {
  switch (style) {
    case 'denoise':
      return drawDenoise(w, env);
    case 'descent':
      return drawDescent(w, env);
    case 'forward':
      return drawForward(w, env);
    case 'backprop':
      return drawBackprop(w, env);
    case 'tokens':
      return drawTokens(w, env);
    case 'eval':
      return drawEval(w, env);
  }
}

/** `tokens` moves the words themselves: its pages fade rather than swap while covered. */
export const fxFadesPages = (style: FxStyle) => style === 'tokens';
