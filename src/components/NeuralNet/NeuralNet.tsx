import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { usePageActive } from '../../motion/PageContext';

const LAYERS = [3, 5, 5, 2];
const X = [70, 220, 360, 490];
const SIZE = 12;
const nodeY = (layer: number, i: number) => {
  const n = LAYERS[layer]!;
  return 150 + (i - (n - 1) / 2) * 48;
};

// One epoch = a forward pass (layers 0..3), a backward pass (3..0), one idle beat.
const PER_EPOCH = LAYERS.length * 2 + 1;
const EPOCHS = 8;
const TOTAL = PER_EPOCH * EPOCHS + 8; // plus a hold before looping
const STEP_MS = 420;
// A made-up loss curve, one point per finished epoch.
const LOSS = [0.95, 0.7, 0.56, 0.45, 0.4, 0.34, 0.31, 0.28];

/** A small neural net training: signal forward, error backward, loss falling. Decorative. */
export function NeuralNet() {
  const reduce = useReducedMotion();
  const active = usePageActive();
  const [tick, setTick] = useState(reduce ? PER_EPOCH * EPOCHS - 1 : 0);

  useEffect(() => {
    if (reduce || !active) return;
    const id = setInterval(() => setTick((t) => (t + 1) % TOTAL), STEP_MS);
    return () => clearInterval(id);
  }, [reduce, active]);

  const epochIndex = Math.min(Math.floor(tick / PER_EPOCH), EPOCHS - 1);
  const pos = tick >= PER_EPOCH * EPOCHS ? PER_EPOCH - 1 : tick % PER_EPOCH;
  const forward = pos < LAYERS.length;
  const backward = pos >= LAYERS.length && pos < LAYERS.length * 2;
  const lit = forward ? pos : backward ? LAYERS.length * 2 - 1 - pos : -1;
  const fires = (layer: number, i: number) =>
    layer === lit && (i + tick) % 3 !== 2;
  // Full class names so Tailwind can see them.
  const strokeOn = backward ? 'stroke-success' : 'stroke-accent';
  const fillOn = backward ? 'fill-success' : 'fill-accent';

  // The current epoch's point appears once its backward pass starts.
  const shown = Math.min(epochIndex + (pos >= LAYERS.length ? 1 : 0), EPOCHS);
  const sx = (i: number) => 400 + (i / (EPOCHS - 1)) * 120;
  const sy = (v: number) => 62 - v * 40;
  const spark = LOSS.slice(0, shown)
    .map((v, i) => `${sx(i)},${sy(v)}`)
    .join(' ');

  return (
    <figure
      aria-label="Illustration of a neural network training: a signal passes forward, error flows back, and loss falls"
      className="w-full bg-card p-4 font-mono ring-1 ring-ring transition-colors duration-300 hover:ring-accent"
    >
      <svg viewBox="0 0 560 320" aria-hidden="true" className="w-full">
        {LAYERS.slice(0, -1).flatMap((n, l) =>
          Array.from({ length: n }, (_, i) =>
            Array.from({ length: LAYERS[l + 1]! }, (_, j) => {
              // Forward lights the edges into the firing layer; backward, the edges out of it.
              const on = forward
                ? lit === l + 1 && fires(l + 1, j)
                : backward && lit === l && fires(l, i);
              return (
                <line
                  key={`${l}-${i}-${j}`}
                  x1={X[l]! + SIZE}
                  y1={nodeY(l, i) + SIZE / 2}
                  x2={X[l + 1]!}
                  y2={nodeY(l + 1, j) + SIZE / 2}
                  strokeWidth="1"
                  className={`transition-colors duration-300 ${on ? strokeOn : 'stroke-ring'}`}
                />
              );
            }),
          ),
        )}
        {LAYERS.map((n, l) =>
          Array.from({ length: n }, (_, i) => (
            <rect
              key={`${l}-${i}`}
              x={X[l]}
              y={nodeY(l, i)}
              width={SIZE}
              height={SIZE}
              className={`transition-colors duration-300 ${fires(l, i) ? fillOn : 'fill-chip'}`}
            />
          )),
        )}
        {['input', 'hidden', 'hidden', 'output'].map((t, l) => (
          <text
            key={l}
            x={X[l]! + SIZE / 2}
            y="308"
            textAnchor="middle"
            fontSize="18"
            className="fill-muted"
          >
            {t}
          </text>
        ))}

        {/* loss, one point per finished epoch */}
        <text x="400" y="18" fontSize="18" className="fill-muted">
          loss
        </text>
        <line x1="400" x2="520" y1="62" y2="62" className="stroke-ring" />
        <polyline
          points={spark}
          className="fill-none stroke-success"
          strokeWidth="2"
        />
      </svg>
      <p aria-hidden="true" className="mt-2 text-xs text-text-soft">
        <span className="text-muted">$ </span>
        epoch {Math.min(epochIndex + 1, EPOCHS)}/{EPOCHS} ·{' '}
        {forward
          ? 'forward pass'
          : backward
            ? 'backward pass'
            : 'update weights'}
      </p>
      <figcaption className="mt-3 text-xs text-muted">
        Illustration of training a neural network, not a real run.
      </figcaption>
    </figure>
  );
}
