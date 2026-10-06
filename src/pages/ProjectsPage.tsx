import { useSearchParams } from 'react-router';
import { AppLink } from '../components/AppLink/AppLink';
import { Cursor } from '../components/Cursor/Cursor';
import { ProjectCard } from '../components/Projects/Projects';
import { projects } from '../content/projects';
import { topics } from '../content/topics';
import { Reveal } from '../motion/Reveal';

export function ProjectsPage() {
  const [params] = useSearchParams();
  const topic = topics.find((t) => t.id === params.get('topic'));
  const shown = topic
    ? projects.filter((p) => (p.topics as string[]).includes(topic.id))
    : projects;

  const chip = (active: boolean) =>
    `inline-block rounded-chip px-3 py-1 font-mono text-xs transition-colors duration-150 ${active ? 'bg-text text-cta-text' : 'bg-chip text-text-soft hover:text-text'}`;

  return (
    <section
      aria-labelledby="projects-page-title"
      className="mx-auto max-w-7xl px-6 pt-32 pb-24 md:px-14"
    >
      <p aria-hidden="true" className="mb-3 font-mono text-xs text-muted">
        $ ls ./projects{topic ? ` --topic=${topic.id}` : ''}
        <Cursor />
      </p>
      <h1 id="projects-page-title" className="font-display text-headline">
        Projects
      </h1>
      <p className="mt-4 max-w-xl text-text-soft">
        Everything is experimental unless its repository says otherwise.
      </p>
      <nav aria-label="Filter by topic" className="mt-8 flex flex-wrap gap-2">
        <AppLink
          href="/projects"
          aria-current={topic ? undefined : 'true'}
          className={chip(!topic)}
        >
          all
        </AppLink>
        {topics.map((t) => (
          <AppLink
            key={t.id}
            href={`/projects?topic=${t.id}`}
            aria-current={topic?.id === t.id ? 'true' : undefined}
            className={chip(topic?.id === t.id)}
          >
            {t.name}
          </AppLink>
        ))}
      </nav>
      {topic && (
        <p className="mt-6 max-w-2xl text-sm text-text-soft">{topic.blurb}</p>
      )}
      <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((p, i) => (
          <li key={p.name}>
            <Reveal className="h-full" delay={(i % 3) * 0.06}>
              <ProjectCard p={p} />
            </Reveal>
          </li>
        ))}
      </ul>
      {shown.length === 0 && (
        <p className="mt-10 font-mono text-sm text-muted">nothing here yet.</p>
      )}
    </section>
  );
}
