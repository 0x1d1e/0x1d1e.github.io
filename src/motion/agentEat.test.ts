import { expect, test, vi } from 'vitest';
import {
  ARRIVE_START,
  EAT_END,
  GROW_END,
  agentAt,
  arrivalClip,
  drawAgentEat,
  eatFront,
  eatenClip,
} from './agentEat';
import { pageOpacity, type Exit } from './stageMath';

const VW = 1440;
const VH = 900;
const src = { cx: 1200, cy: 500, s: 5 };

test('the agent starts where it sits on the page and grows from there', () => {
  const a0 = agentAt(0, VW, VH, src);
  expect([a0.cx, a0.cy, a0.s]).toEqual([src.cx, src.cy, src.s]);
  expect(a0.rage).toBe(0);
  const grown = agentAt(GROW_END, VW, VH, src);
  expect(grown.s).toBeGreaterThan(src.s * 8); // much bigger
  expect(grown.rage).toBe(1); // eyes fully red
});

test('the eyes turn red while it grows, not after', () => {
  expect(agentAt(0.03, VW, VH, src).rage).toBe(0);
  const mid = agentAt(0.12, VW, VH, src).rage;
  expect(mid).toBeGreaterThan(0);
  expect(mid).toBeLessThan(1);
});

test('it eats from the right to the left, and nothing is eaten before it grows', () => {
  expect(eatFront(0, VW, VH)).toBe(VW);
  let last = VW;
  for (let w = 0; w <= EAT_END; w += 0.02) {
    const f = eatFront(w, VW, VH);
    expect(f).toBeLessThanOrEqual(last + 1e-6); // only ever moves left
    last = f;
  }
  expect(eatFront(EAT_END, VW, VH)).toBeCloseTo(0);
});

test('it chomps while eating and is closed when still', () => {
  const mouths = [0.3, 0.4, 0.5, 0.6].map((w) => agentAt(w, VW, VH, src).mouth);
  expect(Math.max(...mouths)).toBeGreaterThan(0.5);
  expect(agentAt(0.05, VW, VH, src).mouth).toBe(0);
});

test('the page is clipped as it is eaten, and the next one wipes in from the left', () => {
  expect(eatenClip(0, VW, VH)).toBe('none');
  expect(eatenClip(0.5, VW, VH)).toMatch(/^inset\(0 \d+(\.\d+)?px 0 0\)$/);
  expect(eatenClip(EAT_END, VW, VH)).toBe(`inset(0 ${VW}px 0 0)`);
  expect(arrivalClip(ARRIVE_START)).toBe('inset(0 100% 0 0)');
  expect(arrivalClip(0.9)).toMatch(/^inset\(0 \d+(\.\d+)?% 0 0\)$/);
  expect(arrivalClip(1)).toBe('none');
});

test('with the agent, the old page stays until eaten and the new one appears after it pops', () => {
  const exits: Exit[] = ['agent-eat', undefined];
  const at = (w: number) => 0.2 + (0.4 + 0.6 * w) * 0.6;
  expect(pageOpacity(at(0.3), 0, 3, exits)).toBe(1);
  expect(pageOpacity(at(0.3), 1, 3, exits)).toBe(0);
  expect(pageOpacity(at(0.76), 0, 3, exits)).toBe(0);
  expect(pageOpacity(at(0.76), 1, 3, exits)).toBe(0); // nothing on stage: the agent popping
  expect(pageOpacity(at(0.95), 1, 3, exits)).toBe(1);
});

test('drawing paints the agent, nothing outside the transition, and cleans up at the end', () => {
  const ctx = {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    fillStyle: '',
    globalAlpha: 1,
    shadowColor: '',
    shadowBlur: 0,
  } as unknown as CanvasRenderingContext2D & {
    fillRect: ReturnType<typeof vi.fn>;
  };
  const colors = { fg: 'w', accent: 'b', bg: 'k', danger: 'r' };
  drawAgentEat(ctx, 0, VW, VH, src, colors);
  expect(ctx.fillRect).not.toHaveBeenCalled();
  drawAgentEat(ctx, 0.4, VW, VH, src, colors);
  expect(ctx.fillRect.mock.calls.length).toBeGreaterThan(60); // the sprite's cells
  ctx.fillRect.mockClear();
  drawAgentEat(ctx, 0.95, VW, VH, src, colors);
  expect(ctx.fillRect).not.toHaveBeenCalled();
});
