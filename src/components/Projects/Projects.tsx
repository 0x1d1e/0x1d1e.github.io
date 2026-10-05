import type { Project } from '../../content/projects';
import { Reveal } from '../../motion/Reveal';
import { Card } from '../Card/Card';

export function Projects({ projects }: { projects: Project[] }) {
  return (
    <section aria-labelledby="projects-title" className="px-6 py-24 md:px-14">
      <Reveal>
        <h2 id="projects-title" className="font-display text-headline">
          Projects
        </h2>
      </Reveal>
      <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => (
          <li key={p.name}>
            <Reveal className="h-full" delay={(i % 3) * 0.06}>
              <Card className="flex h-full flex-col gap-3 p-6">
                <h3 className="font-mono text-lg">
                  <a href={p.repo} className="hover:text-accent">
                    {p.name}
                  </a>
                </h3>
                <p className="text-sm text-text-soft">{p.summary}</p>
                <p className="mt-auto font-mono text-xs text-muted">
                  <span className="uppercase">{p.status}</span>
                  {p.tags.length > 0 && ` · ${p.tags.join(' · ')}`}
                </p>
              </Card>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
