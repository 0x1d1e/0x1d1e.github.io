import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { animate, useReducedMotion } from 'motion/react';
import { drawUncover, makeCells } from '../../motion/pixelDissolve';
import { duration, ease } from '../../motion/tokens';

/** Give up on the video if it has not started playing by then (slow network, autoplay blocked). */
const START_TIMEOUT = 2500;
/** The video frame, and where the `0x1d1e` wordmark sits in it (px, in a 1280x720 frame). */
const FRAME = { w: 1280, h: 720 };
const MARK = { x: 301, y: 252, w: 685, h: 174 };
const MORPH = 1.2;
/** The page appears as pixels clearing in rings outward from the landed wordmark. */
const RIPPLE = 1.6;

/** Every full load of the home page (refresh included); automated browsers only with `?intro`. */
export function shouldPlayIntro(pathname: string, search: string) {
  if (pathname !== '/') return false;
  return new URLSearchParams(search).has('intro') || !navigator.webdriver;
}

/**
 * Where the hero's pixel wordmark is on screen, mirroring how PixelWordmark
 * sizes its text: the video's wordmark glides to exactly this spot.
 */
function heroMark() {
  const canvas = document.querySelector<HTMLElement>('#hero-title canvas');
  const text = document.getElementById('hero-title')?.textContent?.trim();
  const ctx = document.createElement('canvas').getContext('2d');
  if (!canvas || !text || !ctx) return undefined;
  const r = canvas.getBoundingClientRect();
  if (!r.width) return undefined;
  const family =
    getComputedStyle(document.documentElement)
      .getPropertyValue('--font-display')
      .trim() || 'sans-serif';
  ctx.font = `600 100px ${family}`;
  const size = Math.min(190, (r.width / ctx.measureText(text).width) * 100);
  const w = (ctx.measureText(text).width * size) / 100;
  return { cx: r.left + w / 2, cy: r.top + size * 0.56, w };
}

/**
 * Full-screen intro video, played before the site on every full load of the
 * home page. It ends holding the pixel wordmark, which then glides down into
 * the hero's own wordmark while the page fades in around it. Skippable; fades
 * out if the video fails or cannot autoplay. Reduced motion skips it.
 */
export function Intro({
  onClose,
  onGone,
}: {
  /** The video ended or was skipped; the exit starts. */
  onClose: () => void;
  /** The exit finished; nothing of the intro is left. */
  onGone: () => void;
}) {
  const reduce = useReducedMotion();
  const back = useRef<HTMLCanvasElement>(null);
  const front = useRef<HTMLDivElement>(null);
  const skip = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(!reduce);
  const [leaving, setLeaving] = useState(false);
  const [started, setStarted] = useState(false);

  /** `morph`: the video finished, so glide into the hero. Otherwise just fade. */
  const close = useCallback(
    (morph: boolean) => {
      if (leaving) return;
      setLeaving(true);
      onClose();
      const done = () => {
        setOpen(false);
        onGone();
      };
      const mark = morph ? heroMark() : undefined;
      const root = document.documentElement;
      if (!back.current || !front.current || !mark) {
        const fade = { duration: duration.slow, ease };
        delete root.dataset.intro;
        void animate(back.current ?? document.body, { opacity: 0 }, fade);
        void animate(front.current ?? document.body, { opacity: 0 }, fade).then(
          done,
        );
        return;
      }
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const s0 = Math.min(vw / FRAME.w, vh / FRAME.h);
      // Where the video's wordmark is on screen now, and the scale and shift that land it on the hero's.
      const cx = (vw - FRAME.w * s0) / 2 + (MARK.x + MARK.w / 2) * s0;
      const cy = (vh - FRAME.h * s0) / 2 + (MARK.y + MARK.h / 2) * s0;
      const k = mark.w / (MARK.w * s0);
      const x = mark.cx - (vw / 2 + k * (cx - vw / 2));
      const y = mark.cy - (vh / 2 + k * (cy - vh / 2));
      void animate(
        front.current,
        { x, y, scale: k },
        { duration: MORPH, ease },
      );
      // The page stays dark while the wordmark travels. When it lands, the
      // hero's own wordmark takes its place and a ripple of pixels clears the
      // dark outwards from it.
      const land = MORPH - 0.25;
      const canvas = back.current;
      const ctx = canvas.getContext('2d');
      const css = getComputedStyle(root);
      const colors = {
        bg: css.getPropertyValue('--color-bg').trim() || 'black',
        accent: css.getPropertyValue('--color-accent').trim() || 'blue',
      };
      window.setTimeout(() => {
        delete root.dataset.intro;
        const at = { x: mark.cx, y: mark.cy };
        const cells = makeCells(vw, vh, { ...at, clear: mark.w / 2 + 24 });
        void animate(0, 1, {
          duration: RIPPLE,
          ease: 'linear',
          onUpdate: (u) =>
            ctx && drawUncover(ctx, cells, vw, vh, u, colors, at),
          onComplete: done,
        });
      }, land * 1000);
      // Once the hero's own pixels are showing underneath, the video's go.
      void animate(
        front.current,
        { opacity: 0 },
        { duration: 0.3, delay: land + 0.45 },
      );
    },
    [leaving, onClose, onGone],
  );

  useEffect(() => {
    if (reduce) {
      onClose();
      onGone();
    }
  }, [reduce, onClose, onGone]);

  useLayoutEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.dataset.intro = 'on';
    // The dark cover is a canvas, so it can clear cell by cell later.
    const canvas = back.current;
    const ctx = canvas?.getContext('2d');
    const cover = () => {
      if (!canvas || !ctx) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.fillStyle =
        getComputedStyle(root).getPropertyValue('--color-bg').trim() || 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    cover();
    window.addEventListener('resize', cover);
    return () => {
      window.removeEventListener('resize', cover);
      delete root.dataset.intro;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // No scrolling the stage behind the video. Blocking input, rather than
    // hiding the scrollbar, keeps the page width (and so the hero's pixels) unchanged.
    const stop = (e: Event) => e.preventDefault();
    const keys = (e: KeyboardEvent) =>
      [
        ' ',
        'PageUp',
        'PageDown',
        'Home',
        'End',
        'ArrowUp',
        'ArrowDown',
      ].includes(e.key) && e.preventDefault();
    const opts = { passive: false } as const;
    window.addEventListener('wheel', stop, opts);
    window.addEventListener('touchmove', stop, opts);
    window.addEventListener('keydown', keys);
    return () => {
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchmove', stop);
      window.removeEventListener('keydown', keys);
    };
  }, [open]);

  useEffect(() => {
    if (!open || leaving) return;
    skip.current?.focus();
    const bail = window.setTimeout(
      () => !started && close(false),
      START_TIMEOUT,
    );
    const key = (e: KeyboardEvent) => e.key === 'Escape' && close(false);
    window.addEventListener('keydown', key);
    return () => {
      window.clearTimeout(bail);
      window.removeEventListener('keydown', key);
    };
  }, [open, leaving, started, close]);

  if (!open) return null;
  return (
    <>
      {/* The dark cover is painted in the layout effect, so the page is never seen before it. */}
      <canvas
        ref={back}
        aria-hidden="true"
        className="fixed inset-0 z-[100] size-full"
      />
      {/* Screen blend: the video's black drops out, so only its pixels travel over the page. */}
      <div
        ref={front}
        role="dialog"
        aria-label="Intro"
        className="fixed inset-0 z-[101] mix-blend-screen"
      >
        <video
          src={`${import.meta.env.BASE_URL}videos/intro.mp4`}
          className="h-full w-full object-contain"
          autoPlay
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          onPlaying={() => setStarted(true)}
          onEnded={() => close(true)}
          onError={() => close(false)}
        />
        {!leaving && (
          <button
            ref={skip}
            type="button"
            onClick={() => close(false)}
            className="absolute right-6 bottom-6 border border-ring bg-bg px-4 py-2 font-mono text-xs text-text-soft hover:text-text focus-visible:outline-2 focus-visible:outline-accent md:right-14 md:bottom-10"
          >
            Skip intro
          </button>
        )}
      </div>
    </>
  );
}
