/**
 * What each page says about itself: its title and description, for the tab, for
 * search, and for the preview card that chat apps and social sites show when the
 * link is pasted. Shared by the app (live titles) and the build (per-page HTML),
 * so it imports nothing and uses only syntax Node can run as is.
 */
export const SITE_URL = 'https://0x1d1e.tech';
export const SITE_NAME = '0x1d1e';
export const TAGLINE = 'software made during idle cycles';
/** The preview image: public/og.png, rendered by scripts/render-og.mjs. */
export const OG_IMAGE = { path: 'og.png', width: 1200, height: 630 };

export type PageMeta = {
  title: string;
  description: string;
  /** The route, with a leading slash and no trailing one ("/" for home). */
  path: string;
  /** Keep it out of search results (pages that do not exist). */
  noindex?: boolean;
};

/** Previews cut off around 150 to 200 characters. */
export function clamp(text: string, max = 180) {
  const s = text.replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

const named = (title: string) => `${title} · ${SITE_NAME}`;

export const HOME: PageMeta = {
  title: `${SITE_NAME}: ${TAGLINE}`,
  description:
    'We build tools in tech and AI: gateways, coding agents, developer tools and desktop software. Small, working, and honest about how finished it is.',
  path: '/',
};

export const STATIC_META: Record<string, PageMeta> = {
  '/': HOME,
  '/about': {
    title: named('About'),
    description:
      '0x1d1e is a loose group of people building things in hobby time, weekends, late nights, or whenever there are spare CPU cycles.',
    path: '/about',
  },
  '/projects': {
    title: named('Projects'),
    description:
      'Everything we have built so far: an LLM gateway, a coding-agent pipeline, desktop software. Each one says how finished it really is.',
    path: '/projects',
  },
  '/docs': {
    title: named('Docs'),
    description:
      'Documentation for our projects: how they work, how they are configured, and what they do when something goes wrong.',
    path: '/docs',
  },
};

export const NOT_FOUND: PageMeta = {
  title: named('Not found'),
  description: 'There is nothing at this address.',
  path: '/404',
  noindex: true,
};

export function projectMeta(name: string, summary: string): PageMeta {
  return {
    title: named(name),
    description: clamp(summary),
    path: `/projects/${name}`,
  };
}

export function docMeta(
  project: string,
  slug: string,
  title: string,
  description?: string,
): PageMeta {
  return {
    title: named(`${title}: ${project} docs`),
    description: clamp(
      description ?? `${title}, from the documentation of ${project}.`,
    ),
    path: `/docs/${project}/${slug}`,
  };
}

/** Every page that has its own address, as the build writes them out. */
export function allMeta(
  projects: { name: string; summary: string }[],
  docs: {
    project: string;
    slug: string;
    title: string;
    description?: string;
  }[],
): PageMeta[] {
  return [
    ...Object.values(STATIC_META),
    ...projects.map((p) => projectMeta(p.name, p.summary)),
    ...docs.map((d) => docMeta(d.project, d.slug, d.title, d.description)),
  ];
}
