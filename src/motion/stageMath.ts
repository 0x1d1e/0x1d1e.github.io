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

/** The wipe (scan line) starts after the command is typed. */
export const wipe = (a: number) => clamp((a - TYPE) / (1 - TYPE));

/** How much of the command has been typed (0..1). */
export const typed = (a: number) => clamp(a / TYPE);

/** The part of `cmd` typed so far at transition progress `a`. */
export const typedCommand = (cmd: string, a: number) =>
  cmd.slice(0, Math.round(typed(a) * cmd.length));

/** Past this point the command has run: the shell shows the new directory. */
export const RUN_END = 0.65;
