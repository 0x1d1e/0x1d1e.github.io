/**
 * Writes a page's own metadata into the app's HTML (its title, description,
 * address and preview card). Chat apps and social sites read the HTML as it is
 * served and do not run scripts, so this has to be done at build time.
 */
import type { PageMeta } from './pageMeta';

const escape = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/** The page's address: site, then the base path, then the route. */
export function pageUrl(siteUrl: string, base: string, path: string) {
  const root = `${siteUrl}${base.replace(/\/?$/, '/')}`;
  return path === '/' ? root : `${root}${path.replace(/^\//, '')}`;
}

/** Replaces `<meta attr="value" ...>` (any layout) with one carrying `content`. */
function setMeta(
  html: string,
  attr: 'name' | 'property',
  value: string,
  content: string,
) {
  const re = new RegExp(`<meta\\b[^>]*\\b${attr}="${value}"[^>]*>`);
  const tag = `<meta ${attr}="${value}" content="${escape(content)}" />`;
  return re.test(html)
    ? html.replace(re, () => tag)
    : html.replace('</head>', () => `${tag}</head>`);
}

export function renderMeta(
  html: string,
  m: PageMeta,
  siteUrl: string,
  base = '/',
) {
  const url = pageUrl(siteUrl, base, m.path);
  let out = html.replace(
    /<title>[\s\S]*?<\/title>/,
    () => `<title>${escape(m.title)}</title>`,
  );
  out = out.replace(
    /<link\b[^>]*\brel="canonical"[^>]*>/,
    () => `<link rel="canonical" href="${escape(url)}" />`,
  );
  out = setMeta(out, 'name', 'description', m.description);
  out = setMeta(out, 'property', 'og:title', m.title);
  out = setMeta(out, 'property', 'og:description', m.description);
  out = setMeta(out, 'property', 'og:url', url);
  out = setMeta(out, 'name', 'twitter:title', m.title);
  out = setMeta(out, 'name', 'twitter:description', m.description);
  return m.noindex ? setMeta(out, 'name', 'robots', 'noindex') : out;
}

/** sitemap.xml for the routes that should be found. */
export function sitemap(metas: PageMeta[], siteUrl: string, base = '/') {
  const urls = metas
    .filter((m) => !m.noindex)
    .map(
      (m) =>
        `  <url><loc>${escape(pageUrl(siteUrl, base, m.path))}</loc></url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
