import type { Project } from '../../content/projects';
import { Card } from '../Card/Card';

export function Projects({ projects }: { projects: Project[] }) {
  return (
    <section aria-labelledby="projects-title" className="px-6 py-24 md:px-14">
      <h2 id="projects-title" className="font-display text-headline">
        Projects
      </h2>
      <ul className="mt-8 grid gap-4 md:grid-cols-3">
        {projects.map((p) => (
          <li key={p.name}>
            <Card className="flex h-full flex-col gap-3 p-6">
              <h3 className="font-mono text-lg">
                <a href={p.repo} className="hover:text-accent">
                  {p.name}
                </a>
              </h3>
              <p className="text-sm text-text-soft">{p.summary}</p>
              <p className="mt-auto font-mono text-xs text-muted uppercase">
                {p.status}
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
