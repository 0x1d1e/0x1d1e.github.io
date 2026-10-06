import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { duration, ease } from './tokens';

/** Fade + 12px rise on first viewport entry. Reduced motion: no movement, instant. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: duration.slow, ease, delay }}
    >
      {children}
    </motion.div>
  );
}
