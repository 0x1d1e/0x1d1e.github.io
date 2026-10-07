import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { addLogoSource } from '../../motion/logoSource';
import { usePageActive } from '../../motion/PageContext';
import { SPRITES } from '../Agent/Agent';

const ROWS = SPRITES.worker.map((r) => [...r]);

type Look = { x: -1 | 0 | 1; y: -1 | 0 | 1 };
const AHEAD: Look = { x: 0, y: 0 };
const GLANCES: Look[] = [
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: -1 },
  { x: 1, y: 1 },
  AHEAD,
];

const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

/**
 * Our agent bot (the favicon) as a second logo: big, alive, and standing on
 * the terminal card. Its eyes follow the pointer; with no pointer (touch) it
 * glances around now and then; it blinks. Decorative.
 */
export function HeroBot({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion();
  const active = usePageActive();
  const svg = useRef<SVGSVGElement>(null);
  const body = useRef<SVGGElement>(null);
  const lastMove = useRef(0);
  const [look, setLook] = useState<Look>(AHEAD);
  const [blink, setBlink] = useState(false);

  // Eyes follow the pointer, one pixel at most, when it is clearly to a side.
  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      const r = svg.current?.getBoundingClientRect();
      if (!r) return;
      lastMove.current = performance.now();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const next: Look = {
        x: dx > r.width * 0.7 ? 1 : dx < -r.width * 0.7 ? -1 : 0,
        y: dy > r.height * 0.9 ? 1 : dy < -r.height * 0.9 ? -1 : 0,
      };
      setLook((cur) => (cur.x === next.x && cur.y === next.y ? cur : next));
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduce]);

  // Nobody is pointing at it: it looks around by itself.
  useEffect(() => {
    if (reduce || !active) return;
    const id = setInterval(() => {
      if (performance.now() - lastMove.current < 3500) return;
      setLook(GLANCES[Math.floor(Math.random() * GLANCES.length)]!);
    }, 2600);
    return () => clearInterval(id);
  }, [reduce, active]);

  // Blinks every few seconds.
  useEffect(() => {
    if (reduce || !active) return;
    let t = 0;
    const loop = () => {
      t = window.setTimeout(
        () => {
          setBlink(true);
          t = window.setTimeout(() => {
            setBlink(false);
            loop();
          }, 140);
        },
        rand(2200, 5200),
      );
    };
    loop();
    return () => window.clearTimeout(t);
  }, [reduce, active]);

  // The page transition scatters this bot's pixels, read from where they are now.
  useEffect(
    () =>
      addLogoSource({
        read: () => {
          const r = body.current?.getBoundingClientRect();
          if (!r || !r.width) return [];
          const cell = r.width / 10;
          return ROWS.flatMap((row, y) =>
            row.flatMap((c, x) =>
              c === '.'
                ? []
                : [
                    {
                      x: r.left + x * cell,
                      y: r.top + y * cell,
                      size: cell,
                      accent: c === 'e',
                    },
                  ],
            ),
          );
        },
        hide: (hidden) => {
          if (svg.current) svg.current.style.opacity = hidden ? '0' : '';
        },
      }),
    [],
  );

  const eye = (x: number) => (
    <rect
      key={x}
      x={x}
      y={4}
      width={2}
      height={2}
      className="fill-accent"
      style={{
        transform: `translate(${look.x}px, ${look.y}px) scaleY(${blink ? 0.15 : 1})`,
        transformBox: 'fill-box',
        transformOrigin: 'center',
        transition: 'transform 90ms steps(2, end)',
      }}
    />
  );

  return (
    <svg
      ref={svg}
      viewBox="0 0 10 10"
      aria-hidden="true"
      shapeRendering="crispEdges"
      data-hero-bot
      className={`aspect-square w-[clamp(7rem,22vw,24rem)] ${className}`}
    >
      <g ref={body} className={reduce ? undefined : 'animate-bob'}>
        {ROWS.flatMap((row, y) =>
          row.map((c, x) =>
            c === '.' ? null : (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width="1"
                height="1"
                className="fill-text"
              />
            ),
          ),
        )}
        {eye(2)}
        {eye(6)}
      </g>
    </svg>
  );
}
