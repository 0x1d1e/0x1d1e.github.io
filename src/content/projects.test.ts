import { expect, test } from 'vitest';
import { loadProjects, projects } from './projects';

const ok = `---
name: x
summary: s
repo: https://example.com/x
tags: [a, b]
updated: 2026-01-02
---
`;

test('defaults status to experimental and parses tags', () => {
  const [p] = loadProjects({ 'x.md': ok });
  expect(p).toMatchObject({ status: 'experimental', tags: ['a', 'b'] });
});

test('throws with the file path on bad content', () => {
  expect(() => loadProjects({ 'bad.md': ok.replace('https://', '') })).toThrow(
    /bad\.md/,
  );
  expect(() => loadProjects({ 'n.md': 'no frontmatter' })).toThrow(/n\.md/);
});

test('seed content loads', () => {
  expect(projects.map((p) => p.name)).toEqual(['kanade', 'kinetix', 'merro']);
});
