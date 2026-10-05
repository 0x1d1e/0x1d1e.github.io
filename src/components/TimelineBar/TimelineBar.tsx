/** Decorative bar positioned by percentage; the row's text carries the data. */
export function TimelineBar({
  left,
  width,
  active = false,
}: {
  left: number;
  width: number;
  active?: boolean;
}) {
  return (
    <div aria-hidden="true" className="relative h-1.5 w-full">
      <div
        data-testid="bar"
        data-active={active}
        className={`absolute inset-y-0 rounded-bar ${active ? 'bg-accent' : 'bg-muted'}`}
        style={{ left: `${left}%`, width: `${width}%` }}
      />
    </div>
  );
}
