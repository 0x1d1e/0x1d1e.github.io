import { useState } from 'react';
import type { Project } from '../../content/projects';
import { useScramble } from '../../motion/useScramble';
import { Reveal } from '../../motion/Reveal';
import { AppLink } from '../AppLink/AppLink';
import { Card } from '../Card/Card';
import { Cursor } from '../Cursor/Cursor';

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

export function Projects({ projects }: { projects: Project[] }) {
  return (
    <section aria-labelledby="projects-title" className="px-6 py-24 md:px-14">
      <Reveal>
        <p aria-hidden="true" className="mb-3 font-mono text-xs text-muted">
          $ ls ./projects
          <Cursor />
        </p>
        <h2 id="projects-title" className="font-display text-headline">
          Projects
        </h2>
      </Reveal>
      <ul className="mt-8 grid gap-4 md:grid-cols-3">
        {projects.map((p, i) => (
          <li key={p.name}>
            <Reveal className="h-full" delay={(i % 3) * 0.06}>
              <ProjectCard p={p} />
            </Reveal>
          </li>
        ))}
      </ul>
      <p className="mt-8 font-mono text-sm">
        <AppLink href="/projects" className="text-accent hover:underline">
          all projects →
        </AppLink>
      </p>
    </section>
  );
}
