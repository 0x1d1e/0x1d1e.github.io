import { Cursor } from '../components/Cursor/Cursor';
import { Principles } from '../components/Principles/Principles';
import { Stage, type StagePage } from '../motion/Stage';

const ORG = 'https://github.com/0x1d1e';
const interests = [
  'AI / LLM infrastructure',
  'AI research: training, evals, deployment',
  'developer tools',
  'agents and automation',
  'Linux desktop software',
  'interfaces',
  'infrastructure',
  'whatever seems interesting next',
];

const pages: StagePage[] = [
  {
    id: 'about',
    label: 'About',
    node: (
      <section
        aria-labelledby="about-title"
        className="flex min-h-svh flex-col justify-end gap-6 px-6 pt-32 pb-20 md:px-14"
      >
        <p aria-hidden="true" className="font-mono text-xs text-muted">
          $ whoami
          <Cursor />
        </p>
        <h1 id="about-title" className="font-display text-headline">
          About
        </h1>
        <p className="max-w-2xl text-xl leading-8 text-text-soft">
          0x1d1e is a loose group of people building things in hobby time,
          unemployed time, weekends, late nights, or whenever there are spare
          CPU cycles.
        </p>
        <ul
          aria-label="Interests"
          className="flex max-w-2xl flex-wrap gap-2 font-mono text-xs"
        >
          {interests.map((t) => (
            <li
              key={t}
              className="rounded-chip bg-chip px-3 py-1 text-text-soft"
            >
              {t}
            </li>
          ))}
        </ul>
      </section>
    ),
  },
  {
    id: 'why',
    label: 'Why',
    node: (
      <section
        aria-labelledby="why-title"
        className="px-6 py-24 md:px-14 lg:py-0"
      >
        <h2 id="why-title" className="font-display text-headline">
          Why
        </h2>
        <blockquote className="mt-8 border-l-2 border-accent pl-6 font-mono text-lg text-text">
          &ldquo;what if we just built it?&rdquo;
        </blockquote>
        <div className="mt-8 max-w-2xl space-y-4 leading-7 text-text-soft">
          <p>Most projects here start with some variation of that question.</p>
          <p>
            Sometimes that produces a useful tool. Sometimes it produces a
            prototype that answers one question and is never touched again. Both
            are valid outcomes.
          </p>
        </div>
      </section>
    ),
  },
  { id: 'principles', label: 'How we work', node: <Principles /> },
  {
    id: 'status',
    label: 'Status',
    node: (
      <section
        aria-labelledby="status-title"
        className="px-6 py-24 md:px-14 lg:py-0"
      >
        <h2 id="status-title" className="font-display text-headline">
          Status, contributing, security
        </h2>
        <p className="mt-8 max-w-2xl border-l-2 border-accent pl-6 font-mono text-sm leading-6 text-text">
          Unless a repository explicitly says otherwise, assume: experimental.
          APIs may break, designs may change, dragons possible.
        </p>
        <div className="mt-8 max-w-2xl space-y-4 leading-7 text-text-soft">
          <p>
            Individual repositories define their own stability, releases,
            compatibility guarantees, and support expectations.
            Repository-specific instructions override the organization defaults.
          </p>
          <p>Please don&apos;t put vulnerabilities in public issues.</p>
        </div>
        <p className="mt-8 flex flex-wrap gap-x-8 gap-y-2 font-mono text-sm">
          {[
            ['Contributing', `${ORG}/.github/blob/main/CONTRIBUTING.md`],
            ['Security policy', `${ORG}/.github/blob/main/SECURITY.md`],
            ['GitHub', ORG],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              {label} ↗
            </a>
          ))}
        </p>
      </section>
    ),
  },
];

export function About() {
  return <Stage pages={pages} />;
}
