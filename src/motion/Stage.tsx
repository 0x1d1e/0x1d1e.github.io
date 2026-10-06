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
import {
  clamp,
  promptOpacity,
  scan,
  typed,
  typedCommand,
  wipe,
} from './stageMath';

export type StagePage = {
  id: string;
  label: string;
  node: ReactNode;
  /** Shell command "typed" as the stage moves to this page. Defaults to `cd ./<id>`. */
  command?: string;
};

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
  // The command is typed first, then a scan line sweeps down the screen: the
  // new page is revealed above it, the old one is left below it, drifting down
  // a little as it is covered.
  const raw = (k: number, v: number) => scan(v * (n - 1), k);
  const enter = useTransform(p, (v) => (i === 0 ? 1 : wipe(raw(i - 1, v))));
  const leave = useTransform(p, (v) => (i === n - 1 ? 0 : wipe(raw(i, v))));
  const typing = useTransform(p, (v) => (i === n - 1 ? 0 : typed(raw(i, v))));
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
  // The page being left dims while its command is typed.
  const opacity = useTransform(
    [enter, leave, typing],
    ([e = 1, l = 0, ty = 0]: number[]) =>
      clamp(0.35 + 0.65 * e - 0.55 * l - 0.3 * ty),
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
  // Which transition is under way, and how far along it is.
  const [prompt, setPrompt] = useState('');
  const [dest, setDest] = useState('');
  useMotionValueEvent(p, 'change', (v) => {
    const t = v * (n - 1);
    setActive(clamp(Math.round(t), 0, n - 1));
    const k = clamp(Math.floor(t), 0, n - 2);
    const to = pages[k + 1]!;
    const a = scan(t, k);
    setPrompt(a > 0 ? typedCommand(to.command ?? `cd ./${to.id}`, a) : '');
    setDest(
      a >= 0.4
        ? `${String(k + 1).padStart(2, '0')} / ${to.label.toLowerCase()}`
        : '',
    );
  });
  const scanAmount = (v: number) => {
    const t = v * (n - 1);
    return scan(t, clamp(Math.floor(t), 0, n - 2));
  };
  const lineTop = useTransform(p, (v) => `${wipe(scanAmount(v)) * 100}%`);
  const lineOn = useTransform(p, (v) => {
    const w = wipe(scanAmount(v));
    return w > 0 && w < 1 ? 1 : 0;
  });
  const promptAlpha = useTransform(p, (v) => promptOpacity(scanAmount(v)));

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
        />
        <motion.div
          aria-hidden="true"
          data-testid="stage-prompt"
          style={{ opacity: promptAlpha }}
          className="pointer-events-none absolute top-1/2 left-1/2 z-40 w-[min(90vw,34rem)] -translate-x-1/2 -translate-y-1/2 bg-card px-6 py-5 font-mono ring-1 ring-accent"
        >
          <p className="text-lg text-text">
            <span className="text-accent">$ </span>
            {prompt}
            <span className="ml-0.5 inline-block h-[1.1em] w-[0.55em] animate-blink bg-accent align-text-bottom" />
          </p>
          <p className="mt-2 h-5 text-xs text-muted">{dest && `→ ${dest}`}</p>
        </motion.div>
        <PageDots items={pages} active={active} onJump={(i) => jump(i, true)} />
      </div>
    </div>
  );
}

/**
 * Full-screen pages driven by scroll. Moving on first "types" a shell command
 * (scroll-linked, so it un-types when you scroll back), then a scan line
 * sweeps down the screen, revealing the next page above it. Small or short
 * screens and reduced motion get the same pages as a plain scrolling column.
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
