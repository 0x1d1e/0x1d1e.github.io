import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { usePageActive } from '../../motion/PageContext';

const SCENES = [
  { open: false, ready: false },
  { open: true, ready: false },
  { open: true, ready: true },
  { open: false, ready: false },
];
const STEP_MS = [2200, 1500, 2600, 1200];
const APPS = ['Terminal', 'Browser', 'Files'];

/** Concept of a top-center island that expands into a launcher. Decorative. */
export function IslandDemo({ name = 'island' }: { name?: string }) {
  const reduce = useReducedMotion();
  const active = usePageActive();
  const [step, setStep] = useState(reduce ? 2 : 0);

  useEffect(() => {
    if (reduce || !active) return;
    const t = setTimeout(
      () => setStep((s) => (s + 1) % SCENES.length),
      STEP_MS[step],
    );
    return () => clearTimeout(t);
  }, [step, reduce, active]);

  const s = SCENES[step]!;

  return (
    <figure
      aria-label="Concept illustration of a top-center island that expands into an app launcher"
      className="w-full bg-card p-4 font-mono ring-1 ring-ring transition-colors duration-300 hover:ring-accent"
    >
      <div
        aria-hidden="true"
        className="relative h-64 overflow-hidden bg-bg ring-1 ring-ring"
      >
        <div className="absolute top-14 left-6 h-28 w-40 ring-1 ring-ring" />
        <div className="absolute right-6 bottom-6 h-24 w-56 ring-1 ring-ring" />
        <div
          className={`absolute top-3 left-1/2 -translate-x-1/2 overflow-hidden rounded-[22px] bg-card ring-1 transition-all duration-500 ease-out ${s.open ? 'h-40 w-72 ring-accent' : 'h-8 w-32 ring-ring'}`}
        >
          <div className="flex h-8 items-center justify-center gap-2 text-xs text-text-soft">
            <span className="size-1.5 bg-accent" />
            {s.open ? 'launcher' : name}
          </div>
          <ul
            className={`flex flex-col gap-1 px-5 text-xs transition-opacity duration-300 ${s.open ? 'opacity-100' : 'opacity-0'}`}
          >
            {s.ready ? (
              APPS.map((a, i) => (
                <li
                  key={a}
                  className={`px-2 py-1 ${i === 0 ? 'bg-chip text-text' : 'text-text-soft'}`}
                >
                  {a}
                </li>
              ))
            ) : (
              <li className="px-2 py-1 text-muted">Finding apps…</li>
            )}
          </ul>
        </div>
      </div>
      <figcaption className="mt-3 text-xs text-muted">
        Concept illustration, not a capture of the current build.
      </figcaption>
    </figure>
  );
}
