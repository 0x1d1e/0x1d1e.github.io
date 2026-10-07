import { useEffect } from 'react';
import { SITE_URL, type PageMeta } from './pageMeta';

function tag(
  doc: Document,
  selector: string,
  make: () => HTMLElement,
): HTMLElement {
  const found = doc.head.querySelector<HTMLElement>(selector);
  if (found) return found;
  const el = make();
  doc.head.append(el);
  return el;
}

function meta(
  doc: Document,
  attr: 'name' | 'property',
  value: string,
  content: string,
) {
  const el = tag(doc, `meta[${attr}="${value}"]`, () => {
    const m = doc.createElement('meta');
    m.setAttribute(attr, value);
    return m;
  });
  el.setAttribute('content', content);
}

/** Points the tab title and the head's description, address and card at this page. */
export function applyMeta(
  m: PageMeta,
  doc: Document = document,
  siteUrl: string = SITE_URL,
  base: string = import.meta.env.BASE_URL,
) {
  const root = `${siteUrl}${base.replace(/\/?$/, '/')}`;
  const url = m.path === '/' ? root : `${root}${m.path.replace(/^\//, '')}`;
  doc.title = m.title;
  meta(doc, 'name', 'description', m.description);
  meta(doc, 'property', 'og:title', m.title);
  meta(doc, 'property', 'og:description', m.description);
  meta(doc, 'property', 'og:url', url);
  meta(doc, 'name', 'twitter:title', m.title);
  meta(doc, 'name', 'twitter:description', m.description);
  const canonical = tag(doc, 'link[rel="canonical"]', () => {
    const l = doc.createElement('link');
    l.setAttribute('rel', 'canonical');
    return l;
  });
  canonical.setAttribute('href', url);
  const robots = doc.head.querySelector('meta[name="robots"]');
  if (m.noindex) meta(doc, 'name', 'robots', 'noindex');
  else robots?.remove();
}

/** Keeps the document's metadata in step with the page on screen. */
export function useMeta(m: PageMeta | undefined) {
  const title = m?.title;
  const description = m?.description;
  const path = m?.path;
  const noindex = m?.noindex;
  useEffect(() => {
    if (title === undefined || description === undefined || path === undefined)
      return;
    applyMeta({ title, description, path, noindex });
  }, [title, description, path, noindex]);
}
