import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

/** Types `text` one character at a time. Reduced motion: full text at once. */
export function useTypewriter(
  text: string,
  { start = true, delay = 0, speed = 70 } = {},
) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (reduce || !start || n >= text.length) return;
    const t = setTimeout(() => setN(n + 1), n === 0 ? delay + speed : speed);
    return () => clearTimeout(t);
  }, [n, text, reduce, start, delay, speed]);

  const count = reduce ? text.length : Math.min(n, text.length);
  return { typed: text.slice(0, count), done: count >= text.length };
}
