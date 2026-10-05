/** Scrolling ticker. Pauses on hover; the duplicate half is hidden from AT. */
export function Marquee({ items }: { items: string[] }) {
  const row = (hidden: boolean) => (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-10 pr-10"
    >
      {items.map((t) => (
        <li key={t} className="whitespace-nowrap">
          <span aria-hidden="true" className="mr-3 text-accent">
            &gt;
          </span>
          {t}
        </li>
      ))}
    </ul>
  );
  return (
    <div
      aria-label="How we work"
      role="region"
      className="group overflow-hidden border-y border-ring py-4 font-mono text-xs text-text-soft"
    >
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
