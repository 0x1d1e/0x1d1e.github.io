import { Card } from '../../components/Card/Card';
import { AppLink } from '../../components/AppLink/AppLink';
import { Cursor } from '../../components/Cursor/Cursor';
import { docsByProject } from '../../content/docs';
import { projects } from '../../content/projects';

export function DocsHome() {
  return (
    <div>
      <p aria-hidden="true" className="mb-3 font-mono text-xs text-muted">
        $ man 0x1d1e
        <Cursor />
      </p>
      <h1 className="font-display text-headline">Docs</h1>
      <p className="mt-4 max-w-xl text-text-soft">
        How to use each project. Pages are markdown in the site repo; adding or
        fixing one is a PR.
      </p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {[...docsByProject].map(([name, pages]) => {
          const p = projects.find((x) => x.name === name);
          return (
            <li key={name}>
              <Card className="group relative flex h-full flex-col gap-2 p-6 transition-transform duration-150 hover:-translate-y-0.5 hover:ring-accent focus-within:ring-accent">
                <h2 className="font-mono text-lg">
                  <AppLink
                    href={`/docs/${name}/${pages[0]!.slug}`}
                    className="after:absolute after:inset-0 focus-visible:outline-none"
                  >
                    {name}
                  </AppLink>
                </h2>
                {p && <p className="text-sm text-text-soft">{p.summary}</p>}
                <p className="mt-auto font-mono text-xs text-muted">
                  {pages.length} {pages.length === 1 ? 'page' : 'pages'}
                </p>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
