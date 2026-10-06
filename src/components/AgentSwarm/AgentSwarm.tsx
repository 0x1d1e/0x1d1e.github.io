import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { usePageActive } from '../../motion/PageContext';
import { AgentRects, type AgentVariant } from '../Agent/Agent';

const CELL = 40;
type Cell = [number, number];

// Each agent walks its own route over a task grid; a task completes when an agent reaches it.
const AGENTS: { variant: AgentVariant; route: Cell[] }[] = [
  {
    variant: 'worker',
    route: [
      [1, 1],
      [3, 1],
      [3, 3],
      [5, 3],
      [5, 3],
      [7, 3],
      [7, 5],
      [7, 5],
    ],
  },
  {
    variant: 'reviewer',
    route: [
      [12, 1],
      [11, 1],
      [10, 3],
      [10, 3],
      [9, 5],
      [8, 5],
      [8, 5],
      [12, 5],
    ],
  },
  {
    variant: 'worker',
    route: [
      [5, 1],
      [5, 1],
      [6, 1],
      [7, 1],
      [7, 1],
      [6, 3],
      [5, 5],
      [5, 5],
    ],
  },
];
const TASKS: Cell[] = [
  [3, 3],
  [7, 5],
  [10, 3],
  [8, 5],
  [7, 1],
  [5, 5],
];
const STEPS = 8;
const STEP_MS = 800;
const HOLD_MS = 2200;

/** Several pixel agents working through tasks on a grid. Generic, decorative. */
export function AgentSwarm() {
  const reduce = useReducedMotion();
  const active = usePageActive();
  const [step, setStep] = useState(reduce ? STEPS - 1 : 0);

  useEffect(() => {
    if (reduce || !active) return;
    const t = setTimeout(
      () => setStep((s) => (s + 1) % STEPS),
      step === STEPS - 1 ? HOLD_MS : STEP_MS,
    );
    return () => clearTimeout(t);
  }, [step, reduce, active]);

  const done = (t: Cell) =>
    AGENTS.some((a) =>
      a.route.slice(0, step + 1).some(([c, r]) => c === t[0] && r === t[1]),
    );
  const finished = TASKS.filter(done).length;

  return (
    <figure
      aria-label="Illustration of several agents completing tasks on a grid"
      className="w-full bg-card p-4 font-mono ring-1 ring-ring transition-colors duration-300 hover:ring-accent"
    >
      <svg viewBox="0 0 560 280" aria-hidden="true" className="w-full">
        {Array.from({ length: 14 * 7 }, (_, k) => (
          <rect
            key={k}
            x={(k % 14) * CELL + CELL / 2 - 1}
            y={Math.floor(k / 14) * CELL + CELL / 2 - 1}
            width="2"
            height="2"
            className="fill-chip"
          />
        ))}
        {TASKS.map(([c, r]) => (
          <g key={`${c}-${r}`}>
            <rect
              x={c * CELL + 8}
              y={r * CELL + 8}
              width={CELL - 16}
              height={CELL - 16}
              strokeWidth="1.5"
              className={`transition-colors duration-300 ${done([c, r]) ? 'fill-bg stroke-success' : 'fill-bg stroke-muted'}`}
              strokeDasharray={done([c, r]) ? undefined : '3 3'}
            />
            {done([c, r]) && (
              <text
                x={c * CELL + CELL / 2}
                y={r * CELL + CELL / 2 + 4}
                textAnchor="middle"
                fontSize="12"
                className="fill-success"
              >
                ✓
              </text>
            )}
          </g>
        ))}
        {AGENTS.map((a, i) => {
          const [c, r] = a.route[step]!;
          return (
            <g
              key={i}
              className="transition-transform duration-700 ease-out"
              style={{
                transform: `translate(${c * CELL + 5}px, ${r * CELL + 5}px) scale(3)`,
              }}
            >
              <g className={reduce ? undefined : 'animate-bob'}>
                <AgentRects variant={a.variant} />
              </g>
            </g>
          );
        })}
      </svg>
      <p aria-hidden="true" className="mt-2 text-xs text-text-soft">
        <span className="text-muted">$ </span>
        {finished}/{TASKS.length} tasks done
      </p>
      <figcaption className="mt-3 text-xs text-muted">
        Illustration of agents working in parallel, not a live run.
      </figcaption>
    </figure>
  );
}
