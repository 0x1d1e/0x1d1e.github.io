export const NO_POINTER = -1e4;

/**
 * Follows the pointer in viewport coordinates. A mouse stays where it is until
 * it moves or leaves the window; a finger is gone as soon as it lifts or the
 * browser takes the gesture over (scrolling), so effects driven by it let go
 * instead of freezing where the last touch ended.
 */
export function trackPointer() {
  const p = { x: NO_POINTER, y: NO_POINTER };
  const set = (e: PointerEvent) => {
    p.x = e.clientX;
    p.y = e.clientY;
  };
  const clear = () => {
    p.x = p.y = NO_POINTER;
  };
  const release = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') clear();
  };
  const root = document.documentElement;
  window.addEventListener('pointermove', set);
  window.addEventListener('pointerdown', set);
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', clear);
  window.addEventListener('blur', clear);
  root.addEventListener('pointerleave', clear);
  return {
    p,
    stop() {
      window.removeEventListener('pointermove', set);
      window.removeEventListener('pointerdown', set);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', clear);
      window.removeEventListener('blur', clear);
      root.removeEventListener('pointerleave', clear);
    },
  };
}
