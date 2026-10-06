import { expect, test } from 'vitest';
import {
  docs,
  docsByProject,
  extractHeadings,
  groupByProject,
  loadDocs,
  searchDocs,
} from './docs';

const mk = (title: string, order: number, body = 'x') =>
  `---\ntitle: ${title}\norder: ${order}\n---\n${body}`;

test('orders by order then title and groups by project', () => {
  const all = loadDocs({
    '../../content/docs/a/z.md': mk('Zed', 2),
    '../../content/docs/a/y.md': mk('Why', 1),
    '../../content/docs/b/x.md': mk('Ex', 0),
  });
  const g = groupByProject(all);
  expect(g.get('a')!.map((d) => d.slug)).toEqual(['y', 'z']);
  expect([...g.keys()]).toEqual(['a', 'b']);
});

test('headings skip code fences and dedupe ids', () => {
  const h = extractHeadings(
    '# T\n## A `b`\n```\n## no\n```\n## A `b`\n### C\n#### d',
  );
  expect(h).toEqual([
    { depth: 2, text: 'A b', id: 'a-b' },
    { depth: 2, text: 'A b', id: 'a-b-1' },
    { depth: 3, text: 'C', id: 'c' },
  ]);
});

test('bad content names the file', () => {
  expect(() =>
    loadDocs({ '../../content/docs/a/x.md': 'no frontmatter' }),
  ).toThrow(/a\/x\.md/);
  expect(() => loadDocs({ 'docs/x.md': mk('t', 1) })).toThrow(
    /invalid doc path/,
  );
  expect(() =>
    loadDocs({ '../../content/docs/a/x.md': '---\norder: 1\n---\n' }),
  ).toThrow();
});

test('search matches every term in title or body, titles first', () => {
  const all = loadDocs({
    '../../content/docs/a/one.md': mk('Install', 1, 'run the thing'),
    '../../content/docs/a/two.md': mk('Other', 2, 'install notes'),
  });
  expect(searchDocs(all, 'install').map((d) => d.slug)).toEqual(['one', 'two']);
  expect(searchDocs(all, 'install nope')).toEqual([]);
  expect(searchDocs(all, '  ')).toEqual([]);
});

test('seed docs cover every project', () => {
  expect([...docsByProject.keys()]).toEqual(['kanade', 'kinetix', 'merro']);
  expect(docs.every((d) => d.headings.every((h) => h.id))).toBe(true);
});
