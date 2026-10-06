import { Cursor } from '../components/Cursor/Cursor';
import { ProjectCard } from '../components/Projects/Projects';
import { projects } from '../content/projects';
import { Reveal } from '../motion/Reveal';

export function ProjectsPage() {
  return (
    <section
      aria-labelledby="projects-page-title"
      className="mx-auto max-w-7xl px-6 pt-32 pb-24 md:px-14"
    >
      <p aria-hidden="true" className="mb-3 font-mono text-xs text-muted">
        $ ls ./projects
        <Cursor />
      </p>
      <h1 id="projects-page-title" className="font-display text-headline">
        Projects
      </h1>
      <p className="mt-4 max-w-xl text-text-soft">
        The main things we build. Everything is experimental unless its
        repository says otherwise.
      </p>
      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        {projects.map((p, i) => (
          <li key={p.name}>
            <Reveal className="h-full" delay={i * 0.06}>
              <ProjectCard p={p} />
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
