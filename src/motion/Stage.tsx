import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  type MotionValue,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { PageDots } from '../components/PageDots/PageDots';
import { PageActive } from './PageContext';

export type StagePage = { id: string; label: string; node: ReactNode };

const REST = 0.2; // fraction of each page's scroll range spent holding still
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
/** Progress (0..1) of the scan that moves the stage from page k to page k+1, given t = page position. */
const scan = (t: number, k: number) => clamp((t - k - REST) / (1 - 2 * REST));

function useWide() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px) and (min-height: 700px)');
    const sync = () => setOn(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return on;
}

function DeckPage({
  i,
  n,
  p,
  active,
  page,
  jump,
}: {
  i: number;
  n: number;
  p: MotionValue<number>;
  active: number;
  page: StagePage;
  jump: (i: number, smooth: boolean) => void;
}) {
  // A scan line sweeps down the screen: the new page is revealed above it,
  // the old one is left below it, drifting down a little as it is covered.
  const enter = useTransform(p, (v) =>
    i === 0 ? 1 : scan(v * (n - 1), i - 1),
  );
  const leave = useTransform(p, (v) =>
    i === n - 1 ? 0 : scan(v * (n - 1), i),
  );
  const clipPath = useTransform([enter, leave], ([e = 1, l = 0]: number[]) =>
    e < 1
      ? `inset(0 0 ${(1 - e) * 100}% 0)`
      : l > 0
        ? `inset(${l * 100}% 0 0 0)`
        : 'inset(0 0 0 0)',
  );
  const y = useTransform(
    [enter, leave],
    ([e = 1, l = 0]: number[]) => `${(1 - e) * -6 + l * 6}vh`,
  );
  const opacity = useTransform([enter, leave], ([e = 1, l = 0]: number[]) =>
    clamp(0.35 + 0.65 * e - 0.55 * l),
  );

  return (
    <PageActive.Provider value={active === i}>
      <motion.div
        id={page.id}
        data-page
        // Keyboard users tabbing into an off-stage page bring it on stage.
        onFocusCapture={() => active !== i && jump(i, false)}
        className="absolute inset-0 flex items-center"
        style={{
          clipPath,
          y,
          opacity,
          zIndex: active === i ? 2 : 1,
          pointerEvents: active === i ? 'auto' : 'none',
        }}
      >
        <div className="w-full pt-16">{page.node}</div>
      </motion.div>
    </PageActive.Provider>
  );
}

function Deck({ pages }: { pages: StagePage[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const n = pages.length;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const p = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    mass: 0.4,
  });
  const [active, setActive] = useState(0);
  const [next, setNext] = useState(1);
  useMotionValueEvent(p, 'change', (v) => {
    const t = v * (n - 1);
    setActive(clamp(Math.round(t), 0, n - 1));
    setNext(clamp(Math.floor(t) + 1, 1, n - 1));
  });
  // Where the scan line is, and whether a scan is under way.
  const lineTop = useTransform(
    p,
    (v) =>
      `${scan(v * (n - 1), Math.min(Math.floor(v * (n - 1)), n - 2)) * 100}%`,
  );
  const lineOn = useTransform(p, (v) => {
    const t = v * (n - 1);
    const a = scan(t, Math.min(Math.floor(t), n - 2));
    return a > 0 && a < 1 ? 1 : 0;
  });

  function jump(i: number, smooth: boolean) {
    const top =
      (ref.current?.getBoundingClientRect().top ?? 0) + window.scrollY;
    window.scrollTo({
      top: top + i * window.innerHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
  }

  return (
    <div ref={ref} className="relative" style={{ height: `${n * 100}svh` }}>
      <div
        className="sticky top-0 h-svh overflow-hidden"
        style={{ perspective: 1600 }}
      >
        {pages.map((page, i) => (
          <DeckPage
            key={page.id}
            i={i}
            n={n}
            p={p}
            active={active}
            page={page}
            jump={jump}
          />
        ))}
        <motion.div
          aria-hidden="true"
          style={{ top: lineTop, opacity: lineOn }}
          className="pointer-events-none absolute inset-x-0 z-30 h-px bg-accent shadow-[0_0_24px_1px_var(--color-accent)]"
        >
          <span className="absolute bottom-1 left-6 bg-bg px-2 py-0.5 font-mono text-xs text-accent md:left-14">
            {String(next).padStart(2, '0')} / {pages[next]?.label}
          </span>
        </motion.div>
        <PageDots items={pages} active={active} onJump={(i) => jump(i, true)} />
      </div>
    </div>
  );
}

/**
 * Full-screen pages driven by scroll: a scan line sweeps down the screen,
 * revealing the next page above it and leaving the old one below. Small or short screens and reduced
 * motion get the same pages as a plain scrolling column.
 */
export function Stage({ pages }: { pages: StagePage[] }) {
  const reduce = useReducedMotion();
  const wide = useWide();
  if (reduce || !wide)
    return (
      <>
        {pages.map((p) => (
          <div
            key={p.id}
            id={p.id}
            data-page
            className="relative border-t border-ring first:border-t-0"
          >
            {p.node}
          </div>
        ))}
      </>
    );
  return <Deck pages={pages} />;
}
