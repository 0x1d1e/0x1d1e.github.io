import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { usePageActive } from '../../motion/PageContext';
import { AgentRects } from '../Agent/Agent';

const STATIONS = ['backlog', 'plan', 'worker', 'review', 'merge'];
const CX = (i: number) => 56 + i * 112;
const SCALE = 4;

// Illustrative scenes of an agent workflow: a worker takes a change from backlog
// to a reviewed, merged PR while an independent reviewer checks it.
const SCENES = [
  {
    worker: 0,
    reviewer: false,
    said: 'picks an item',
    log: 'backlog   item picked',
  },
  {
    worker: 1,
    reviewer: false,
    said: 'plans, asks approval',
    log: 'plan      approved once',
  },
  {
    worker: 2,
    reviewer: false,
    said: 'writes the change',
    log: 'worker    change written in sandbox',
  },
  {
    worker: 2,
    reviewer: false,
    said: 'runs the tests',
    log: 'worker    tests run',
  },
  {
    worker: 2,
    reviewer: true,
    said: 'waits for review',
    log: 'review    independent reviewer checks it',
  },
  { worker: 4, reviewer: true, said: 'PR merged', log: 'merge     PR merged' },
];
const STEP_MS = 1700;
const HOLD_MS = 3000;

/** Two pixel agents walking a change through an agent pipeline. Decorative. */
export function PipelineAgents() {
  const reduce = useReducedMotion();
  const active = usePageActive();
  const [step, setStep] = useState(reduce ? SCENES.length - 1 : 0);

  useEffect(() => {
    if (reduce || !active) return;
    const t = setTimeout(
      () => setStep((s) => (s + 1) % SCENES.length),
      step === SCENES.length - 1 ? HOLD_MS : STEP_MS,
    );
    return () => clearTimeout(t);
  }, [step, reduce, active]);

  const s = SCENES[step]!;
  const merged = step === SCENES.length - 1;
  const bob = reduce ? undefined : 'animate-bob';

  return (
    <figure className="w-full bg-card p-4 font-mono ring-1 ring-ring transition-colors duration-300 hover:ring-accent">
      <svg
        viewBox="0 0 560 220"
        role="img"
        aria-label="Diagram: a worker agent takes a change from backlog through plan, sandboxed work and independent review to a merged pull request."
        className="w-full"
      >
        <line
          x1={CX(0)}
          x2={CX(4)}
          y1="130"
          y2="130"
          className="stroke-ring"
          strokeWidth="1.5"
        />
        <rect
          x={CX(2) - 50}
          y="92"
          width="100"
          height="76"
          strokeDasharray="4 4"
          className="fill-none stroke-muted"
          strokeWidth="1"
        />
        {STATIONS.map((name, i) => {
          const on =
            i === s.worker || (i === 3 && s.reviewer) || (i === 4 && merged);
          return (
            <g key={name}>
              <rect
                x={CX(i) - 28}
                y="108"
                width="56"
                height="44"
                className={`fill-bg transition-colors duration-300 ${i === 4 && merged ? 'stroke-success' : on ? 'stroke-accent' : 'stroke-ring'}`}
                strokeWidth="1.5"
              />
              <text
                x={CX(i)}
                y="135"
                textAnchor="middle"
                fontSize="11"
                className={
                  i === 4 && merged ? 'fill-success' : 'fill-text-soft'
                }
              >
                {name}
              </text>
            </g>
          );
        })}
        <text
          x={CX(2)}
          y="188"
          textAnchor="middle"
          fontSize="10"
          className="fill-muted"
        >
          sandbox
        </text>

        {/* reviewer */}
        <g
          className="transition-[transform,opacity] duration-700"
          style={{
            transform: `translate(${CX(3) - 5 * SCALE}px, 36px) scale(${SCALE})`,
            opacity: s.reviewer ? 1 : 0,
          }}
        >
          <g className={bob}>
            <AgentRects variant="reviewer" />
          </g>
        </g>
        {/* worker */}
        <g
          className="transition-transform duration-700 ease-out"
          style={{
            transform: `translate(${CX(s.worker) - 5 * SCALE}px, 36px) scale(${SCALE})`,
          }}
        >
          <g className={bob}>
            <AgentRects
              variant="worker"
              body={merged ? 'fill-success' : 'fill-text'}
            />
          </g>
        </g>
        <text
          x={CX(s.worker)}
          y="22"
          textAnchor="middle"
          fontSize="11"
          className="fill-accent"
        >
          {s.said}
        </text>
      </svg>
      <p aria-hidden="true" className="mt-2 text-xs text-text-soft">
        <span className="text-muted">$ </span>
        {s.log}
      </p>
      <figcaption className="mt-3 text-xs text-muted">
        Illustration of an agent workflow, not a live run.
      </figcaption>
    </figure>
  );
}
