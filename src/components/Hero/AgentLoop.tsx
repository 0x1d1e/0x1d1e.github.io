import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { usePageActive } from '../../motion/PageContext';
import { Agent } from '../Agent/Agent';

// A generic coding-agent loop: backlog to reviewed, merged PR with sandboxed workers.
const LINES = [
  { k: 'backlog', v: 'item picked' },
  { k: 'worker', v: 'sandbox up, branch checked out' },
  { k: 'worker', v: 'change written, tests run' },
  { k: 'review', v: 'agent review passed' },
  { k: 'merge', v: 'PR merged', done: true },
];

const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const STEP_MS = 1100;
const HOLD_MS = 2800;

/** Decorative looping terminal. Static (all lines) under reduced motion. */
export function AgentLoop() {
  const reduce = useReducedMotion();
  const active = usePageActive();
  // n = lines finished; line n is "running" with a spinner.
  const [n, setN] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduce || !active) return;
    const t = setTimeout(
      () => setN((c) => (c >= LINES.length ? 0 : c + 1)),
      n === LINES.length ? HOLD_MS : STEP_MS,
    );
    return () => clearTimeout(t);
  }, [n, reduce, active]);

  useEffect(() => {
    if (reduce || !active) return;
    const id = setInterval(() => setTick((c) => c + 1), 80);
    return () => clearInterval(id);
  }, [reduce, active]);

  const finished = reduce ? LINES.length : n;
  const running = !reduce && n < LINES.length ? LINES[n] : undefined;

  return (
    <figure
      aria-label="Illustration of an agent loop: backlog, worker, review, merge"
      className="w-full max-w-md bg-card p-5 font-mono text-xs ring-1 ring-ring transition-colors duration-300 hover:ring-accent"
    >
      <div aria-hidden="true">
        <p className="flex items-center gap-2 text-muted">
          <Agent className="size-5" />
          $ agent run
          <span className="ml-1 inline-block h-3 w-1.5 animate-blink bg-accent align-middle" />
        </p>
        <ul className="mt-3 flex min-h-36 flex-col gap-1.5">
          {LINES.slice(0, finished).map((l, i) => (
            <li
              key={i}
              className={`flex gap-3 ${l.done ? 'text-success' : 'text-text-soft'}`}
            >
              <span className="w-4 shrink-0 text-success">✓</span>
              <span className="w-16 shrink-0 text-muted">{l.k}</span>
              {l.v}
            </li>
          ))}
          {running && (
            <li className="flex gap-3 text-accent">
              <span className="w-4 shrink-0">
                {SPINNER[tick % SPINNER.length]}
              </span>
              <span className="w-16 shrink-0">{running.k}</span>
              working
            </li>
          )}
        </ul>
      </div>
      <figcaption className="mt-4 text-muted">
        Illustration of an agent loop, not a live run.
      </figcaption>
    </figure>
  );
}
