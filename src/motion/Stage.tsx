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
/** 0 while resting, 1 when fully turned away; d = page offset from the camera. */
const turn = (d: number) => clamp((Math.abs(d) - REST) / (1 - 2 * REST));

function useWide() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px) and (min-height: 640px)');
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
  const d = useTransform(p, (v) => v * (n - 1) - i);
  // Outgoing pages swing away left on a left hinge; incoming ones arrive from the right.
  const x = useTransform(d, (v) => `${(v > 0 ? -1 : 1) * turn(v) * 18}vw`);
  const rotateY = useTransform(d, (v) => (v > 0 ? 1 : -1) * turn(v) * 55);
  const scale = useTransform(d, (v) => 1 - turn(v) * 0.15);
  const opacity = useTransform(d, (v) => clamp(1 - turn(v) * 1.35));
  const filter = useTransform(d, (v) => `blur(${(turn(v) * 7).toFixed(1)}px)`);
  const transformOrigin = useTransform(d, (v) =>
    v > 0 ? '0% 50%' : '100% 50%',
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
          x,
          rotateY,
          scale,
          opacity,
          filter,
          transformOrigin,
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
  useMotionValueEvent(p, 'change', (v) =>
    setActive(clamp(Math.round(v * (n - 1)), 0, n - 1)),
  );

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
        <PageDots items={pages} active={active} onJump={(i) => jump(i, true)} />
      </div>
    </div>
  );
}

/**
 * Full-screen pages driven by scroll: each one turns away like a book page
 * (hinge, slide, blur) as the next turns in. Small screens and reduced
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
