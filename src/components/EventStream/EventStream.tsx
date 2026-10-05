import { useState } from 'react';
import type { Trace } from '../../data/fixtures';
import { Chip } from '../Chip/Chip';
import { TimelineBar } from '../TimelineBar/TimelineBar';

export function EventStream({ traces }: { traces: Trace[] }) {
  const [traceId, setTraceId] = useState(traces[0]?.id);
  const [focusId, setFocusId] = useState<string>();
  const trace = traces.find((t) => t.id === traceId) ?? traces[0];
  if (!trace) return null;

  return (
    <section aria-labelledby="events-title" className="px-6 py-24 md:px-14">
      <h2 id="events-title" className="font-display text-headline">
        Event stream
      </h2>
      <p className="mt-2 font-mono text-xs text-muted">
        Illustrative data, not live traces.
      </p>
      <div className="mt-8 grid bg-card ring-1 ring-ring md:grid-cols-[240px_1fr]">
        <ul
          aria-label="Traces"
          className="border-b border-ring font-mono text-sm md:border-r md:border-b-0"
        >
          {traces.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                aria-current={t.id === trace.id}
                onClick={() => {
                  setTraceId(t.id);
                  setFocusId(undefined);
                }}
                className={`w-full px-4 py-3 text-left transition-colors duration-150 hover:text-text ${t.id === trace.id ? 'text-accent' : 'text-muted'}`}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-sm">
            <caption className="sr-only">Spans for {trace.label}</caption>
            <thead className="text-left text-xs text-muted uppercase">
              <tr>
                <th scope="col" className="px-4 py-3 font-normal">
                  span
                </th>
                <th scope="col" className="px-4 py-3 font-normal">
                  status
                </th>
                <th scope="col" className="px-4 py-3 text-right font-normal">
                  ms
                </th>
                <th scope="col" className="w-1/3 px-4 py-3 font-normal">
                  timeline
                </th>
              </tr>
            </thead>
            <tbody>
              {trace.spans.map((s) => {
                const active = s.id === focusId;
                return (
                  <tr
                    key={s.id}
                    data-active={active}
                    tabIndex={0}
                    aria-selected={active}
                    onClick={() => setFocusId(s.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setFocusId(s.id);
                      }
                    }}
                    className={`cursor-pointer border-t border-ring transition-colors duration-150 ${active ? 'text-accent' : 'text-text-soft'}`}
                  >
                    <td className="px-4 py-3">{s.name}</td>
                    <td className="px-4 py-3">
                      <Chip status={s.status} />
                    </td>
                    <td className="px-4 py-3 text-right">{s.durationMs}</td>
                    <td className="px-4 py-3">
                      <TimelineBar
                        left={s.left}
                        width={s.width}
                        active={active}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
