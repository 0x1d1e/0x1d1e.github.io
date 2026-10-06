import { useEffect, useState } from 'react';

type Item = { id: string; label: string };

/** Fixed side pager for the stacked pages: shows where you are, jumps on click. */
export function PageDots({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) setActive(hit.target.id);
      },
      { threshold: [0.2, 0.5, 0.8] },
    );
    for (const { id } of items) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [items]);

  function jump(e: React.MouseEvent, id: string) {
    e.preventDefault();
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth' });
  }

  return (
    <nav
      aria-label="Sections"
      className="fixed top-1/2 right-5 z-40 hidden -translate-y-1/2 flex-col gap-3 md:flex"
    >
      {items.map((i) => (
        <a
          key={i.id}
          href={`#${i.id}`}
          onClick={(e) => jump(e, i.id)}
          aria-label={i.label}
          aria-current={active === i.id ? 'true' : undefined}
          className="group relative flex size-3 items-center justify-center"
        >
          <span
            className={`block transition-all duration-150 ${active === i.id ? 'size-2.5 bg-accent' : 'size-1.5 bg-muted group-hover:bg-text'}`}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-6 font-mono text-xs whitespace-nowrap text-text-soft opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            {i.label}
          </span>
        </a>
      ))}
    </nav>
  );
}
