import { useEffect, useState } from 'react';
import { AppLink } from '../../components/AppLink/AppLink';
import { Markdown } from '../../components/Markdown/Markdown';
import { docsByProject, type Doc } from '../../content/docs';
import { docMeta } from '../../seo/pageMeta';
import { useMeta } from '../../seo/useMeta';

const EDIT = 'https://github.com/0x1d1e/landing-page/edit/main';

/** Highlights the heading nearest the top of the viewport. */
function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState<string>();
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: '-80px 0px -70% 0px' },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

export function DocPage({ doc }: { doc: Doc }) {
  useMeta(docMeta(doc.project, doc.slug, doc.title, doc.description));
  const siblings = docsByProject.get(doc.project) ?? [];
  const i = siblings.findIndex((d) => d.slug === doc.slug);
  const prev = siblings[i - 1];
  const next = siblings[i + 1];
  const ids = doc.headings.map((h) => h.id);
  const active = useActiveHeading(ids);
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');

  return (
    <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_200px]">
      <article className="min-w-0 max-w-3xl">
        <p className="font-mono text-xs text-muted">
          <AppLink href="/docs" className="hover:text-text">docs</AppLink> /{' '}
          <span className="text-text-soft">{doc.project}</span>
        </p>
        <h1 className="mt-3 font-display text-headline">{doc.title}</h1>
        {doc.description && <p className="mt-3 text-text-soft">{doc.description}</p>}
        <Markdown project={doc.project} slugs={siblings.map((d) => d.slug)} base={base}>
          {doc.body}
        </Markdown>
        <footer className="mt-16 border-t border-ring pt-6">
          <p className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-muted">
            <a href={`${EDIT}/${doc.path}`} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              edit this page
            </a>
            {doc.source && (
              <a href={doc.source} target="_blank" rel="noopener noreferrer" className="hover:text-text">
                source in project repo
              </a>
            )}
          </p>
          <nav aria-label="Pages" className="mt-8 grid grid-cols-2 gap-4 font-mono text-sm">
            <div>
              {prev && (
                <AppLink href={`/docs/${doc.project}/${prev.slug}`} className="block ring-1 ring-ring p-4 text-text-soft transition-colors duration-150 hover:text-accent hover:ring-accent">
                  <span className="block text-xs text-muted">← previous</span>
                  {prev.title}
                </AppLink>
              )}
            </div>
            <div>
              {next && (
                <AppLink href={`/docs/${doc.project}/${next.slug}`} className="block text-right ring-1 ring-ring p-4 text-text-soft transition-colors duration-150 hover:text-accent hover:ring-accent">
                  <span className="block text-xs text-muted">next →</span>
                  {next.title}
                </AppLink>
              )}
            </div>
          </nav>
        </footer>
      </article>
      {doc.headings.length > 0 && (
        <nav aria-label="On this page" className="hidden xl:sticky xl:top-24 xl:block xl:self-start">
          <p className="font-mono text-xs text-muted uppercase">on this page</p>
          <ul className="mt-3 flex flex-col gap-1.5 border-l border-ring text-xs">
            {doc.headings.map((h) => (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  className={`-ml-px block border-l py-0.5 transition-colors duration-150 ${h.depth === 3 ? 'pl-6' : 'pl-3'} ${active === h.id ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-text'}`}
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
