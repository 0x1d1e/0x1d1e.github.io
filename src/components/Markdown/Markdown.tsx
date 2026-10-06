import { useState, type ComponentProps, type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { AppLink } from '../AppLink/AppLink';

const REPO = 'https://github.com/0x1d1e';

function textOf(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (node && typeof node === 'object' && 'props' in node)
    return textOf((node.props as { children?: ReactNode }).children);
  return '';
}

function CodeBlock({ children }: { children?: ReactNode }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(textOf(children).replace(/\n$/, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable (insecure context): leave the button idle */
    }
  }
  return (
    <div className="group relative my-6">
      <pre className="overflow-x-auto bg-card p-4 font-mono text-xs leading-relaxed text-text-soft ring-1 ring-ring">
        {children}
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy code"
        className="absolute top-2 right-2 bg-chip px-2 py-1 font-mono text-xs text-muted opacity-0 transition-opacity duration-150 group-hover:opacity-100 hover:text-text focus-visible:opacity-100"
      >
        {copied ? 'copied' : 'copy'}
      </button>
    </div>
  );
}

function heading(Tag: 'h2' | 'h3' | 'h4', cls: string) {
  return function Heading({ id, children }: ComponentProps<'h2'>) {
    return (
      <Tag id={id} className={`group scroll-mt-24 font-display ${cls}`}>
        {children}
        {id && (
          <a
            href={`#${id}`}
            aria-label="Link to this section"
            className="ml-2 font-mono text-accent opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100"
          >
            #
          </a>
        )}
      </Tag>
    );
  };
}

/**
 * Renders a docs page. Relative links resolve against the project: `.md`
 * files that exist as docs become in-app routes, everything else points at
 * the repo. Remote images are not loaded (no third-party requests).
 */
export function Markdown({
  children,
  project,
  slugs,
  base = '',
}: {
  children: string;
  project: string;
  slugs: string[];
  /** BASE_URL without trailing slash, for in-app hrefs */
  base?: string;
}) {
  const components: Components = {
    h2: heading('h2', 'mt-14 mb-4 text-2xl tracking-tight'),
    h3: heading('h3', 'mt-10 mb-3 text-lg'),
    h4: heading('h4', 'mt-8 mb-2 text-base'),
    p: (p) => <p className="my-4 leading-7 text-text-soft" {...strip(p)} />,
    ul: (p) => (
      <ul
        className="my-4 list-disc space-y-1.5 pl-6 text-text-soft marker:text-muted"
        {...strip(p)}
      />
    ),
    ol: (p) => (
      <ol
        className="my-4 list-decimal space-y-1.5 pl-6 text-text-soft marker:text-muted"
        {...strip(p)}
      />
    ),
    li: (p) => <li className="leading-7" {...strip(p)} />,
    strong: (p) => <strong className="font-semibold text-text" {...strip(p)} />,
    blockquote: (p) => (
      <blockquote
        className="my-6 border-l-2 border-accent pl-4 text-muted"
        {...strip(p)}
      />
    ),
    hr: () => <hr className="my-10 border-ring" />,
    pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
    code: ({ className, children }) =>
      className ? (
        <code className={className}>{children}</code>
      ) : (
        <code className="bg-chip px-1.5 py-0.5 font-mono text-[0.85em] text-text">
          {children}
        </code>
      ),
    table: (p) => (
      <div className="my-6 overflow-x-auto ring-1 ring-ring">
        <table className="w-full text-left text-sm" {...strip(p)} />
      </div>
    ),
    th: (p) => (
      <th
        className="border-b border-ring bg-card px-3 py-2 font-mono text-xs text-muted uppercase"
        {...strip(p)}
      />
    ),
    td: (p) => (
      <td
        className="border-t border-ring px-3 py-2 align-top text-text-soft"
        {...strip(p)}
      />
    ),
    img: ({ alt }) =>
      alt ? <span className="text-muted">[{alt}]</span> : null,
    a: ({ href = '', children }) => {
      const cls = 'text-accent underline-offset-4 hover:underline';
      if (href.startsWith('#'))
        return (
          <a href={href} className={cls}>
            {children}
          </a>
        );
      if (/^https?:\/\//.test(href) || href.startsWith('mailto:'))
        return (
          <a
            href={href}
            className={cls}
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        );
      const [path = '', hash = ''] = href.split('#');
      const slug = path.replace(/^.*\//, '').replace(/\.md$/, '');
      if (path.endsWith('.md') && slugs.includes(slug))
        return (
          <AppLink
            href={`${base}/docs/${project}/${slug}${hash ? `#${hash}` : ''}`}
            className={cls}
          >
            {children}
          </AppLink>
        );
      const clean = path.replace(/^\.?\//, '').replace(/^(\.\.\/)+/, '');
      return (
        <a
          href={`${REPO}/${project}/blob/main/${clean}${hash ? `#${hash}` : ''}`}
          className={cls}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    },
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug]}
      components={components}
    >
      {children}
    </ReactMarkdown>
  );
}

/** react-markdown passes the hast `node` prop; keep it off DOM elements. */
function strip<T extends { node?: unknown }>(props: T) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { node, ...rest } = props;
  return rest;
}
