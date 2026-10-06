/** Blinking block cursor. Decorative. */
export function Cursor({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`ml-[0.1em] inline-block h-[0.85em] w-[0.5ch] animate-blink bg-accent align-baseline ${className}`}
    />
  );
}
