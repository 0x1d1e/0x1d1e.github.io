import type { ReactNode } from 'react';
import { Button } from '../Button/Button';

/** A full page: copy on the left, an illustration on the right. */
export function Chapter({
  id,
  index,
  label,
  title,
  blurb,
  tags,
  cta,
  visual,
}: {
  id: string;
  index: string;
  label: string;
  title: string;
  blurb: string;
  tags: readonly string[];
  cta: { label: string; href: string };
  visual: ReactNode;
}) {
  return (
    <section
      aria-labelledby={`${id}-title`}
      className="grid w-full items-center gap-10 px-6 py-24 md:px-14 lg:grid-cols-2 lg:gap-16 lg:py-0"
    >
      <div>
        <p aria-hidden="true" className="mb-3 font-mono text-xs text-muted">
          {index} / {label}
        </p>
        <h2
          id={`${id}-title`}
          className="max-w-xl font-display text-headline text-balance"
        >
          {title}
        </h2>
        <p className="mt-6 max-w-lg leading-7 text-text-soft">{blurb}</p>
        <ul
          aria-label="Areas"
          className="mt-6 flex flex-wrap gap-2 font-mono text-xs"
        >
          {tags.map((t) => (
            <li
              key={t}
              className="rounded-chip bg-chip px-3 py-1 text-text-soft"
            >
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Button href={cta.href} arrow>
            {cta.label}
          </Button>
        </div>
      </div>
      <div>{visual}</div>
    </section>
  );
}
