import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { duration, ease } from './tokens';

/** Route content fades in and rises 12px on mount (key it by pathname). */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.base, ease }}
    >
      {children}
    </motion.div>
  );
}
