import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

type P = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
};

const MAX_SIZE = 190;
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
    const pointer = { x: -1e4, y: -1e4 };
    let w = 0;
    let h = 0;

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
      for (const p of ps) {
        if (!reduce) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
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

    function onMove(e: PointerEvent) {
      const r = el!.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    }

    document.fonts
      .load(`600 100px ${family}`)
      .catch(() => undefined)
      .then(() => !dead && start());
    const ro = new ResizeObserver(() => !dead && start());
    ro.observe(box);
    if (!reduce) window.addEventListener('pointermove', onMove);
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
    };
  }, [text, reduce]);

  return (
    <span ref={wrap} className="block w-full">
      <span className={mode === 'fallback' ? '' : 'sr-only'}>{text}</span>
      <canvas
        ref={canvas}
        aria-hidden="true"
        className={mode === 'canvas' ? 'block w-full' : 'hidden'}
      />
    </span>
  );
}
