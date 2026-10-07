import { expect, test } from 'vitest';
import { renderMeta, pageUrl, sitemap } from './html';
import {
  HOME,
  NOT_FOUND,
  SITE_URL,
  STATIC_META,
  allMeta,
  clamp,
  docMeta,
  projectMeta,
} from './pageMeta';
import { applyMeta } from './useMeta';

const shell = `<!doctype html><html><head>
<title>old</title>
<meta name="description" content="old" />
<link rel="canonical" href="https://x.test/" />
<meta property="og:title" content="old" />
<meta
  property="og:description"
  content="old"
/>
<meta property="og:url" content="https://x.test/" />
<meta property="og:image" content="https://x.test/og.png" />
<meta name="twitter:title" content="old" />
<meta name="twitter:description" content="old" />
</head><body></body></html>`;

const projects = [
  { name: 'kinetix', summary: 'Put your LLM traffic in motion.' },
];
const docs = [
  { project: 'merro', slug: 'lifecycle', title: 'Lifecycle' },
  {
    project: 'merro',
    slug: 'overview',
    title: 'Overview',
    description: 'How it fits.',
  },
];

test('every page has its own title, description and address', () => {
  const metas = allMeta(projects, docs);
  expect(metas.map((m) => m.path)).toEqual([
    '/',
    '/about',
    '/projects',
    '/docs',
    '/projects/kinetix',
    '/docs/merro/lifecycle',
    '/docs/merro/overview',
  ]);
  expect(new Set(metas.map((m) => m.title)).size).toBe(metas.length);
  expect(new Set(metas.map((m) => m.path)).size).toBe(metas.length);
  for (const m of metas) {
    expect(m.title.length).toBeGreaterThan(0);
    expect(m.title.length).toBeLessThanOrEqual(70);
    expect(m.description.length).toBeGreaterThan(10);
    expect(m.description.length).toBeLessThanOrEqual(200);
  }
});

test('titles say where you are; the home page leads with the name', () => {
  expect(HOME.title).toBe('0x1d1e: software made during idle cycles');
  expect(STATIC_META['/about']!.title).toBe('About · 0x1d1e');
  expect(projectMeta('kinetix', 's').title).toBe('kinetix · 0x1d1e');
  expect(docMeta('merro', 'lifecycle', 'Lifecycle').title).toBe(
    'Lifecycle: merro docs · 0x1d1e',
  );
});

test('long descriptions are cut at a word, with an ellipsis', () => {
  const cut = clamp('word '.repeat(80), 60);
  expect(cut.length).toBeLessThanOrEqual(60);
  expect(cut.endsWith('word…')).toBe(true);
  expect(clamp('short  text\n here')).toBe('short text here');
});

test('a doc without its own description still gets a sensible one', () => {
  expect(docMeta('merro', 'lifecycle', 'Lifecycle').description).toBe(
    'Lifecycle, from the documentation of merro.',
  );
  expect(docMeta('merro', 'o', 'Overview', 'How it fits.').description).toBe(
    'How it fits.',
  );
});

test('rendering rewrites every tag of the page, whatever the tag layout', () => {
  const html = renderMeta(
    shell,
    projectMeta('kinetix', 'Put "LLM" <fast>.'),
    'https://x.test',
  );
  expect(html).toContain('<title>kinetix · 0x1d1e</title>');
  expect(html).toContain(
    '<link rel="canonical" href="https://x.test/projects/kinetix" />',
  );
  expect(html).toContain(
    '<meta property="og:url" content="https://x.test/projects/kinetix" />',
  );
  expect(html).toContain(
    '<meta property="og:title" content="kinetix · 0x1d1e" />',
  );
  expect(html).toContain(
    '<meta name="twitter:title" content="kinetix · 0x1d1e" />',
  );
  // quotes and angle brackets are escaped, the multi-line tag was replaced whole
  expect(html).toContain('content="Put &quot;LLM&quot; &lt;fast&gt;."');
  expect(html).not.toContain('content="old"');
  // the image is left alone
  expect(html).toContain('og:image" content="https://x.test/og.png"');
});

test('pages that do not exist are kept out of search', () => {
  expect(renderMeta(shell, NOT_FOUND, 'https://x.test')).toContain(
    '<meta name="robots" content="noindex" />',
  );
  expect(renderMeta(shell, HOME, 'https://x.test')).not.toContain('noindex');
});

test('addresses honour the base path', () => {
  expect(pageUrl('https://x.test', '/', '/')).toBe('https://x.test/');
  expect(pageUrl('https://x.test', '/', '/about')).toBe('https://x.test/about');
  expect(pageUrl('https://x.test', '/repo/', '/about')).toBe(
    'https://x.test/repo/about',
  );
  expect(pageUrl('https://x.test', '/repo', '/')).toBe('https://x.test/repo/');
});

test('the sitemap lists the pages that should be found, and not the not-found page', () => {
  const xml = sitemap([...allMeta(projects, docs), NOT_FOUND], SITE_URL);
  expect(xml).toContain('<loc>https://0x1d1e.tech/</loc>');
  expect(xml).toContain('<loc>https://0x1d1e.tech/docs/merro/lifecycle</loc>');
  expect(xml).not.toContain('/404');
});

test('navigating updates the tab title and the head tags, and robots comes and goes', () => {
  document.head.innerHTML =
    '<meta name="description" content="old" /><link rel="canonical" href="x" />';
  applyMeta(STATIC_META['/about']!, document, 'https://x.test', '/');
  expect(document.title).toBe('About · 0x1d1e');
  const get = (sel: string) => document.head.querySelector(sel)!;
  expect(get('meta[name="description"]').getAttribute('content')).toContain(
    'loose group',
  );
  expect(get('link[rel="canonical"]').getAttribute('href')).toBe(
    'https://x.test/about',
  );
  expect(get('meta[property="og:url"]').getAttribute('content')).toBe(
    'https://x.test/about',
  );
  expect(
    document.head.querySelectorAll('meta[name="description"]'),
  ).toHaveLength(1);

  applyMeta(NOT_FOUND, document, 'https://x.test', '/');
  expect(get('meta[name="robots"]').getAttribute('content')).toBe('noindex');
  applyMeta(HOME, document, 'https://x.test', '/');
  expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
  expect(document.title).toBe(HOME.title);
});
