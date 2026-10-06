import { useRef, type ReactNode } from 'react';
import {
  type MotionValue,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';

/**
 * A "page" of the site. As it scrolls in it tips up from a hinge like a page
 * being turned to; as it leaves it recedes. Reduced motion: a plain block.
 */
export function Sheet({
  id,
  label,
  children,
}: {
  id: string;
  /** page tab, e.g. "02 / projects" */
  label?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: enter } = useScroll({
    target: ref,
    offset: ['start end', 'start 0.35'],
  });
  const { scrollYProgress: leave } = useScroll({
    target: ref,
    offset: ['end 0.65', 'end start'],
  });
  const both: MotionValue<number>[] = [enter, leave];
  const rotateX = useTransform(
    both,
    ([e = 1, l = 0]: number[]) => (1 - e) * 14 - l * 10,
  );
  const y = useTransform(enter, (e) => (1 - e) * 48);
  const scale = useTransform(leave, (l) => 1 - l * 0.06);
  const opacity = useTransform(both, ([e = 1, l = 0]: number[]) =>
    Math.max(0.15, 0.2 + 0.8 * e - 0.6 * l),
  );

  const edge = (
    <>
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 h-px w-24 bg-accent"
      />
      {label && (
        <span
          aria-hidden="true"
          className="absolute top-5 left-6 font-mono text-xs text-muted md:left-14"
        >
          {label}
        </span>
      )}
    </>
  );
  const cls = 'relative border-t border-ring first:border-t-0';

  if (reduce)
    return (
      <div id={id} data-sheet className={cls}>
        {edge}
        {children}
      </div>
    );
  return (
    <motion.div
      ref={ref}
      id={id}
      data-sheet
      className={cls}
      style={{
        rotateX,
        y,
        scale,
        opacity,
        transformPerspective: 1400,
        transformOrigin: '50% 0%',
      }}
    >
      {edge}
      {children}
    </motion.div>
  );
}
