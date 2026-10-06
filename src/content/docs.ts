import GithubSlugger from 'github-slugger';
import { z } from 'zod';
import { parseFrontmatter } from './frontmatter';

const docSchema = z.object({
  title: z.string().min(1),
  order: z.coerce.number().default(100),
  description: z.string().optional(),
  source: z.url().optional(),
});

export type Heading = { depth: 2 | 3; text: string; id: string };

export type Doc = z.infer<typeof docSchema> & {
  project: string;
  slug: string;
  body: string;
  headings: Heading[];
  /** repo-relative path, for "edit this page" links */
  path: string;
};

const PATH = /content\/docs\/([^/]+)\/([^/]+)\.md$/;

/** h2/h3 outline, skipping fenced code. Ids match rehype-slug's. */
export function extractHeadings(body: string): Heading[] {
  const slugger = new GithubSlugger();
  const out: Heading[] = [];
  let fenced = false;
  for (const line of body.split('\n')) {
    if (/^\s*```/.test(line)) fenced = !fenced;
    if (fenced) continue;
    const m = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const text = (m[2] ?? '')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[`*_]/g, '');
    const id = slugger.slug(text); // consume every depth, like rehype-slug
    const depth = m[1]!.length;
    if (depth === 2 || depth === 3) out.push({ depth, text, id });
  }
  return out;
}

export function parseDoc(path: string, raw: string): Doc {
  const m = PATH.exec(path);
  if (!m)
    throw new Error(
      `invalid doc path ${path}: expected content/docs/<project>/<slug>.md`,
    );
  try {
    const { data, body } = parseFrontmatter(raw);
    return {
      ...docSchema.parse(data),
      project: m[1]!,
      slug: m[2]!,
      body,
      headings: extractHeadings(body),
      path: `content/docs/${m[1]}/${m[2]}.md`,
    };
  } catch (e) {
    throw new Error(`invalid content ${path}: ${(e as Error).message}`, {
      cause: e,
    });
  }
}

/** Parsed at build time; a bad file throws and fails the build. */
export function loadDocs(files: Record<string, string>): Doc[] {
  return Object.entries(files)
    .map(([path, raw]) => parseDoc(path, raw))
    .sort(
      (a, b) =>
        a.project.localeCompare(b.project) ||
        a.order - b.order ||
        a.title.localeCompare(b.title),
    );
}

export function groupByProject(all: Doc[]): Map<string, Doc[]> {
  const map = new Map<string, Doc[]>();
  for (const d of all) map.set(d.project, [...(map.get(d.project) ?? []), d]);
  return map;
}

export function searchDocs(all: Doc[], query: string): Doc[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return all
    .map((d) => {
      const title = `${d.project} ${d.title}`.toLowerCase();
      const body = d.body.toLowerCase();
      if (!terms.every((t) => title.includes(t) || body.includes(t)))
        return null;
      return { d, score: terms.filter((t) => title.includes(t)).length };
    })
    .filter((r): r is { d: Doc; score: number } => r !== null)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.d);
}

export const docs = loadDocs(
  import.meta.glob('../../content/docs/*/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  }),
);
export const docsByProject = groupByProject(docs);
export const getDoc = (project: string, slug: string) =>
  docs.find((d) => d.project === project && d.slug === slug);
