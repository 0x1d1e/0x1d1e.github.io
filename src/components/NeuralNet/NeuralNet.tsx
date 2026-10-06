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
const STEP_MS = 520;

/** A small neural net: a signal pulses layer by layer. Generic, decorative. */
export function NeuralNet() {
  const reduce = useReducedMotion();
  const active = usePageActive();
  const [tick, setTick] = useState(reduce ? 2 : 0);

  useEffect(() => {
    if (reduce || !active) return;
    const id = setInterval(() => setTick((t) => t + 1), STEP_MS);
    return () => clearInterval(id);
  }, [reduce, active]);

  // Layer `lit` is firing; nodes inside it fire in a shifting pattern.
  const cycle = LAYERS.length + 2; // two idle beats between passes
  const lit = tick % cycle;
  const fires = (layer: number, i: number) =>
    layer === lit && (i + tick) % 3 !== 2;

  return (
    <figure
      aria-label="Illustration of a neural network passing a signal through its layers"
      className="w-full bg-card p-4 font-mono ring-1 ring-ring transition-colors duration-300 hover:ring-accent"
    >
      <svg viewBox="0 0 560 300" aria-hidden="true" className="w-full">
        {LAYERS.slice(0, -1).flatMap((n, l) =>
          Array.from({ length: n }, (_, i) =>
            Array.from({ length: LAYERS[l + 1]! }, (_, j) => (
              <line
                key={`${l}-${i}-${j}`}
                x1={X[l]! + SIZE}
                y1={nodeY(l, i) + SIZE / 2}
                x2={X[l + 1]!}
                y2={nodeY(l + 1, j) + SIZE / 2}
                strokeWidth="1"
                className={`transition-colors duration-300 ${lit === l + 1 && fires(l + 1, j) ? 'stroke-accent' : 'stroke-ring'}`}
              />
            )),
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
              className={`transition-colors duration-300 ${fires(l, i) ? 'fill-accent' : 'fill-chip'}`}
            />
          )),
        )}
        {['input', 'hidden', 'hidden', 'output'].map((t, l) => (
          <text
            key={l}
            x={X[l]! + SIZE / 2}
            y="288"
            textAnchor="middle"
            fontSize="10"
            className="fill-muted"
          >
            {t}
          </text>
        ))}
      </svg>
      <figcaption className="mt-3 text-xs text-muted">
        Illustration of a neural network, not a real model.
      </figcaption>
    </figure>
  );
}
