import type { Metric } from '../../data/fixtures';

export function MetricsGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <section aria-label="Metrics" className="px-6 py-24 md:px-14">
      <dl className="grid grid-cols-2 border-t border-l border-ring lg:grid-cols-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="flex flex-col gap-4 border-r border-b border-ring p-6"
          >
            <dt className="font-mono text-xs text-muted uppercase">
              {m.label}
            </dt>
            <dd className="order-first font-display text-[56px] leading-none tracking-[-3.36px]">
              {m.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
