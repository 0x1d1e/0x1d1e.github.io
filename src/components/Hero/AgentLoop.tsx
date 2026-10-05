import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

// The loop merro describes: backlog to reviewed, merged PR with sandboxed workers.
const LINES = [
  { k: 'backlog', v: 'item picked' },
  { k: 'worker', v: 'sandbox up, branch checked out' },
  { k: 'worker', v: 'change written, tests run' },
  { k: 'review', v: 'agent review passed' },
  { k: 'merge', v: 'PR merged', done: true },
];

const STEP_MS = 900;
const HOLD_MS = 2800;

/** Decorative looping terminal. Static (all lines) under reduced motion. */
export function AgentLoop() {
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(
      () => setN((c) => (c >= LINES.length ? 0 : c + 1)),
      n === LINES.length ? HOLD_MS : STEP_MS,
    );
    return () => clearTimeout(t);
  }, [n, reduce]);

  const shown = reduce ? LINES.length : n;

  return (
    <figure
      aria-label="Illustration of an agent loop: backlog, worker, review, merge"
      className="w-full max-w-md bg-card p-5 font-mono text-xs ring-1 ring-ring"
    >
      <div aria-hidden="true">
        <p className="text-muted">$ merro run</p>
        <ul className="mt-3 flex min-h-28 flex-col gap-1.5">
          {LINES.slice(0, shown).map((l, i) => (
            <li
              key={i}
              className={`flex gap-3 ${l.done ? 'text-success' : 'text-text-soft'}`}
            >
              <span className="w-16 shrink-0 text-muted">{l.k}</span>
              {l.v}
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="mt-4 text-muted">
        Illustration of merro&apos;s flow, not a live run.
      </figcaption>
    </figure>
  );
}
