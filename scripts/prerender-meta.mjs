// After `vite build`: give every page its own HTML (title, description, address and
// link-preview card), a sitemap, and the 404 shell. The app is a single-page app;
// chat apps and search engines read the HTML as served, without running it, so
// each address needs its own tags in the file. The page itself is the same shell.
//
// Runs the TypeScript in src/seo directly (Node strips the types).
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
  copyFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { parseFrontmatter } from '../src/content/frontmatter.ts';
import { SITE_URL, allMeta } from '../src/seo/pageMeta.ts';
import { renderMeta, sitemap } from '../src/seo/html.ts';

const base = process.env.BASE_PATH ?? '/';
const front = (file) => parseFrontmatter(readFileSync(file, 'utf8')).data;

const projects = readdirSync('content/projects')
  .filter((f) => f.endsWith('.md'))
  .map((f) => front(join('content/projects', f)));

const docs = readdirSync('content/docs', { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .flatMap((d) =>
    readdirSync(join('content/docs', d.name))
      .filter((f) => f.endsWith('.md'))
      .map((f) => ({
        ...front(join('content/docs', d.name, f)),
        project: d.name,
        slug: f.replace(/\.md$/, ''),
      })),
  );

const metas = allMeta(projects, docs);
const shell = readFileSync('dist/index.html', 'utf8');

for (const m of metas) {
  const html = renderMeta(shell, m, SITE_URL, base);
  if (m.path === '/') writeFileSync('dist/index.html', html);
  else {
    mkdirSync(`dist${m.path}`, { recursive: true });
    writeFileSync(`dist${m.path}/index.html`, html);
  }
}

writeFileSync('dist/sitemap.xml', sitemap(metas, SITE_URL, base));

// Static hosts (GitHub Pages) serve 404.html for unknown paths; the SPA shell shows its own not-found page.
copyFileSync('dist/index.html', 'dist/404.html');
console.log(`meta: ${metas.length} pages`);
