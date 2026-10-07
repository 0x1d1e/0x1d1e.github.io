import { ARRIVE_START, EAT_END } from './agentEat';
import type { FxStyle } from './trainFx';

/** Scroll maths for Stage. t is the page position (0 = first page, n-1 = last). */

/** Fraction of each page's scroll range spent holding still. */
export const REST = 0.2;
/** Share of a transition spent typing the command before the wipe starts. */
export const TYPE = 0.4;

export const clamp = (v: number, lo = 0, hi = 1) =>
  Math.min(hi, Math.max(lo, v));

/** Progress (0..1) of the whole transition from page k to page k+1. */
export const scan = (t: number, k: number) =>
  clamp((t - k - REST) / (1 - 2 * REST));

/** The pixel dissolve starts after the command is typed. */
export const wipe = (a: number) => clamp((a - TYPE) / (1 - TYPE));

/** How much of the command has been typed (0..1). */
export const typed = (a: number) => clamp(a / TYPE);

/** The part of `cmd` typed so far at transition progress `a`. */
export const typedCommand = (cmd: string, a: number) =>
  cmd.slice(0, Math.round(typed(a) * cmd.length));

/** Past this point the command has run: the shell shows the new directory. */
export const RUN_END = 0.65;

/** Dissolve progress (0..1) of the transition leaving page k, at page position t. */
export const dissolve = (t: number, k: number) => wipe(scan(t, k));

/** The page on stage at page position t: the old one until the dissolve has covered the screen. */
export const shownPage = (t: number, n: number) => {
  const k = clamp(Math.floor(t), 0, Math.max(0, n - 2));
  return n < 2 ? 0 : dissolve(t, k) < 0.5 ? k : k + 1;
};

/** How a page is left: the pixel dissolve (default), or one of the special ones. */
export type Exit = 'logo-scatter' | 'agent-eat' | `fx-${FxStyle}` | undefined;

/**
 * Opacity of page i at page position t. With the logo scatter, the old page's
 * own content drops away quickly (the wordmark is drawn as particles) and the
 * new page appears as the particles land. With the agent, the old page stays
 * until it has been eaten (it is clipped from the right as it goes) and the
 * new one is shown once the agent has gone. Otherwise the page swaps at the
 * dissolve's midpoint. `typing` dims the page being left while its command types.
 */
export const pageOpacity = (
  t: number,
  i: number,
  n: number,
  exits: Exit[],
  typing = 0,
) => {
  const k = clamp(Math.floor(t), 0, Math.max(0, n - 2));
  if (n > 1 && exits[k] === 'logo-scatter') {
    const w = dissolve(t, k);
    if (i === k) return (1 - 0.3 * typing) * (1 - clamp(w / 0.2));
    if (i === k + 1) return clamp((w - 0.8) / 0.2);
    return 0;
  }
  if (n > 1 && exits[k] === 'agent-eat') {
    const w = dissolve(t, k);
    if (i === k) return w < EAT_END ? 1 - 0.3 * typing : 0;
    if (i === k + 1) return w > ARRIVE_START ? 1 : 0;
    return 0;
  }
  if (n > 1 && exits[k] === 'fx-tokens') {
    // The words themselves travel: the old page's fade out at once, the new page's fade in at the end.
    const w = dissolve(t, k);
    if (i === k) return (1 - 0.3 * typing) * (1 - clamp(w / 0.12));
    if (i === k + 1) return clamp((w - 0.86) / 0.14);
    return 0;
  }
  return shownPage(t, n) === i ? 1 - 0.3 * typing : 0;
};

/**
 * Scroll length of each transition, in viewports (`spans[k]` is page k → k+1).
 * A longer span makes that transition slower per scroll.
 */
const total = (spans: number[]) => spans.reduce((a, b) => a + b, 0);

/** Total height of the stage, in viewports (the pinned screen included). */
export const stageHeight = (spans: number[]) => total(spans) + 1;

/** Page position t (0 = first page, n-1 = last) at scroll progress v (0..1) through the stage. */
export const toPosition = (v: number, spans: number[]) => {
  let at = clamp(v) * total(spans);
  for (let k = 0; k < spans.length; k++) {
    if (at <= spans[k]! || k === spans.length - 1)
      return k + clamp(at / spans[k]!);
    at -= spans[k]!;
  }
  return 0;
};

/** How far into the stage, in viewports, page i sits at rest. */
export const scrollOf = (i: number, spans: number[]) =>
  total(spans.slice(0, i));
