/**
 * The hero's logos, as pixels: the wordmark and the agent bot. Each registers
 * itself so the page transition can scatter their exact pixels, read live.
 */
export type LogoPoint = {
  /** Top-left of the pixel, screen px. */
  x: number;
  y: number;
  /** Edge of the pixel. */
  size: number;
  /** Starts in the accent colour (the bot's eyes) rather than the text colour. */
  accent?: boolean;
};

export type LogoSource = {
  /** The pixels as they are on screen right now. */
  read: () => LogoPoint[];
  /** Hide (or show again) the real thing, while the transition draws its pixels. */
  hide: (hidden: boolean) => void;
};

const sources = new Set<LogoSource>();

/** Registers a logo; call the result to remove it. */
export function addLogoSource(s: LogoSource) {
  sources.add(s);
  return () => {
    sources.delete(s);
  };
}

/** Every logo's pixels, in one list. */
export function readLogoPoints(): LogoPoint[] {
  return [...sources].flatMap((s) => s.read());
}

export function hideLogos(hidden: boolean) {
  for (const s of sources) s.hide(hidden);
}
