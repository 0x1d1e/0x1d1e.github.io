import type { ReactNode } from 'react';
import { Button } from '../Button/Button';

/** One kind of work: what it is on the left, how it works on the right. */
export function Chapter({
  index,
  topic,
  name,
  title,
  blurb,
  tags,
  visual,
}: {
  index: string;
  /** topic id, used for the filtered projects link */
  topic: string;
  name: string;
  title: string;
  blurb: string;
  tags: readonly string[];
  visual: ReactNode;
}) {
  return (
    <section
      aria-labelledby={`${topic}-title`}
      className="grid w-full items-center gap-10 px-6 py-24 md:px-14 lg:grid-cols-2 lg:gap-16 lg:py-0"
    >
      <div>
        <p aria-hidden="true" className="mb-3 font-mono text-xs text-muted">
          {index} / {name.toLowerCase()}
        </p>
        <h2
          id={`${topic}-title`}
          className="max-w-xl font-display text-headline"
        >
          {title}
        </h2>
        <p className="mt-6 max-w-lg leading-7 text-text-soft">{blurb}</p>
        <ul
          aria-label={`${name} topics`}
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
          <Button href={`/projects?topic=${topic}`} arrow>
            Projects in {name}
          </Button>
        </div>
      </div>
      <div>{visual}</div>
    </section>
  );
}
