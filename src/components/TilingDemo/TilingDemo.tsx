import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { usePageActive } from '../../motion/PageContext';

type Rect = { l: number; t: number; w: number; h: number };
const GAP = 1.5; // percent

// Tiling layouts for three windows; the stage cycles through them and moves focus.
const LAYOUTS: Rect[][] = [
  [
    { l: 0, t: 0, w: 50, h: 100 },
    { l: 50, t: 0, w: 50, h: 50 },
    { l: 50, t: 50, w: 50, h: 50 },
  ],
  [
    { l: 0, t: 0, w: 50, h: 50 },
    { l: 0, t: 50, w: 50, h: 50 },
    { l: 50, t: 0, w: 50, h: 100 },
  ],
  [
    { l: 0, t: 0, w: 33.3, h: 100 },
    { l: 33.3, t: 0, w: 33.4, h: 100 },
    { l: 66.7, t: 0, w: 33.3, h: 100 },
  ],
  [
    { l: 0, t: 0, w: 100, h: 50 },
    { l: 0, t: 50, w: 50, h: 50 },
    { l: 50, t: 50, w: 50, h: 50 },
  ],
];
const TITLES = ['terminal', 'editor', 'browser'];
const STEP_MS = 2200;

/** Windows tiling and re-tiling on a desktop. Generic, decorative. */
export function TilingDemo() {
  const reduce = useReducedMotion();
  const active = usePageActive();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduce || !active) return;
    const id = setInterval(() => setStep((s) => s + 1), STEP_MS);
    return () => clearInterval(id);
  }, [reduce, active]);

  const layout = LAYOUTS[step % LAYOUTS.length]!;
  const focus = step % 3;

  return (
    <figure
      aria-label="Illustration of desktop windows tiling and rearranging"
      className="w-full bg-card p-4 font-mono ring-1 ring-ring transition-colors duration-300 hover:ring-accent"
    >
      <div aria-hidden="true" className="relative h-64 overflow-hidden bg-bg">
        {layout.map((r, i) => (
          <div
            key={i}
            className={`absolute flex flex-col bg-card ring-1 transition-all duration-700 ease-out ${focus === i ? 'ring-accent' : 'ring-ring'}`}
            style={{
              left: `${r.l + GAP / 2}%`,
              top: `${r.t + GAP / 2}%`,
              width: `${r.w - GAP}%`,
              height: `${r.h - GAP}%`,
            }}
          >
            <div className="flex items-center gap-1.5 border-b border-ring px-2 py-1 text-[10px] text-muted">
              <span
                className={`size-1.5 ${focus === i ? 'bg-accent' : 'bg-chip'}`}
              />
              {TITLES[i]}
            </div>
            <div className="flex flex-1 flex-col gap-1.5 p-2">
              <span className="h-1 w-3/4 bg-chip" />
              <span className="h-1 w-1/2 bg-chip" />
              <span className="h-1 w-2/3 bg-chip" />
            </div>
          </div>
        ))}
      </div>
      <figcaption className="mt-3 text-xs text-muted">
        Illustration of a tiling desktop, not a screenshot.
      </figcaption>
    </figure>
  );
}
