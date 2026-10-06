import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { usePageActive } from '../../motion/PageContext';

// Ticks: train (curve draws), eval (bars fill), deploy (rolls out), then a hold.
const TRAIN = 12;
const EVAL = 4;
const DEPLOY = 3;
const HOLD = 8;
const TOTAL = TRAIN + EVAL + DEPLOY + HOLD;
const TICK_MS = 280;

// A made-up loss curve: decays with a little noise.
const LOSS = Array.from({ length: TRAIN + 1 }, (_, i) => {
  const base = 1 - 0.82 * (1 - Math.exp(-i / 3.2));
  return base + (i % 3 === 1 ? 0.04 : 0) - (i % 4 === 3 ? 0.02 : 0);
});
const BARS = [0.55, 0.72, 0.62, 0.86];

const COL = [28, 214, 400];
const W = 152;

/** Train, eval, deploy as a loop: curve draws, bars fill, endpoint goes live. Decorative. */
export function TrainEvalDeploy() {
  const reduce = useReducedMotion();
  const active = usePageActive();
  const [t, setT] = useState(reduce ? TOTAL - 1 : 0);

  useEffect(() => {
    if (reduce || !active) return;
    const id = setInterval(() => setT((x) => (x + 1) % TOTAL), TICK_MS);
    return () => clearInterval(id);
  }, [reduce, active]);

  const trained = Math.min(t, TRAIN);
  const evaled = Math.min(Math.max(t - TRAIN, 0), EVAL);
  const deployT = Math.min(Math.max(t - TRAIN - EVAL, 0), DEPLOY);
  const stage = t < TRAIN ? 0 : t < TRAIN + EVAL ? 1 : 2;
  const live = deployT >= DEPLOY;

  const px = (i: number) => COL[0]! + 14 + (i / TRAIN) * (W - 28);
  const py = (v: number) => 60 + (1 - v) * 90;
  const points = LOSS.slice(0, trained + 1)
    .map((v, i) => `${px(i)},${py(v)}`)
    .join(' ');

  const title = (i: number, label: string) => (
    <text
      x={COL[i]! + 12}
      y="34"
      fontSize="11"
      className={`transition-colors duration-300 ${stage === i ? 'fill-accent' : 'fill-muted'}`}
    >
      {String(i + 1).padStart(2, '0')} {label}
    </text>
  );
  const frame = (i: number) => (
    <rect
      x={COL[i]}
      y="16"
      width={W}
      height="196"
      strokeWidth="1.5"
      className={`fill-bg transition-colors duration-300 ${stage === i ? 'stroke-accent' : 'stroke-ring'}`}
    />
  );

  return (
    <figure
      aria-label="Illustration of a model being trained, evaluated, and deployed"
      className="w-full bg-card p-4 font-mono ring-1 ring-ring transition-colors duration-300 hover:ring-accent"
    >
      <svg viewBox="0 0 560 230" aria-hidden="true" className="w-full">
        {[0, 1, 2].map((i) => (
          <g key={i}>{frame(i)}</g>
        ))}
        {title(0, 'train')}
        {title(1, 'eval')}
        {title(2, 'deploy')}

        {/* train: loss curve */}
        <line
          x1={COL[0]! + 14}
          x2={COL[0]! + 14}
          y1="56"
          y2="156"
          className="stroke-ring"
        />
        <line
          x1={COL[0]! + 14}
          x2={COL[0]! + W - 14}
          y1="156"
          y2="156"
          className="stroke-ring"
        />
        <polyline
          points={points}
          className="fill-none stroke-accent"
          strokeWidth="2"
        />
        <text x={COL[0]! + 14} y="182" fontSize="10" className="fill-muted">
          loss
        </text>
        <text
          x={COL[0]! + W - 14}
          y="182"
          fontSize="10"
          textAnchor="end"
          className="fill-muted"
        >
          step {Math.round((trained / TRAIN) * 100) * 10}
        </text>

        {/* eval: bars */}
        {BARS.map((v, i) => {
          const h = (i < evaled ? v : 0) * 100;
          return (
            <rect
              key={i}
              x={COL[1]! + 20 + i * 32}
              y={156 - h}
              width="20"
              height={h}
              className="fill-success transition-all duration-300"
            />
          );
        })}
        <line
          x1={COL[1]! + 14}
          x2={COL[1]! + W - 14}
          y1="156"
          y2="156"
          className="stroke-ring"
        />
        <text x={COL[1]! + 14} y="182" fontSize="10" className="fill-muted">
          held-out evals
        </text>

        {/* deploy: endpoint */}
        <rect
          x={COL[2]! + 24}
          y="76"
          width={W - 48}
          height="60"
          strokeWidth="1.5"
          className={`fill-bg transition-colors duration-300 ${live ? 'stroke-success' : 'stroke-ring'}`}
        />
        <text
          x={COL[2]! + W / 2}
          y="102"
          fontSize="11"
          textAnchor="middle"
          className="fill-text-soft"
        >
          endpoint
        </text>
        <rect
          x={COL[2]! + W / 2 - 4}
          y="114"
          width="8"
          height="8"
          className={`transition-colors duration-300 ${live ? 'fill-success' : deployT > 0 ? 'fill-accent' : 'fill-chip'}`}
        />
        <text
          x={COL[2]! + W / 2}
          y="182"
          fontSize="10"
          textAnchor="middle"
          className="fill-muted"
        >
          {live ? 'live' : deployT > 0 ? 'rolling out' : 'idle'}
        </text>
      </svg>
      <figcaption className="mt-3 text-xs text-muted">
        Illustration of a training loop, not real results.
      </figcaption>
    </figure>
  );
}
