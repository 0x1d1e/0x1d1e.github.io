import type { ReactNode } from 'react';
import type { DiffLine } from '../../data/fixtures';
import type { ChipStatus } from '../Chip/Chip';
import { Card } from '../Card/Card';
import { Chip } from '../Chip/Chip';

type Regression = { name: string; delta: string; status: ChipStatus };
type Cluster = { label: string; count: number; pct: number };

function BentoCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="flex flex-col gap-4 p-6">
      <h3 className="font-display text-lg">{title}</h3>
      {children}
    </Card>
  );
}

export function RegressionCard({ items }: { items: Regression[] }) {
  return (
    <BentoCard title="Regression">
      <ul className="flex flex-col gap-3 font-mono text-sm">
        {items.map((r) => (
          <li key={r.name} className="flex items-center justify-between gap-4">
            <span className="text-text-soft">{r.name}</span>
            <span className="flex items-center gap-3">
              <span className="text-muted">{r.delta}</span>
              <Chip status={r.status} />
            </span>
          </li>
        ))}
      </ul>
    </BentoCard>
  );
}

export function ClusteringCard({ items }: { items: Cluster[] }) {
  return (
    <BentoCard title="Failure clustering">
      <ul className="flex flex-col gap-4 font-mono text-sm">
        {items.map((c) => (
          <li key={c.label} className="flex flex-col gap-2">
            <span className="flex justify-between text-text-soft">
              {c.label}
              <span className="text-muted">{c.count}</span>
            </span>
            <span aria-hidden="true" className="block h-1.5 bg-chip">
              <span
                className="block h-full rounded-bar bg-accent"
                style={{ width: `${c.pct}%` }}
              />
            </span>
          </li>
        ))}
      </ul>
    </BentoCard>
  );
}

const diffTone = {
  add: 'text-success',
  del: 'text-muted',
  ctx: 'text-text-soft',
};
const diffMark = { add: '+', del: '-', ctx: ' ' };

export function VersionReplayCard({ lines }: { lines: DiffLine[] }) {
  return (
    <BentoCard title="Version replay">
      <pre className="font-mono text-sm" aria-label="Diff">
        {lines.map((l, i) => (
          <code
            key={i}
            data-kind={l.kind}
            className={`block ${diffTone[l.kind]}`}
          >
            {diffMark[l.kind]} {l.text}
          </code>
        ))}
      </pre>
    </BentoCard>
  );
}

export function Bento({ children }: { children: ReactNode }) {
  return (
    <section aria-label="Highlights" className="px-6 py-24 md:px-14">
      <div className="grid gap-4 md:grid-cols-3">{children}</div>
    </section>
  );
}
