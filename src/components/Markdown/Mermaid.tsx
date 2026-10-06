import { useEffect, useId, useState } from 'react';

const token = (name: string) =>
  getComputedStyle(document.documentElement)
    .getPropertyValue(`--color-${name}`)
    .trim();

/** Renders a mermaid diagram. The library is loaded on demand, only for pages that have one. */
export function Mermaid({ chart }: { chart: string }) {
  const id = `mermaid-${useId().replace(/:/g, '')}`;
  const [svg, setSvg] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const { default: mermaid } = await import('mermaid');
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'base',
          fontFamily: 'Inter Variable, ui-sans-serif, system-ui, sans-serif',
          themeVariables: {
            darkMode: true,
            background: token('bg'),
            primaryColor: token('card'),
            primaryTextColor: token('text'),
            primaryBorderColor: token('accent'),
            lineColor: token('muted'),
            secondaryColor: token('chip'),
            tertiaryColor: token('card'),
          },
        });
        const out = await mermaid.render(id, chart);
        if (live) setSvg(out.svg);
      } catch {
        if (live) setFailed(true);
      }
    })();
    return () => {
      live = false;
    };
  }, [chart, id]);

  if (failed)
    return (
      <pre className="my-6 overflow-x-auto bg-card p-4 font-mono text-xs text-text-soft ring-1 ring-ring">
        {chart}
      </pre>
    );
  return (
    <div
      role="img"
      aria-label="Diagram"
      className="my-6 flex justify-center overflow-x-auto bg-card p-4 ring-1 ring-ring"
      // Mermaid output is sanitized (securityLevel: strict).
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
