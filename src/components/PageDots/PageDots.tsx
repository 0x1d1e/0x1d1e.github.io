type Item = { id: string; label: string };

/** Fixed side pager for the stacked pages: shows where you are, jumps on click. */
export function PageDots({
  items,
  active,
  onJump,
}: {
  items: Item[];
  active: number;
  onJump: (index: number) => void;
}) {
  return (
    <nav
      aria-label="Sections"
      className="fixed top-1/2 right-5 z-40 hidden -translate-y-1/2 flex-col gap-3 md:flex"
    >
      {items.map((it, i) => (
        <a
          key={it.id}
          href={`#${it.id}`}
          onClick={(e) => {
            e.preventDefault();
            onJump(i);
          }}
          aria-label={it.label}
          aria-current={active === i ? 'true' : undefined}
          className="group relative flex size-3 items-center justify-center"
        >
          <span
            className={`block transition-all duration-150 ${active === i ? 'size-2.5 bg-accent' : 'size-1.5 bg-muted group-hover:bg-text'}`}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-6 font-mono text-xs whitespace-nowrap text-text-soft opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            {it.label}
          </span>
        </a>
      ))}
    </nav>
  );
}
