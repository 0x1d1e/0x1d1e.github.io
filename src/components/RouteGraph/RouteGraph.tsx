import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { usePageActive } from '../../motion/PageContext';

type Id = 'a' | 'b' | 'c';

const N = {
  client: { x: 20, y: 130 },
  gw: { x: 230, y: 130 },
  a: { x: 440, y: 30 },
  b: { x: 440, y: 130 },
  c: { x: 440, y: 230 },
};
const W = 100;
const H = 40;
const mid = (n: { x: number; y: number }) => ({
  x: n.x + W / 2,
  y: n.y + H / 2,
});

const route = (to: Id) => {
  const s = { x: N.gw.x + W, y: mid(N.gw).y };
  const e = { x: N[to].x, y: mid(N[to]).y };
  return `M${s.x} ${s.y} C ${s.x + 60} ${s.y}, ${e.x - 60} ${e.y}, ${e.x} ${e.y}`;
};
const ingress = `M${N.client.x + W} ${mid(N.client).y} L${N.gw.x} ${mid(N.gw).y}`;

// Illustrative scenes of what the gateway does: route, fail over, re-route.
const SCENES: { to: Id; failed?: Id; log: string }[] = [
  { to: 'a', log: 'route -> provider-a   ok' },
  {
    to: 'b',
    failed: 'a',
    log: 'provider-a unavailable -> fallback provider-b',
  },
  { to: 'c', log: 'route -> provider-c   ok' },
];
const STEP_MS = 4200;
const PROVIDERS: Id[] = ['a', 'b', 'c'];

/** Looping diagram of a gateway routing requests and failing over. Decorative. */
export function RouteGraph({ name = 'gateway' }: { name?: string }) {
  const reduce = useReducedMotion();
  const active = usePageActive();
  const [step, setStep] = useState(reduce ? 1 : 0);

  useEffect(() => {
    if (reduce || !active) return;
    const id = setInterval(
      () => setStep((s) => (s + 1) % SCENES.length),
      STEP_MS,
    );
    return () => clearInterval(id);
  }, [reduce, active]);

  const scene = SCENES[step]!;
  const hop = scene.failed ? 1.5 : 0.7; // delay before the packet that succeeds

  return (
    <figure className="w-full bg-card p-4 font-mono ring-1 ring-ring transition-colors duration-300 hover:ring-accent">
      <svg
        viewBox="0 0 560 290"
        role="img"
        aria-label="Diagram: a client sends a request to the gateway, which routes it to one of three providers and falls back to another when one is unavailable."
        className="w-full"
      >
        {/* links */}
        <path d={ingress} className="fill-none stroke-ring" strokeWidth="1.5" />
        {PROVIDERS.map((p) => (
          <path
            key={p}
            d={route(p)}
            strokeWidth="1.5"
            strokeDasharray={scene.failed === p ? '4 4' : undefined}
            className={`fill-none transition-colors duration-300 ${scene.to === p ? 'stroke-accent' : 'stroke-ring'}`}
          />
        ))}

        {/* nodes */}
        {(
          [
            ['client', 'client'],
            ['gw', name],
            ['a', 'provider-a'],
            ['b', 'provider-b'],
            ['c', 'provider-c'],
          ] as const
        ).map(([k, label]) => {
          const on = scene.to === k || k === 'gw';
          return (
            <g key={k}>
              <rect
                x={N[k].x}
                y={N[k].y}
                width={W}
                height={H}
                className={`fill-bg transition-colors duration-300 ${on ? 'stroke-accent' : 'stroke-ring'}`}
                strokeWidth="1.5"
              />
              <text
                x={N[k].x + W / 2}
                y={N[k].y + H / 2 + 4}
                textAnchor="middle"
                fontSize="12"
                className={scene.failed === k ? 'fill-muted' : 'fill-text-soft'}
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* failure mark */}
        {scene.failed && (
          <text
            key={`x-${step}`}
            x={N[scene.failed].x + W + 14}
            y={mid(N[scene.failed]).y + 5}
            fontSize="14"
            className="animate-fade-in fill-text"
            style={{ animationDelay: '1.1s' }}
          >
            ×
          </text>
        )}

        {/* packets (restarted per scene via key) */}
        {!reduce && (
          <g key={step} className="fill-accent">
            <rect width="7" height="7" x="-3.5" y="-3.5" opacity="0">
              <animateMotion dur="0.7s" path={ingress} fill="remove" />
              <set attributeName="opacity" to="1" begin="0s" dur="0.7s" />
            </rect>
            {scene.failed && (
              <rect width="7" height="7" x="-3.5" y="-3.5" opacity="0">
                <animateMotion
                  begin="0.7s"
                  dur="0.8s"
                  path={route(scene.failed)}
                  keyPoints="0;0.85"
                  keyTimes="0;1"
                  calcMode="linear"
                  fill="remove"
                />
                <set attributeName="opacity" to="1" begin="0.7s" dur="0.8s" />
              </rect>
            )}
            <rect width="7" height="7" x="-3.5" y="-3.5" opacity="0">
              <animateMotion
                begin={`${hop}s`}
                dur="0.8s"
                path={route(scene.to)}
                fill="remove"
              />
              <set
                attributeName="opacity"
                to="1"
                begin={`${hop}s`}
                dur="0.8s"
              />
            </rect>
          </g>
        )}
      </svg>
      <p aria-hidden="true" className="mt-2 text-xs text-text-soft">
        <span className="text-muted">$ </span>
        {scene.log}
      </p>
      <figcaption className="mt-3 text-xs text-muted">
        Illustration of gateway routing and fallback, not live traffic.
      </figcaption>
    </figure>
  );
}
