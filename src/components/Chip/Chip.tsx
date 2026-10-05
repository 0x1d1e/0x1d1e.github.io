export type ChipStatus = 'PASS' | 'WARN' | 'FAIL';

// The palette has no red/amber, so status is carried by the label, not hue alone.
const tone: Record<ChipStatus, string> = {
  PASS: 'text-success',
  WARN: 'text-accent',
  FAIL: 'text-muted',
};

export function Chip({ status }: { status: ChipStatus }) {
  return (
    <span
      className={`inline-block rounded-chip bg-chip px-3 py-1 font-mono text-xs uppercase ${tone[status]}`}
    >
      {status}
    </span>
  );
}
