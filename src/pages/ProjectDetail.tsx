import { useParams } from 'react-router';
import { AppLink } from '../components/AppLink/AppLink';
import { Button } from '../components/Button/Button';
import { Cursor } from '../components/Cursor/Cursor';
import { docsByProject } from '../content/docs';
import { projects } from '../content/projects';
import { Reveal } from '../motion/Reveal';
import { NotFound } from './NotFound';

const ORG = 'https://github.com/0x1d1e';

export default function ProjectDetail() {
  const { name = '' } = useParams();
  const p = projects.find((x) => x.name === name);
  if (!p) return <NotFound />;
  const pages = docsByProject.get(p.name) ?? [];

  return (
    <article className="mx-auto max-w-5xl px-6 pt-32 pb-24 md:px-14">
      <p className="font-mono text-xs text-muted">
        <AppLink href="/projects" className="hover:text-text">
          projects
        </AppLink>{' '}
        / {p.name}
        <Cursor />
      </p>
      <h1 className="mt-3 font-mono text-headline">{p.name}</h1>
      <p className="mt-6 max-w-2xl text-xl leading-8 text-text-soft">
        {p.summary}
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Button href={p.repo} arrow target="_blank" rel="noopener noreferrer">
          Repository
        </Button>
        {pages[0] && (
          <Button href={`/docs/${p.name}/${pages[0].slug}`} arrow>
            Docs
          </Button>
        )}
      </div>

      <Reveal>
        <dl className="mt-16 grid gap-px bg-ring ring-1 ring-ring sm:grid-cols-3">
          {[
            ['status', p.status],
            ['stack', p.tags.join(' · ') || '—'],
            ['updated', p.updated],
          ].map(([k, v]) => (
            <div key={k} className="bg-card p-5">
              <dt className="font-mono text-xs text-muted uppercase">{k}</dt>
              <dd className="mt-2 font-mono text-sm text-text">{v}</dd>
            </div>
          ))}
        </dl>
      </Reveal>

      {pages.length > 0 && (
        <Reveal>
          <h2 className="mt-16 font-display text-2xl">Documentation</h2>
          <ul className="mt-4 flex flex-col font-mono text-sm">
            {pages.map((d) => (
              <li key={d.slug} className="border-b border-ring">
                <AppLink
                  href={`/docs/${p.name}/${d.slug}`}
                  className="flex justify-between py-3 text-text-soft transition-colors duration-150 hover:text-accent"
                >
                  {d.title}
                  <span aria-hidden="true">→</span>
                </AppLink>
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      {p.addons.length > 0 && (
        <Reveal>
          <h2 className="mt-16 font-display text-2xl">Add-ons</h2>
          <p className="mt-2 text-sm text-text-soft">
            Supporting repositories for {p.name}.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2 font-mono text-xs">
            {p.addons.map((a) => (
              <li key={a}>
                <a
                  href={`${ORG}/${a}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-chip bg-chip px-3 py-1 text-text-soft transition-colors duration-150 hover:text-accent"
                >
                  {a} ↗
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      )}
    </article>
  );
}
