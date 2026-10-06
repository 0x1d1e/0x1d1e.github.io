import { z } from 'zod';
import { parseFrontmatter } from './frontmatter';
import { topicIds } from './topics';

export const projectSchema = z.object({
  name: z.string().min(1),
  summary: z.string().min(1),
  // Default is experimental: no fake stability.
  status: z
    .enum(['experimental', 'active', 'archived'])
    .default('experimental'),
  repo: z.url(),
  tags: z.array(z.string()).default([]),
  updated: z.iso.date(),
  topics: z.array(z.enum(topicIds)).default([]),
  // Illustration shown on the project's own page (see components/visuals).
  visual: z.enum(['gateway', 'pipeline', 'island']).optional(),
  // Supporting repos (plugins, frontends) listed on the project page, not on the landing page.
  addons: z.array(z.string()).default([]),
});

export type Project = z.infer<typeof projectSchema>;

export function parseProject(path: string, raw: string): Project {
  try {
    return projectSchema.parse(parseFrontmatter(raw).data);
  } catch (e) {
    throw new Error(`invalid content ${path}: ${(e as Error).message}`, {
      cause: e,
    });
  }
}

/** Parsed at build time; a bad file throws and fails the build. */
export function loadProjects(files: Record<string, string>): Project[] {
  return Object.entries(files)
    .map(([path, raw]) => parseProject(path, raw))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export const projects = loadProjects(
  import.meta.glob('../../content/projects/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  }),
);
