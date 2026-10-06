import { principles } from '../../content/principles';
import { Card } from '../Card/Card';

export function Principles({ as: H = 'h2' }: { as?: 'h1' | 'h2' }) {
  return (
    <section
      aria-labelledby="principles-title"
      className="px-6 py-24 md:px-14 lg:py-0"
    >
      <div>
        <p aria-hidden="true" className="mb-3 font-mono text-xs text-muted">
          $ cat PRINCIPLES.md
        </p>
        <H id="principles-title" className="font-display text-headline">
          How we work
        </H>
      </div>
      <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {principles.map((p, i) => (
          <li key={p.title}>
            <div className="h-full">
              <Card className="group flex h-full flex-col gap-3 p-6 transition-colors duration-150 hover:ring-accent">
                <span
                  aria-hidden="true"
                  className="font-mono text-xs text-accent"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-lg">{p.title}</h3>
                <p className="text-sm leading-6 text-text-soft">{p.body}</p>
              </Card>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
