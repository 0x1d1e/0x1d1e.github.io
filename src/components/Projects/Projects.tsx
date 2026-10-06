import { useState } from 'react';
import type { Project } from '../../content/projects';
import { useScramble } from '../../motion/useScramble';
import { AppLink } from '../AppLink/AppLink';
import { Card } from '../Card/Card';

export function ProjectCard({ p }: { p: Project }) {
  const [active, setActive] = useState(false);
  const label = useScramble(p.name, active);

  return (
    <Card
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      className="group relative flex h-full flex-col gap-3 p-6 transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:ring-accent focus-within:ring-accent active:translate-y-0"
    >
      <h3 className="flex items-center justify-between font-mono text-lg">
        <AppLink
          href={`/projects/${p.name}`}
          aria-label={p.name}
          className="after:absolute after:inset-0 focus-visible:outline-none"
        >
          <span aria-hidden="true">
            <span className="mr-2 -ml-4 inline-block w-2 text-accent opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
              &gt;
            </span>
            {label}
          </span>
        </AppLink>
        <span
          aria-hidden="true"
          className="-translate-x-1 translate-y-1 text-accent opacity-0 transition duration-150 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:translate-y-0 group-focus-within:opacity-100"
        >
          ↗
        </span>
      </h3>
      <p className="text-sm text-text-soft">{p.summary}</p>
      <p className="mt-auto flex items-center gap-2 font-mono text-xs text-muted">
        <span
          aria-hidden="true"
          className="inline-block size-1.5 animate-blink bg-accent"
        />
        <span className="uppercase">{p.status}</span>
        {p.tags.length > 0 && <span>· {p.tags.join(' · ')}</span>}
      </p>
    </Card>
  );
}
