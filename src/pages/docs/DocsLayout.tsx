import { useState, type ReactNode } from 'react';
import { NavLink, useParams } from 'react-router';
import { groupByProject, searchDocs, type Doc } from '../../content/docs';
import { AppLink } from '../../components/AppLink/AppLink';

/** Wiki frame: search + per-project page tree on the left, page on the right. */
export function DocsLayout({ docs, children }: { docs: Doc[]; children: ReactNode }) {
  const { '*': rest = '' } = useParams();
  const current = rest.split('/')[0] ?? '';
  const [query, setQuery] = useState('');
  const results = searchDocs(docs, query);
  const groups = groupByProject(docs);

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-6 pt-32 pb-24 md:px-14 lg:grid-cols-[240px_1fr]">
      <aside aria-label="Docs navigation" className="lg:sticky lg:top-24 lg:max-h-[calc(100svh-8rem)] lg:self-start lg:overflow-y-auto">
        <AppLink href="/docs" className="font-mono text-xs text-muted uppercase hover:text-text">
          docs
        </AppLink>
        <label className="mt-4 block">
          <span className="sr-only">Search docs</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search…"
            className="w-full bg-card px-3 py-2 font-mono text-sm text-text ring-1 ring-ring transition-shadow duration-150 outline-none placeholder:text-muted focus:ring-accent"
          />
        </label>
        {query.trim() ? (
          <ul aria-label="Search results" className="mt-4 flex flex-col gap-1 font-mono text-sm">
            {results.length === 0 && <li className="text-muted">no matches</li>}
            {results.map((d) => (
              <li key={`${d.project}/${d.slug}`}>
                <AppLink
                  href={`/docs/${d.project}/${d.slug}`}
                  onClick={() => setQuery('')}
                  className="block py-1 text-text-soft hover:text-accent"
                >
                  <span className="text-muted">{d.project} /</span> {d.title}
                </AppLink>
              </li>
            ))}
          </ul>
        ) : (
          <nav className="mt-6 flex flex-col gap-5">
            {[...groups].map(([project, pages]) => (
              <div key={project}>
                <p className={`font-mono text-sm ${project === current ? 'text-text' : 'text-muted'}`}>
                  {project}
                </p>
                <ul className="mt-1 border-l border-ring">
                  {pages.map((d) => (
                    <li key={d.slug}>
                      <NavLink
                        to={`/docs/${project}/${d.slug}`}
                        className={({ isActive }) =>
                          `-ml-px block border-l py-1 pl-3 text-sm transition-colors duration-150 ${isActive ? 'border-accent text-accent' : 'border-transparent text-text-soft hover:text-text'}`
                        }
                      >
                        {d.title}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        )}
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
