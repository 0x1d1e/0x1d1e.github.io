/**
 * Hero → next page. The hero wordmark's own pixels leave the logo, move through
 * a 3D "middle" (one of several styles), then settle into the next page's text,
 * which fades in underneath as they land.
 *
 * Progress `w` runs 0..1: 0..EXPLODE the pixels leave the wordmark, the rest
 * they gather. At both ends the pixels sit exactly on the wordmark and on the
 * page text, whatever the style.
 */
import type { LogoPoint } from './logoSource';

/** Focal length of the camera, in px: smaller means stronger perspective. */
const FOCAL = 900;
/** Share of the transition spent leaving the wordmark. */
export const EXPLODE = 0.45;
/** The pixels have all landed by here; the page then fades in under them. */
export const LANDED = 0.85;
const MAX_PARTICLES = 6000;

/**
 * The middle of the transition:
 * - donut: a tilted ring; the whole cloud makes one turn
 * - vortex: a funnel, narrow at the bottom, spinning faster there
 * - tunnel: rings of pixels rush past the camera, as if flying through
 * - galaxy: a tilted spiral disc with a dense core, inner pixels orbit faster
 * - wave: a rolling sheet of pixels below the horizon
 * - sphere: a turning globe
 * - magnet: a loose cloud round the page text that is pulled in, nearest first
 * - shatter: the wordmark falls apart and tumbles down, then the page rises
 */
export const SCATTER_STYLES = [
  'donut',
  'vortex',
  'tunnel',
  'galaxy',
  'wave',
  'sphere',
  'magnet',
  'shatter',
] as const;
export type ScatterStyle = (typeof SCATTER_STYLES)[number];

export const isScatterStyle = (s: unknown): s is ScatterStyle =>
  SCATTER_STYLES.includes(s as ScatterStyle);

export type Scatter = {
  style: ScatterStyle;
  n: number;
  w: number;
  h: number;
  /** Start (the wordmark) and end (the page text), screen px. */
  sx: Float32Array;
  sy: Float32Array;
  tx: Float32Array;
  ty: Float32Array;
  /** Pixel edge at the start and the end. */
  s0: Float32Array;
  s1: Float32Array;
  /** The style's own base position (relative to the screen centre) and parameters. */
  bx: Float32Array;
  by: Float32Array;
  bz: Float32Array;
  /** Angular speed, phase and amplitude: what they mean depends on the style. */
  om: Float32Array;
  ph: Float32Array;
  am: Float32Array;
  /** Head start/lag when gathering, 0..1. */
  lag: Float32Array;
  /** Index into `palette` for the colour the pixel ends up with. */
  color: Uint8Array;
  /** 1 where the pixel starts in the accent colour (the bot's eyes). */
  sa: Uint8Array;
  /** How many logo pixels it was built from. */
  from: number;
  palette: string[];
};

export type Placed = {
  x: number;
  y: number;
  size: number;
  alpha: number;
  settled: boolean;
};

const TAU = Math.PI * 2;
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
/** Starts moving gently, then carries on: no sudden pop at the first scroll. */
const outSine = (x: number) => Math.sin((x * Math.PI) / 2);
const inOutCubic = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

/** Mulberry32: the same scatter on every visit. */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TUNNEL_NEAR = -480;
const TUNNEL_LENGTH = 2600;
/** How many tunnel lengths the camera flies over the whole transition. */
const TUNNEL_SPEED = 0.85;
const GALAXY_TILT = 0.7;
const SHATTER_FALL = 300;

type V3 = { x: number; y: number; z: number };

/** Where the style has particle `i` at progress `w`, relative to the screen centre. */
function burstAt(sc: Scatter, i: number, w: number, o: V3) {
  const bx = sc.bx[i]!;
  const by = sc.by[i]!;
  const bz = sc.bz[i]!;
  switch (sc.style) {
    case 'vortex':
    case 'sphere':
    case 'galaxy': {
      // Orbiting the vertical axis, each at its own speed.
      const a = sc.om[i]! * w;
      const x = bx * Math.cos(a) + bz * Math.sin(a);
      const z = -bx * Math.sin(a) + bz * Math.cos(a);
      if (sc.style === 'galaxy') {
        o.x = x;
        o.y = by * Math.cos(GALAXY_TILT) - z * Math.sin(GALAXY_TILT);
        o.z = by * Math.sin(GALAXY_TILT) + z * Math.cos(GALAXY_TILT);
      } else {
        o.x = x;
        o.y = by;
        o.z = z;
      }
      return o;
    }
    case 'tunnel': {
      // Flying forwards: rings stream past and wrap round, while the tunnel twists.
      const a = sc.om[i]! * w;
      o.x = bx * Math.cos(a) - by * Math.sin(a);
      o.y = bx * Math.sin(a) + by * Math.cos(a);
      const run = bz - TUNNEL_NEAR - w * TUNNEL_LENGTH * TUNNEL_SPEED;
      o.z =
        TUNNEL_NEAR + (((run % TUNNEL_LENGTH) + TUNNEL_LENGTH) % TUNNEL_LENGTH);
      return o;
    }
    case 'wave': {
      o.x = bx;
      o.z = bz;
      o.y =
        by + sc.am[i]! * Math.sin(0.012 * bx + 0.007 * bz - sc.ph[i]! - w * 16);
      return o;
    }
    case 'magnet': {
      // Floating loosely round the text it is about to become.
      o.x = bx + 26 * Math.sin(w * 9 + sc.ph[i]!);
      o.y = by + 26 * Math.sin(w * 7 + sc.ph[i]! * 1.3);
      o.z = bz + 44 * Math.sin(w * 5 + sc.ph[i]! * 0.7);
      return o;
    }
    case 'shatter': {
      // Starts on the wordmark, then flies off and falls.
      const T = Math.min(w, EXPLODE + 0.1) / EXPLODE;
      o.x = sc.sx[i]! - sc.w / 2 + bx * T;
      o.y = sc.sy[i]! - sc.h / 2 + by * T + SHATTER_FALL * T * T;
      o.z = bz * T;
      return o;
    }
    default:
      // donut: a fixed ring; the whole cloud turns in placeParticle
      o.x = bx;
      o.y = by;
      o.z = bz;
      return o;
  }
}

const burst: V3 = { x: 0, y: 0, z: 0 };

/** Where particle `i` is at progress `w`, written into `out`. */
export function placeParticle(sc: Scatter, i: number, w: number, out: Placed) {
  const cx = sc.w / 2;
  const cy = sc.h / 2;
  const sx = sc.sx[i]! - cx;
  const sy = sc.sy[i]! - cy;
  const tx = sc.tx[i]! - cx;
  const ty = sc.ty[i]! - cy;
  const b = burstAt(sc, i, w, burst);
  let x: number;
  let y: number;
  let z: number;
  let size: number;
  let g = 0; // how far through the gathering
  if (w <= EXPLODE) {
    // The shatter already starts on the wordmark; the others fly out to their place.
    const a = sc.style === 'shatter' ? 1 : outSine(clamp(w / EXPLODE));
    x = sx + (b.x - sx) * a;
    y = sy + (b.y - sy) * a;
    z = b.z * a;
    size = sc.s0[i]!;
  } else {
    const lag = sc.lag[i]! * 0.35;
    g = inOutCubic(
      clamp(((w - EXPLODE) / (LANDED - EXPLODE) - lag) / (1 - 0.35)),
    );
    x = b.x + (tx - b.x) * g;
    y = b.y + (ty - b.y) * g;
    z = b.z * (1 - g);
    size = sc.s0[i]! + (sc.s1[i]! - sc.s0[i]!) * g;
  }
  if (sc.style === 'donut') {
    // The whole ring makes one full turn about the vertical axis, always the
    // same way, easing in and out: it is back square-on when the pixels land.
    const yaw = TAU * (0.5 - 0.5 * Math.cos(Math.PI * clamp(w / LANDED)));
    const x1 = x * Math.cos(yaw) + z * Math.sin(yaw);
    z = -x * Math.sin(yaw) + z * Math.cos(yaw);
    x = x1;
  }
  const depth = FOCAL + z;
  const k = depth > 60 ? FOCAL / depth : 0; // behind the camera: gone
  out.x = cx + x * k;
  out.y = cy + y * k;
  out.size = size * k;
  // Far pixels dim; everything fades once the page itself is fading in.
  out.alpha = clamp(k * 0.9, 0.2, 1) * (1 - clamp((w - 0.9) / 0.1));
  out.settled = w > EXPLODE && g >= 0.92;
  return out;
}

/** Draws the cloud at progress `w`. `fg` is the wordmark's colour, `accent` the colour of pixels in flight. */
export function drawScatter(
  ctx: CanvasRenderingContext2D,
  sc: Scatter,
  w: number,
  colors: { fg: string; accent: string },
) {
  ctx.clearRect(0, 0, sc.w, sc.h);
  if (w <= 0 || w >= 1) return;
  const at: Placed = { x: 0, y: 0, size: 0, alpha: 1, settled: false };
  let fill = '';
  let alpha = -1;
  for (let i = 0; i < sc.n; i++) {
    placeParticle(sc, i, w, at);
    if (at.size < 0.4) continue;
    const c =
      w < 0.02
        ? sc.sa[i]
          ? colors.accent
          : colors.fg
        : at.settled
          ? sc.palette[sc.color[i]!]!
          : colors.accent;
    if (c !== fill) ctx.fillStyle = fill = c;
    if (at.alpha !== alpha) ctx.globalAlpha = alpha = at.alpha;
    ctx.fillRect(at.x, at.y, at.size, at.size);
  }
  ctx.globalAlpha = 1;
}

type Target = { x: number; y: number; size: number; color: string };

/**
 * The page's text as pixels: each word is drawn where the browser laid it out,
 * then sampled. Bigger type is sampled more coarsely.
 */
export function pageTargets(page: HTMLElement, w: number, h: number): Target[] {
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  const ctx = off.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];
  const words: {
    x: number;
    y: number;
    w: number;
    h: number;
    step: number;
    color: string;
  }[] = [];
  const walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const el = node.parentElement;
    if (!el || ['SCRIPT', 'STYLE'].includes(el.tagName)) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const px = parseFloat(cs.fontSize) || 16;
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    ctx.letterSpacing =
      cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
    ctx.fillStyle = cs.color;
    ctx.textBaseline = 'alphabetic';
    const ascent = ctx.measureText('x').fontBoundingBoxAscent || px * 0.8;
    const step = clamp(Math.round(px / 14), 2, 5);
    for (const m of (node.textContent ?? '').matchAll(/\S+/g)) {
      range.setStart(node, m.index);
      range.setEnd(node, m.index + m[0].length);
      const r = range.getClientRects()[0];
      if (
        !r ||
        !r.width ||
        r.right < 0 ||
        r.left > w ||
        r.bottom < 0 ||
        r.top > h
      )
        continue;
      const text = cs.textTransform === 'uppercase' ? m[0].toUpperCase() : m[0];
      ctx.fillText(text, r.left, r.top + ascent);
      words.push({
        x: r.left,
        y: r.top,
        w: r.width,
        h: r.height,
        step,
        color: cs.color,
      });
    }
  }
  const out: Target[] = [];
  for (const wd of words) {
    const x0 = Math.max(0, Math.floor(wd.x));
    const y0 = Math.max(0, Math.floor(wd.y));
    const ww = Math.min(w - x0, Math.ceil(wd.w) + 2);
    const hh = Math.min(h - y0, Math.ceil(wd.h) + 2);
    if (ww <= 0 || hh <= 0) continue;
    const d = ctx.getImageData(x0, y0, ww, hh).data;
    for (let y = 0; y < hh; y += wd.step)
      for (let x = 0; x < ww; x += wd.step) {
        const o = (y * ww + x) * 4;
        if ((d[o + 3] ?? 0) > 128)
          out.push({
            x: x0 + x,
            y: y0 + y,
            size: wd.step - 0.5,
            color: wd.color,
          });
      }
  }
  return out;
}

/** Sets particle `i`'s base position and parameters for the style. `t` is where it ends up, relative to the centre. */
function layout(
  sc: Scatter,
  i: number,
  style: ScatterStyle,
  rand: () => number,
  t: { x: number; y: number },
) {
  const { w, h } = sc;
  switch (style) {
    case 'vortex': {
      // A funnel: narrow at the bottom, wide at the top, faster at the bottom.
      const u = rand();
      const r = 70 + u * 480 * (0.85 + 0.3 * rand());
      const a = rand() * TAU;
      sc.bx[i] = Math.cos(a) * r * 1.25;
      sc.bz[i] = Math.sin(a) * r;
      sc.by[i] = (0.5 - u) * h * 1.05;
      sc.om[i] = TAU * (1.4 + 2.4 * (1 - u));
      break;
    }
    case 'tunnel': {
      // A series of rings round the line of sight, evenly spaced in depth.
      const RINGS = 14;
      const ring = Math.floor(rand() * RINGS);
      const r = 300 + (rand() - 0.5) * 50;
      const a = rand() * TAU;
      sc.bx[i] = Math.cos(a) * r * 1.6;
      sc.by[i] = Math.sin(a) * r;
      sc.bz[i] = TUNNEL_NEAR + (ring + 0.5) * (TUNNEL_LENGTH / RINGS);
      sc.om[i] = 0.45; // the same slow twist for every ring
      break;
    }
    case 'galaxy': {
      // Three spiral arms round a dense core; the inner pixels orbit faster.
      const r = 40 + 600 * Math.pow(rand(), 1.5);
      const a =
        Math.floor(rand() * 3) * (TAU / 3) + r * 0.011 + (rand() - 0.5) * 0.5;
      sc.bx[i] = Math.cos(a) * r * 1.4;
      sc.bz[i] = Math.sin(a) * r;
      sc.by[i] = (rand() - 0.5) * 50 * (1 - r / 700);
      sc.om[i] = TAU * (0.35 + 70 / (r + 50));
      break;
    }
    case 'wave': {
      // A sheet below the horizon; the wave rolls through it.
      sc.bx[i] = (rand() - 0.5) * w * 1.7;
      sc.bz[i] = -250 + rand() * 1500;
      sc.by[i] = 200;
      sc.am[i] = 55 + rand() * 30;
      sc.ph[i] = rand() * 0.4;
      break;
    }
    case 'sphere': {
      // A globe (points spread evenly over the surface) that turns.
      const z = rand() * 2 - 1;
      const a = rand() * TAU;
      const q = Math.sqrt(1 - z * z);
      const r = 430;
      sc.bx[i] = Math.cos(a) * q * r * 1.25;
      sc.by[i] = z * r;
      sc.bz[i] = Math.sin(a) * q * r;
      sc.om[i] = TAU * 1.1;
      break;
    }
    case 'magnet': {
      // Scattered round where this pixel will end up; the nearest are pulled in first.
      const r = 30 + rand() * 170;
      const a = rand() * TAU;
      sc.bx[i] = t.x + Math.cos(a) * r * 1.3;
      sc.by[i] = t.y + Math.sin(a) * r;
      sc.bz[i] = (rand() - 0.5) * 360;
      sc.ph[i] = rand() * TAU;
      sc.lag[i] = clamp(Math.hypot(sc.bx[i]! - t.x, sc.by[i]! - t.y) / 200);
      return;
    }
    case 'shatter': {
      // Thrown off the wordmark, then pulled down.
      const a = rand() * TAU;
      const v = 120 + rand() * 520;
      sc.bx[i] = Math.cos(a) * v;
      sc.by[i] = -Math.abs(Math.sin(a)) * v * 0.55 - rand() * 60;
      sc.bz[i] = (rand() - 0.5) * 900;
      break;
    }
    default: {
      // donut: a ring (wider than tall, with some thickness) tipped towards the camera.
      const a = rand() * TAU;
      const r = 330 + rand() * 330;
      const rz = Math.sin(a) * r;
      const ry = (rand() - 0.5) * 220;
      sc.bx[i] = Math.cos(a) * r * 1.5;
      sc.by[i] = ry * Math.cos(0.45) - rz * Math.sin(0.45);
      sc.bz[i] = ry * Math.sin(0.45) + rz * Math.cos(0.45);
    }
  }
  sc.lag[i] = rand();
}

/** The logo pixels in the order particles are paired with the page's: left to right. */
const byX = (pts: LogoPoint[]) => [...pts].sort((a, b) => a.x - b.x);

/**
 * Pairs the logos' pixels (the wordmark, the bot) with the page's, left to
 * right, so shapes flow into nearby text.
 */
export function buildScatter(
  logo: LogoPoint[],
  targets: Target[],
  w: number,
  h: number,
  style: ScatterStyle = 'tunnel',
): Scatter | null {
  const L = logo.length;
  if (!L || !targets.length) return null;
  const src = byX(logo);
  // Keep a fair share of every word when there is more text than particles.
  const rand = rng(0x1d1e);
  let tg = targets;
  if (tg.length > MAX_PARTICLES) {
    const keep = MAX_PARTICLES / tg.length;
    tg = tg.filter(() => rand() < keep);
  }
  tg = [...tg].sort((a, b) => a.x - b.x);
  const n = Math.max(L, Math.min(tg.length, MAX_PARTICLES));
  const f = (len: number) => new Float32Array(len);
  const sc: Scatter = {
    style,
    n,
    w,
    h,
    sx: f(n),
    sy: f(n),
    tx: f(n),
    ty: f(n),
    s0: f(n),
    s1: f(n),
    bx: f(n),
    by: f(n),
    bz: f(n),
    om: f(n),
    ph: f(n),
    am: f(n),
    lag: f(n),
    color: new Uint8Array(n),
    sa: new Uint8Array(n),
    from: L,
    palette: [],
  };
  const known = new Map<string, number>();
  for (let i = 0; i < n; i++) {
    const s = src[Math.floor((i * L) / n)]!;
    const t = tg[Math.floor((i * tg.length) / n)]!;
    sc.sx[i] = s.x;
    sc.sy[i] = s.y;
    sc.tx[i] = t.x;
    sc.ty[i] = t.y;
    sc.s0[i] = s.size;
    sc.sa[i] = s.accent ? 1 : 0;
    sc.s1[i] = t.size;
    layout(sc, i, style, rand, { x: t.x - w / 2, y: t.y - h / 2 });
    let c = known.get(t.color);
    if (c === undefined) {
      c = Math.min(known.size, 255);
      known.set(t.color, c);
      sc.palette[c] = t.color;
    }
    sc.color[i] = c;
  }
  return sc;
}

/**
 * Moves the start of every particle to where the logos are right now (they
 * bob and the page can resize), so the scatter takes over without a jump.
 */
export function refreshSources(sc: Scatter, logo: LogoPoint[]) {
  if (logo.length !== sc.from) return;
  const src = byX(logo);
  for (let i = 0; i < sc.n; i++) {
    const s = src[Math.floor((i * sc.from) / sc.n)]!;
    sc.sx[i] = s.x;
    sc.sy[i] = s.y;
    sc.s0[i] = s.size;
  }
}
