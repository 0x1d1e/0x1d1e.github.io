import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

const GLYPHS = '01{}<>/_#$%&';
const FRAMES = 14;
const FRAME_MS = 30;

/** While `active`, resolves `text` left to right out of random glyphs. */
export function useScramble(text: string, active: boolean) {
  const reduce = useReducedMotion();
  const [frame, setFrame] = useState(FRAMES);

  useEffect(() => {
    if (reduce || !active) return;
    let f = 0;
    const id = setInterval(() => {
      f += 1;
      setFrame(f);
      if (f >= FRAMES) clearInterval(id);
    }, FRAME_MS);
    return () => {
      clearInterval(id);
      setFrame(FRAMES);
    };
  }, [active, reduce]);

  if (reduce || !active || frame >= FRAMES) return text;
  const resolved = Math.floor((frame / FRAMES) * text.length);
  return [...text]
    .map((c, i) =>
      i < resolved || c === ' '
        ? c
        : GLYPHS[(i * 7 + frame * 5) % GLYPHS.length],
    )
    .join('');
}
