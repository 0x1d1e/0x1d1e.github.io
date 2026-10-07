import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { addLogoSource } from '../../motion/logoSource';
import { NO_POINTER, trackPointer } from '../../motion/pointer';

type P = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
};

// Grows with the column it sits in, up to this (wide screens get a bigger wordmark).
const MAX_SIZE = 320;
const PUSH_RADIUS = 90;

/**
 * The headline as pixels: particles scatter in, assemble into the text, and
 * scatter away from the pointer. Falls back to plain text without canvas.
 * Colors and font come from theme tokens.
 */
export function PixelWordmark({ text }: { text: string }) {
  const wrap = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<'pending' | 'canvas' | 'fallback'>(
    'pending',
  );

  useEffect(() => {
    const el = canvas.current;
    const box = wrap.current;
    const ctx = el?.getContext('2d');
    if (!el || !box || !ctx) {
      setMode('fallback');
      return;
    }
    const css = getComputedStyle(document.documentElement);
    const fg = css.getPropertyValue('--color-text').trim() || 'white';
    const accent = css.getPropertyValue('--color-accent').trim() || 'blue';
    const family =
      css.getPropertyValue('--font-display').trim() || 'sans-serif';

    let raf = 0;
    let dead = false;
    let ps: P[] = [];
    let step = 4;
    const tracker = reduce ? undefined : trackPointer();
    let w = 0;
    let h = 0;
    // The page transition scatters this wordmark's pixels: where they are now, and how to hide it.
    const removeSource = addLogoSource({
      read: () => {
        const r = el.getBoundingClientRect();
        return ps.map((q) => ({
          x: r.left + q.tx,
          y: r.top + q.ty,
          size: step - 1,
        }));
      },
      hide: (hidden) => {
        el.style.opacity = hidden ? '0' : '';
      },
    });

    function build() {
      w = box!.clientWidth;
      if (!w) return;
      const probe = document.createElement('canvas').getContext('2d');
      if (!probe) return;
      probe.font = `600 100px ${family}`;
      const size = Math.min(
        MAX_SIZE,
        (w / probe.measureText(text).width) * 100,
      );
      h = Math.ceil(size * 1.15);
      const dpr = window.devicePixelRatio || 1;
      el!.width = w * dpr;
      el!.height = h * dpr;
      el!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const off = document.createElement('canvas');
      off.width = w;
      off.height = h;
      const o = off.getContext('2d', { willReadFrequently: true });
      if (!o) return;
      o.font = `600 ${size}px ${family}`;
      o.textBaseline = 'alphabetic';
      o.fillText(text, 0, size * 0.92);
      const data = o.getImageData(0, 0, w, h).data;
      step = Math.max(3, Math.round(size / 34));
      ps = [];
      for (let y = 0; y < h; y += step)
        for (let x = 0; x < w; x += step)
          if ((data[(y * w + x) * 4 + 3] ?? 0) > 128)
            ps.push({
              tx: x,
              ty: y,
              x: reduce ? x : Math.random() * w,
              y: reduce ? y : Math.random() * h * 2 - h * 0.5,
              vx: 0,
              vy: 0,
            });
    }

    function frame() {
      ctx!.clearRect(0, 0, w, h);
      const s = step - 1;
      // Pointer in canvas coordinates; far away when nothing is touching.
      const r = el!.getBoundingClientRect();
      const px =
        tracker && tracker.p.x > NO_POINTER ? tracker.p.x - r.left : NO_POINTER;
      const py =
        tracker && tracker.p.y > NO_POINTER ? tracker.p.y - r.top : NO_POINTER;
      for (const p of ps) {
        if (!reduce) {
          const dx = p.x - px;
          const dy = p.y - py;
          const d = Math.hypot(dx, dy);
          if (d < PUSH_RADIUS && d > 0) {
            const f = (1 - d / PUSH_RADIUS) * 5;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
          p.vx = (p.vx + (p.tx - p.x) * 0.06) * 0.82;
          p.vy = (p.vy + (p.ty - p.y) * 0.06) * 0.82;
          p.x += p.vx;
          p.y += p.vy;
        }
        const away = Math.hypot(p.x - p.tx, p.y - p.ty) > 3;
        ctx!.fillStyle = away ? accent : fg;
        ctx!.fillRect(p.x, p.y, s, s);
      }
      if (!reduce) raf = requestAnimationFrame(frame);
    }

    function start() {
      cancelAnimationFrame(raf);
      build();
      if (!ps.length) return;
      setMode('canvas');
      frame();
    }

    document.fonts
      .load(`600 100px ${family}`)
      .catch(() => undefined)
      .then(() => !dead && start());
    // Only a real width change rebuilds; otherwise the assembled pixels stay put.
    const ro = new ResizeObserver(
      () => !dead && box.clientWidth !== w && start(),
    );
    ro.observe(box);
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      tracker?.stop();
      removeSource();
    };
  }, [text, reduce]);

  return (
    <span ref={wrap} className="block w-full">
      <span className={mode === 'fallback' ? '' : 'sr-only'}>{text}</span>
      <canvas
        ref={canvas}
        aria-hidden="true"
        // pan-y: a horizontal drag keeps the pointer stream (and the effect); a vertical one scrolls.
        className={mode === 'canvas' ? 'block w-full touch-pan-y' : 'hidden'}
      />
    </span>
  );
}
