import type { ChipStatus } from '../components/Chip/Chip';

// Illustrative data, not real traces. Labeled as such wherever it renders.

export type Span = {
  id: string;
  name: string;
  durationMs: number;
  /** offset and width as % of the trace */
  left: number;
  width: number;
  status: ChipStatus;
};

export type Trace = { id: string; label: string; spans: Span[] };

export const traces: Trace[] = [
  {
    id: 't-1042',
    label: 'build main',
    spans: [
      {
        id: 's1',
        name: 'install',
        durationMs: 4200,
        left: 0,
        width: 18,
        status: 'PASS',
      },
      {
        id: 's2',
        name: 'typecheck',
        durationMs: 6100,
        left: 18,
        width: 26,
        status: 'PASS',
      },
      {
        id: 's3',
        name: 'test',
        durationMs: 9800,
        left: 18,
        width: 42,
        status: 'WARN',
      },
      {
        id: 's4',
        name: 'build',
        durationMs: 7300,
        left: 60,
        width: 32,
        status: 'PASS',
      },
    ],
  },
  {
    id: 't-1041',
    label: 'build pr-18',
    spans: [
      {
        id: 's1',
        name: 'install',
        durationMs: 4400,
        left: 0,
        width: 20,
        status: 'PASS',
      },
      {
        id: 's2',
        name: 'test',
        durationMs: 12100,
        left: 20,
        width: 55,
        status: 'FAIL',
      },
    ],
  },
  {
    id: 't-1040',
    label: 'deploy main',
    spans: [
      {
        id: 's1',
        name: 'upload',
        durationMs: 2100,
        left: 0,
        width: 40,
        status: 'PASS',
      },
      {
        id: 's2',
        name: 'publish',
        durationMs: 3000,
        left: 40,
        width: 60,
        status: 'PASS',
      },
    ],
  },
];

export type Metric = { label: string; value: string };

export const metrics: Metric[] = [
  { label: 'projects', value: '3' },
  { label: 'stable releases', value: '0' },
  { label: 'idle cycles', value: '∞' },
  { label: 'fake stability', value: '0%' },
];

export const regressions = [
  { name: 'test suite p95', delta: '+8.2%', status: 'WARN' as ChipStatus },
  { name: 'bundle size', delta: '+0.4%', status: 'PASS' as ChipStatus },
  { name: 'cold start', delta: '+31%', status: 'FAIL' as ChipStatus },
];

export const clusters = [
  { label: 'timeout in setup', count: 14, pct: 70 },
  { label: 'snapshot drift', count: 5, pct: 25 },
  { label: 'unknown', count: 1, pct: 5 },
];

export type DiffLine = { kind: 'add' | 'del' | 'ctx'; text: string };

export const replayDiff: DiffLine[] = [
  { kind: 'ctx', text: 'retries: 2' },
  { kind: 'del', text: 'timeout: 5000' },
  { kind: 'add', text: 'timeout: 15000' },
  { kind: 'ctx', text: 'status: experimental' },
];
