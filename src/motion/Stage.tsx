import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
import { drawDissolve, makeCells, type Cells } from './pixelDissolve';
import {
  buildScatter,
  drawScatter,
  pageTargets,
  refreshSources,
  type Scatter,
  type ScatterStyle,
} from './logoScatter';
import { hideLogos, readLogoPoints } from './logoSource';
import { clearFxCache, drawFx, type FxStyle } from './trainFx';
import {
  GROW_END,
  arrivalClip,
  drawAgentEat,
  eatenClip,
  type AgentSrc,
} from './agentEat';
import {
  RUN_END,
  type Exit,
  clamp,
  dissolve,
  pageOpacity,
  scan,
  scrollOf,
  stageHeight,
  toPosition,
  shownPage,
  typed,
  typedCommand,
} from './stageMath';

export type StagePage = {
  id: string;
  label: string;
  node: ReactNode;
  /** Shell command "typed" as the stage moves to this page. Defaults to `cd ./<id>`. */
  command?: string;
  /**
   * How this page is left. `logo-scatter`: the hero wordmark's pixels move
   * through 3D and arrange themselves into the next page's text. `agent-eat`:
   * the page's agent (marked `data-agent`) grows, goes red-eyed and eats the
   * page. Default: pixel dissolve.
   */
  exit?: 'logo-scatter' | 'agent-eat' | 'fx';
  /** With `exit: 'fx'`: which of the screen-covering effects. Default `denoise`. */
  fxStyle?: FxStyle;
  /** With `exit: 'logo-scatter'`: the shape the pixels take on the way. Default `tunnel`. */
  scatterStyle?: ScatterStyle;
  /** Scroll length of the transition leaving this page, in viewports. Default 1; longer is slower. */
  span?: number;
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
  exits,
  spans,
  jump,
}: {
  i: number;
  n: number;
  p: MotionValue<number>;
  active: number;
  page: StagePage;
  exits: Exit[];
  spans: number[];
  jump: (i: number, smooth: boolean) => void;
}) {
  // The command is typed first, then the screen dissolves into pixels: the
  // old page is on stage until it is fully covered, then the new one.
  const typing = useTransform(p, (v) => {
    const t = toPosition(v, spans);
    const k = clamp(Math.floor(t), 0, n - 2);
    return i === k ? typed(scan(t, k)) : 0;
  });
  const opacity = useTransform([p, typing], ([v = 0, ty = 0]: number[]) =>
    pageOpacity(toPosition(v, spans), i, n, exits, ty),
  );
  // The agent eats the old page from the right; the new page wipes in from the left.
  const clipPath = useTransform(p, (v) => {
    const t = toPosition(v, spans);
    const k = clamp(Math.floor(t), 0, n - 2);
    if (exits[k] !== 'agent-eat') return 'none';
    const w = dissolve(t, k);
    if (i === k) return eatenClip(w, window.innerWidth, window.innerHeight);
    if (i === k + 1) return arrivalClip(w);
    return 'none';
  });

  return (
    <PageActive.Provider value={active === i}>
      <motion.div
        id={page.id}
        data-page
        // Keyboard users tabbing into an off-stage page bring it on stage.
        onFocusCapture={() => active !== i && jump(i, false)}
        className="absolute inset-0 flex items-center"
        style={{
          opacity,
          clipPath,
          zIndex: active === i ? 2 : 1,
          pointerEvents: active === i ? 'auto' : 'none',
        }}
      >
        <div className="w-full pt-16 pb-9">{page.node}</div>
      </motion.div>
    </PageActive.Provider>
  );
}

function Deck({ pages }: { pages: StagePage[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const n = pages.length;
  const spans = useMemo(
    () => pages.slice(0, -1).map((pg) => pg.span ?? 1),
    [pages],
  );
  const exits = useMemo<Exit[]>(
    () =>
      pages.map((pg) =>
        pg.exit === 'fx' ? (`fx-${pg.fxStyle ?? 'denoise'}` as Exit) : pg.exit,
      ),
    [pages],
  );
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
  const [line, setLine] = useState({ path: pages[0]!.id, text: '' });
  useMotionValueEvent(p, 'change', (v) => {
    const t = toPosition(v, spans);
    setActive(shownPage(t, n));
    const k = clamp(Math.floor(t), 0, n - 2);
    const from = pages[k]!;
    const to = pages[k + 1]!;
    const a = scan(t, k);
    // The shell sits in the old directory while the command is typed and run,
    // then lands in the new one.
    const next =
      a >= RUN_END
        ? { path: to.id, text: '' }
        : {
            path: from.id,
            text: typedCommand(to.command ?? `cd ./${to.id}`, a),
          };
    setLine((cur) =>
      cur.path === next.path && cur.text === next.text ? cur : next,
    );
  });
  const canvas = useRef<HTMLCanvasElement>(null);
  const draw = useRef<(v: number) => void>(() => undefined);
  useMotionValueEvent(p, 'change', (v) => draw.current(v));
  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext('2d');
    if (!el || !ctx) return;
    const css = getComputedStyle(document.documentElement);
    const colors = {
      bg: css.getPropertyValue('--color-bg').trim() || 'black',
      accent: css.getPropertyValue('--color-accent').trim() || 'blue',
    };
    const danger = css.getPropertyValue('--color-danger').trim() || 'red';
    const token = (name: string, fallback: string) =>
      css.getPropertyValue(`--color-${name}`).trim() || fallback;
    const fxColors = {
      bg: colors.bg,
      fg: token('text', 'white'),
      accent: colors.accent,
      danger,
      success: token('success', 'green'),
      muted: token('muted', 'gray'),
      chip: token('chip', 'black'),
      card: token('card', 'black'),
      ring: token('ring', 'gray'),
    };
    const mono = css.getPropertyValue('--font-mono').trim() || 'monospace';
    const fg = css.getPropertyValue('--color-text').trim() || 'white';
    let w = 0;
    let h = 0;
    let cells: Cells | undefined;
    let scattering = false;
    // Where the agent was when it started to grow (read live while it grows).
    let agent: AgentSrc = { cx: 0, cy: 0, s: 8 };
    // The logo scatter is built from the live page (wordmark pixels, laid-out text), ahead of time.
    const scatters = new Map<number, Scatter | null>();
    const scatterFor = (k: number) => {
      if (!scatters.has(k)) {
        const logo = readLogoPoints();
        const next = document.getElementById(pages[k + 1]!.id);
        scatters.set(
          k,
          logo.length && next
            ? buildScatter(
                logo,
                pageTargets(next, w, h),
                w,
                h,
                pages[k]!.scatterStyle ?? 'tunnel',
              )
            : null,
        );
      }
      return scatters.get(k) ?? null;
    };
    draw.current = (v) => {
      const t = toPosition(v, spans);
      const k = clamp(Math.floor(t), 0, n - 2);
      const d = dissolve(t, k);
      if (exits[k] === 'agent-eat') {
        // The page's agent is drawn big on the canvas for as long as the transition is under way.
        const el = document
          .getElementById(pages[k]!.id)
          ?.querySelector<SVGGraphicsElement>('[data-agent]');
        if (el) el.style.visibility = d > 0 ? 'hidden' : '';
        if (d > 0) {
          const r = el?.getBoundingClientRect();
          if (r?.width && d <= GROW_END)
            agent = {
              cx: r.left + r.width / 2,
              cy: r.top + r.height / 2,
              s: r.width / 10,
            };
          drawAgentEat(ctx, d, w, h, agent, {
            fg,
            accent: colors.accent,
            bg: colors.bg,
            danger,
          });
        } else ctx.clearRect(0, 0, w, h);
      } else if (exits[k]?.startsWith('fx-')) {
        const style = exits[k]!.slice(3) as FxStyle;
        if (d > 0)
          drawFx(style, d, {
            ctx,
            vw: w,
            vh: h,
            colors: fxColors,
            mono,
            from: document.getElementById(pages[k]!.id),
            to: document.getElementById(pages[k + 1]!.id),
          });
        else ctx.clearRect(0, 0, w, h);
      } else if (exits[k] === 'logo-scatter') {
        // The logos are drawn as particles for as long as the transition is under way.
        const sc = d > 0 ? scatterFor(k) : null;
        // As it starts, take the logos' positions as they are now (the bot bobs), so there is no jump.
        if (sc && !scattering) refreshSources(sc, readLogoPoints());
        scattering = d > 0;
        hideLogos(d > 0);
        if (sc) drawScatter(ctx, sc, d, { fg, accent: colors.accent });
        else ctx.clearRect(0, 0, w, h);
      } else if (cells) drawDissolve(ctx, cells, w, h, d, colors);
    };
    const size = () => {
      w = el.clientWidth;
      h = el.clientHeight;
      el.width = w;
      el.height = h;
      cells = makeCells(w, h);
      scatters.clear();
      clearFxCache();
      draw.current(p.get());
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);
    // Build the scatter while idle, so the first scroll frame does not hitch.
    const warm = window.setTimeout(() => {
      pages.forEach((_, k) => exits[k] === 'logo-scatter' && scatterFor(k));
    }, 1800);
    return () => {
      window.clearTimeout(warm);
      ro.disconnect();
      draw.current = () => undefined;
    };
  }, [n, p, pages, exits, spans]);

  function jump(i: number, smooth: boolean) {
    const top =
      (ref.current?.getBoundingClientRect().top ?? 0) + window.scrollY;
    window.scrollTo({
      top: top + scrollOf(i, spans) * window.innerHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
  }

  return (
    <div
      ref={ref}
      className="relative"
      style={{ height: `${stageHeight(spans) * 100}svh` }}
    >
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
            exits={exits}
            spans={spans}
            jump={jump}
          />
        ))}
        <canvas
          ref={canvas}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 h-full w-full"
        />
        {/* The shell: always present, so typing a command reads as using it. */}
        <div
          aria-hidden="true"
          data-testid="stage-prompt"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex h-9 items-center justify-between border-t border-ring bg-bg px-6 font-mono text-xs md:px-14"
        >
          <p className="truncate text-text">
            <span className="text-success">0x1d1e@idle</span>
            <span className="text-muted">:</span>
            <span className="text-accent">~/{line.path}</span>
            <span className="text-muted"> $ </span>
            {line.text}
            <span className="ml-0.5 inline-block h-[1.1em] w-[0.55em] animate-blink bg-accent align-text-bottom" />
          </p>
          <p className="shrink-0 text-muted">
            {String(active + 1).padStart(2, '0')}/{String(n).padStart(2, '0')}
          </p>
        </div>
        <PageDots items={pages} active={active} onJump={(i) => jump(i, true)} />
      </div>
    </div>
  );
}

/**
 * Full-screen pages driven by scroll. Moving on first "types" a shell command
 * (scroll-linked, so it un-types when you scroll back), then the page breaks
 * into pixels that scatter, and pixels converge to form the next page. Small or short
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
