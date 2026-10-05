import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

const CELL = 8;
const DENSITY = 1 / 140; // fraction of cells that hold a twinkling pixel
const GLYPHS = ['0', '1', 'x', '{', '}', '<', '/', '#'];
const RADIUS = 110;

type Px = {
  x: number;
  y: number;
  phase: number;
  speed: number;
  glyph?: string;
};

/**
 * Fixed backdrop: sparse twinkling pixels and code glyphs; pixels near the
 * pointer light up in the accent color. Colors come from theme tokens.
 * Reduced motion: drawn once, no loop, no pointer tracking.
 */
export function PixelField() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const css = getComputedStyle(document.documentElement);
    const muted = css.getPropertyValue('--color-muted').trim() || 'gray';
    const accent = css.getPropertyValue('--color-accent').trim() || 'blue';
    const mono = css.getPropertyValue('--font-mono').trim() || 'monospace';

    let w = 0;
    let h = 0;
    let px: Px[] = [];
    const pointer = { x: -1e4, y: -1e4 };
    let raf = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.ceil(w / CELL);
      const rows = Math.ceil(h / CELL);
      const count = Math.floor(cols * rows * DENSITY);
      px = Array.from({ length: count }, () => ({
        x: Math.floor(Math.random() * cols) * CELL,
        y: Math.floor(Math.random() * rows) * CELL,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.2,
        glyph:
          Math.random() < 0.3
            ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
            : undefined,
      }));
    }

    function draw(t: number) {
      ctx!.clearRect(0, 0, w, h);
      ctx!.font = `11px ${mono}`;
      ctx!.textBaseline = 'top';
      for (const p of px) {
        const near = Math.hypot(p.x - pointer.x, p.y - pointer.y) < RADIUS;
        const twinkle = (Math.sin((t / 1000) * p.speed + p.phase) + 1) / 2;
        ctx!.fillStyle = near ? accent : muted;
        ctx!.globalAlpha = near ? 0.4 + twinkle * 0.6 : 0.06 + twinkle * 0.22;
        if (p.glyph) ctx!.fillText(p.glyph, p.x, p.y);
        else ctx!.fillRect(p.x, p.y, CELL - 3, CELL - 3);
      }
      // Pointer trail: grid-snapped squares that fall off with distance.
      ctx!.fillStyle = accent;
      const gx = Math.floor(pointer.x / CELL) * CELL;
      const gy = Math.floor(pointer.y / CELL) * CELL;
      for (let dx = -6; dx <= 6; dx++) {
        for (let dy = -6; dy <= 6; dy++) {
          const d = Math.hypot(dx, dy);
          if (d > 6 || Math.random() < d / 8) continue;
          ctx!.globalAlpha = (1 - d / 6) * 0.25;
          ctx!.fillRect(gx + dx * CELL, gy + dy * CELL, CELL - 3, CELL - 3);
        }
      }
      ctx!.globalAlpha = 1;
    }

    function loop(t: number) {
      draw(t);
      raf = requestAnimationFrame(loop);
    }
    function onMove(e: PointerEvent) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    }
    function onLeave() {
      pointer.x = pointer.y = -1e4;
    }

    resize();
    window.addEventListener('resize', resize);
    if (reduce) {
      draw(0);
      return () => window.removeEventListener('resize', resize);
    }
    window.addEventListener('pointermove', onMove);
    document.documentElement.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [reduce]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 size-full"
    />
  );
}
