import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { usePageActive } from '../../motion/PageContext';
import { AgentRects } from '../Agent/Agent';

const SCALE = 4;
const STATIONS = [
  { label: 'idea', x: 20 },
  { label: 'prototype', x: 160 },
  { label: 'verify', x: 300 },
];
const BINS = {
  keep: { label: 'keep', x: 470, y: 36 },
  drop: { label: 'archive', x: 470, y: 150 },
};
// Three ideas per loop: experiments are allowed to fail.
const OUTCOMES: ('keep' | 'drop')[] = ['keep', 'drop', 'keep'];
const PHASES = 4; // idea, prototype, verify, shelf
const STEPS = OUTCOMES.length * PHASES;
const STEP_MS = 1100;
const HOLD_MS = 2600;
const SAID = ['an idea', 'build it', 'does it hold up?'];

/** An agent taking ideas through build and verify; some are kept, some archived. Decorative. */
export function BuildLoop() {
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

  const cycle = Math.floor(step / PHASES);
  const phase = step % PHASES;
  const outcome = OUTCOMES[cycle]!;
  const shelved = (o: 'keep' | 'drop') =>
    OUTCOMES.filter(
      (x, i) => x === o && (i < cycle || (i === cycle && phase === 3)),
    ).length;
  const kept = shelved('keep');
  const archived = shelved('drop');

  const target =
    phase < 3
      ? { x: STATIONS[phase]!.x + 38, y: 60 }
      : { x: BINS[outcome].x + 28, y: BINS[outcome].y - 40 };
  const said =
    phase < 3
      ? SAID[phase]!
      : outcome === 'keep'
        ? 'worth keeping'
        : 'archive it';
  const bob = reduce ? undefined : 'animate-bob';

  return (
    <figure
      aria-label="Illustration of how we work: an agent takes ideas through prototype and verify, keeping the useful ones"
      className="w-full bg-card p-4 font-mono ring-1 ring-ring transition-colors duration-300 hover:ring-accent"
    >
      <svg viewBox="0 0 560 250" aria-hidden="true" className="w-full">
        <line
          x1="68"
          x2="320"
          y1="128"
          y2="128"
          className="stroke-ring"
          strokeWidth="1.5"
        />
        <path
          d="M376 128 H 430 V 70 H 470 M430 128 V 180 H 470"
          className="fill-none stroke-ring"
          strokeWidth="1.5"
        />
        {STATIONS.map((s, i) => (
          <g key={s.label}>
            <rect
              x={s.x}
              y="104"
              width="76"
              height="48"
              strokeWidth="1.5"
              className={`fill-bg transition-colors duration-300 ${phase === i ? 'stroke-accent' : 'stroke-ring'}`}
            />
            <text
              x={s.x + 28}
              y="133"
              textAnchor="middle"
              fontSize="13"
              className="fill-text-soft"
            >
              {s.label}
            </text>
          </g>
        ))}
        {(Object.keys(BINS) as ('keep' | 'drop')[]).map((k) => {
          const b = BINS[k];
          const n = k === 'keep' ? kept : archived;
          const hit = phase === 3 && outcome === k;
          return (
            <g key={k}>
              <rect
                x={b.x}
                y={b.y}
                width="70"
                height="68"
                strokeWidth="1.5"
                strokeDasharray={k === 'drop' ? '4 4' : undefined}
                className={`fill-bg transition-colors duration-300 ${hit ? (k === 'keep' ? 'stroke-success' : 'stroke-accent') : 'stroke-ring'}`}
              />
              <text
                x={b.x + 35}
                y={b.y + 18}
                textAnchor="middle"
                fontSize="13"
                className={k === 'keep' ? 'fill-success' : 'fill-muted'}
              >
                {b.label}
              </text>
              {Array.from({ length: n }, (_, i) => (
                <rect
                  key={i}
                  x={b.x + 12 + i * 20}
                  y={b.y + 34}
                  width="14"
                  height="14"
                  className={k === 'keep' ? 'fill-success' : 'fill-chip'}
                />
              ))}
            </g>
          );
        })}

        <g
          className="transition-transform duration-700 ease-out"
          style={{
            transform: `translate(${target.x - 5 * SCALE}px, ${target.y}px)`,
          }}
        >
          <g style={{ transform: `scale(${SCALE})` }}>
            <g className={bob}>
              <AgentRects variant="worker" />
            </g>
          </g>
          {phase > 0 && phase < 3 && (
            <rect x="36" y="6" width="10" height="10" className="fill-accent" />
          )}
          <text
            x="20"
            y="-8"
            textAnchor="middle"
            fontSize="13"
            className="fill-accent"
          >
            {said}
          </text>
        </g>
      </svg>
      <p aria-hidden="true" className="mt-2 text-xs text-text-soft">
        <span className="text-muted">$ </span>
        kept {kept} · archived {archived}
      </p>
      <figcaption className="mt-3 text-xs text-muted">
        Illustration of how we work, not a live run.
      </figcaption>
    </figure>
  );
}
