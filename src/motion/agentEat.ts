/**
 * Page → next page, the agent's way. The little agent from the page lifts out
 * of its illustration and grows until it fills the screen, its eyes turning
 * red. It sweeps across eating the page (pixels are sucked into its mouth, and
 * everything behind its leading edge is gone), then pops into pixels, and the
 * next page wipes in where it vanished.
 *
 * Progress `w` runs 0..1 and is scrubbed by scroll, so it reverses too.
 */
import { SPRITES } from '../components/Agent/Agent';

export const GROW_END = 0.22;
export const EAT_END = 0.74;
export const POP_END = 0.88;
/** The next page starts to appear here, wiping in from the left. */
export const ARRIVE_START = 0.8;
const CHOMPS = 7;

const SPRITE = SPRITES.worker;
const COLS = 10;
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const outCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const inOutSine = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * x);

/** The agent as it sits on its page: its centre and the edge of one pixel, in screen px. */
export type AgentSrc = { cx: number; cy: number; s: number };

/** The size of one agent pixel when it is big. */
const bigCell = (vh: number) => Math.min(vh * 0.078, 84);
/** Where the big agent starts out: its centre, towards the right of the screen. */
const startCx = (vw: number, vh: number) =>
  vw - (COLS * bigCell(vh)) / 2 - vw * 0.04;
const centreY = (vh: number) => (vh - 36) / 2 + 24;

/** x of the leading (left) edge of the page's remaining part: everything right of it is eaten. */
export function eatFront(w: number, vw: number, vh: number) {
  const body = COLS * bigCell(vh);
  if (w <= GROW_END) {
    // While it grows the cut creeps in under it, so nothing pops.
    const g = outCubic(w / GROW_END);
    return vw - (vw - (startCx(vw, vh) - body / 2)) * g * g;
  }
  const e = inOutSine(clamp((w - GROW_END) / (EAT_END - GROW_END)));
  return lerp(startCx(vw, vh) - body / 2, 0, e);
}

export type AgentState = {
  cx: number;
  cy: number;
  /** Edge of one pixel. */
  s: number;
  /** How red the eyes are, 0..1. */
  rage: number;
  /** How open the mouth is, 0..1. */
  mouth: number;
  /** Progress of the pop into pixels, 0..1. */
  pop: number;
};

export function agentAt(
  w: number,
  vw: number,
  vh: number,
  src: AgentSrc,
): AgentState {
  const S = bigCell(vh);
  const cx1 = startCx(vw, vh);
  const cy1 = centreY(vh);
  const rage = clamp((w - 0.05) / 0.15);
  if (w <= GROW_END) {
    const g = outCubic(w / GROW_END);
    return {
      cx: lerp(src.cx, cx1, g),
      cy: lerp(src.cy, cy1, g),
      s: lerp(src.s, S, g),
      rage,
      mouth: 0,
      pop: 0,
    };
  }
  const e = clamp((w - GROW_END) / (EAT_END - GROW_END));
  const front = eatFront(w, vw, vh);
  return {
    cx: front + (COLS * S) / 2,
    cy: cy1,
    s: S,
    rage: 1,
    mouth: e >= 1 ? 0 : Math.abs(Math.sin(e * CHOMPS * Math.PI)),
    pop: clamp((w - EAT_END) / (POP_END - EAT_END)),
  };
}

/** Pixels torn off the page ahead of the mouth, sucked in and gone: fixed, so scrolling back replays them. */
type Crumb = {
  born: number;
  dx: number;
  dy: number;
  size: number;
  light: boolean;
};
const CRUMBS = 260;
const LIFE = 0.09;
let crumbs: Crumb[] | null = null;
function crumbList() {
  if (crumbs) return crumbs;
  let seed = 0x1d1e;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  crumbs = Array.from({ length: CRUMBS }, () => ({
    born: GROW_END + 0.01 + rand() * (EAT_END - GROW_END - LIFE),
    dx: 40 + rand() * 280,
    dy: (rand() - 0.5) * 2,
    size: 3 + rand() * 7,
    light: rand() < 0.7,
  }));
  return crumbs;
}

type Colors = { fg: string; accent: string; bg: string; danger: string };

export function drawAgentEat(
  ctx: CanvasRenderingContext2D,
  w: number,
  vw: number,
  vh: number,
  src: AgentSrc,
  colors: Colors,
) {
  ctx.clearRect(0, 0, vw, vh);
  if (w <= 0 || w >= POP_END) return;
  const a = agentAt(w, vw, vh, src);

  // Crumbs: from the page ahead of the mouth into it, shrinking.
  const S = bigCell(vh);
  for (const c of crumbList()) {
    const age = (w - c.born) / LIFE;
    if (age <= 0 || age >= 1) continue;
    const mouthX = eatFront(c.born, vw, vh) + 1.4 * S;
    const mouthY = centreY(vh) + 1.5 * S;
    const k = age * age; // eased in: it hangs, then is gone
    const x = mouthX - c.dx * (1 - k);
    const y = mouthY + c.dy * vh * 0.32 * (1 - k);
    const size = c.size * (1 - k * 0.8);
    ctx.fillStyle = c.light ? colors.fg : colors.accent;
    ctx.globalAlpha = 1 - k * 0.6;
    ctx.fillRect(x, y, size, size);
  }
  ctx.globalAlpha = 1;

  // The agent. It shakes while it goes red.
  const shake =
    a.rage < 1 ? 3 * a.rage * Math.sin(w * 260) : 1.2 * Math.sin(w * 90);
  const left = a.cx - (COLS * a.s) / 2 + shake;
  const top = a.cy - (COLS * a.s) / 2;
  const popOut = a.pop;
  ctx.globalAlpha = 1 - popOut;
  SPRITE.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch === '.') return;
      // Whole pixels, with a little overlap, so the body has no seams.
      let px = Math.floor(left + x * a.s);
      let py = Math.floor(top + y * a.s);
      let size = Math.ceil(a.s) + 1;
      if (popOut > 0) {
        // Each pixel flies off from the agent's centre.
        const dx = x - 4.5 + ((x * 7 + y * 3) % 5) * 0.12;
        const dy = y - 4.5 + ((x * 3 + y * 11) % 7) * 0.1;
        const d = Math.hypot(dx, dy) || 1;
        const fly = Math.pow(popOut, 1.4) * a.s * 9;
        px += (dx / d) * fly;
        py += (dy / d) * fly;
        size *= 1 - popOut * 0.7;
      }
      if (ch === 'e') {
        ctx.fillStyle = colors.accent;
        ctx.fillRect(px, py, size, size);
        // Red eyes: the red grows over the blue, with a glow.
        ctx.save();
        ctx.globalAlpha = (1 - popOut) * a.rage;
        ctx.shadowColor = colors.danger;
        ctx.shadowBlur = 36 * a.rage;
        ctx.fillStyle = colors.danger;
        ctx.fillRect(px, py, size, size);
        ctx.restore();
      } else {
        ctx.fillStyle = colors.fg;
        ctx.fillRect(px, py, size, size);
      }
    }),
  );

  // The mouth: a dark gap across the lower face that opens and closes, with teeth.
  if (a.mouth > 0.02 && popOut === 0) {
    const mx = left + 2 * a.s;
    const mw = 6 * a.s;
    const my = top + 6 * a.s;
    const mh = 2 * a.s * a.mouth;
    ctx.fillStyle = colors.bg;
    ctx.fillRect(mx, my, mw, mh);
    ctx.fillStyle = colors.fg;
    const tooth = a.s * 0.7;
    for (let i = 0; i < 3; i++) {
      const tx = mx + (0.3 + i * 2) * a.s;
      ctx.fillRect(tx, my, tooth, Math.min(tooth, mh * 0.5));
      ctx.fillRect(
        tx + a.s,
        my + mh - Math.min(tooth, mh * 0.5),
        tooth,
        Math.min(tooth, mh * 0.5),
      );
    }
  }
  ctx.globalAlpha = 1;
}

/**
 * clip-path for the page being eaten: everything right of the leading edge is
 * gone; after the pop, all of it.
 */
export function eatenClip(w: number, vw: number, vh: number) {
  if (w <= 0) return 'none';
  const front = w >= EAT_END ? 0 : eatFront(w, vw, vh);
  return `inset(0 ${Math.max(0, vw - front)}px 0 0)`;
}

/** clip-path for the page arriving: wipes in from the left, where the agent vanished. */
export function arrivalClip(w: number) {
  if (w <= ARRIVE_START) return 'inset(0 100% 0 0)';
  const a = outCubic(clamp((w - ARRIVE_START) / (1 - ARRIVE_START)));
  return a >= 1 ? 'none' : `inset(0 ${(1 - a) * 100}% 0 0)`;
}
