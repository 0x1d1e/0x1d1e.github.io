import { Button } from '../Button/Button';
import { RouteGraph } from '../RouteGraph/RouteGraph';
import { Reveal } from '../../motion/Reveal';

const topics = [
  'LLM gateways',
  'coding agents',
  'sandboxed workers',
  'WASM plugins',
];

/** The AI side of the org, anchored on Kinetix. Copy follows its README. */
export function AiSection() {
  return (
    <section
      aria-labelledby="ai-title"
      className="grid items-center gap-12 px-6 py-24 md:px-14 lg:grid-cols-2"
    >
      <Reveal>
        <p aria-hidden="true" className="mb-3 font-mono text-xs text-muted">
          $ kinetix route --fallback
        </p>
        <h2 id="ai-title" className="font-display text-headline">
          LLM traffic, in motion.
        </h2>
        <p className="mt-6 max-w-lg leading-7 text-text-soft">
          Kinetix is a self-hosted LLM gateway for coding agents and small
          technical teams. OpenAI- and Anthropic-compatible APIs sit in front of
          your providers, with virtual keys, routes, automatic fallback and
          usage tracking, in a single Rust binary.
        </p>
        <ul
          aria-label="Topics"
          className="mt-6 flex flex-wrap gap-2 font-mono text-xs"
        >
          {topics.map((t) => (
            <li
              key={t}
              className="rounded-chip bg-chip px-3 py-1 text-text-soft"
            >
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Button href="/projects/kinetix" arrow>
            About Kinetix
          </Button>
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <RouteGraph />
      </Reveal>
    </section>
  );
}
