export type AgentVariant = 'worker' | 'reviewer';

// 10x10 pixel sprites. x = body, e = eye (accent), . = empty.
const SPRITES: Record<AgentVariant, string[]> = {
  worker: [
    '....xx....',
    '....xx....',
    '.xxxxxxxx.',
    'xxxxxxxxxx',
    'xxeexxeexx',
    'xxeexxeexx',
    'xxxxxxxxxx',
    '.xxxxxxxx.',
    '..x....x..',
    '.xx....xx.',
  ],
  reviewer: [
    '..x....x..',
    '..xx..xx..',
    '.xxxxxxxx.',
    'xxxxxxxxxx',
    'xeeeeeeeex',
    'xxxxxxxxxx',
    'xxxxxxxxxx',
    '.xxxxxxxx.',
    '..x....x..',
    '.xx....xx.',
  ],
};

/** The sprite as bare rects, for use inside another <svg>. */
export function AgentRects({
  variant = 'worker',
  body = 'fill-text',
}: {
  variant?: AgentVariant;
  body?: string;
}) {
  return (
    <g shapeRendering="crispEdges">
      {SPRITES[variant].flatMap((row, y) =>
        [...row].map((c, x) =>
          c === '.' ? null : (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="1"
              height="1"
              className={c === 'e' ? 'fill-accent' : body}
            />
          ),
        ),
      )}
    </g>
  );
}

/** Small decorative pixel agent. */
export function Agent({
  variant = 'worker',
  className = 'size-6',
}: {
  variant?: AgentVariant;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 10 10"
      aria-hidden="true"
      className={className}
      shapeRendering="crispEdges"
    >
      <AgentRects variant={variant} />
    </svg>
  );
}
