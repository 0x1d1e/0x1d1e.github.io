import { act, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { PageActive } from '../../motion/PageContext';
import { BuildLoop } from './BuildLoop';

afterEach(() => vi.useRealTimers());

const log = () => screen.getByText(/kept \d/).textContent;
const tick = (n: number) => {
  for (let i = 0; i < n; i++) act(() => void vi.advanceTimersByTime(1100));
};

test('is labeled as an illustration', () => {
  render(<BuildLoop />);
  expect(screen.getByText(/not a live run/i)).toBeInTheDocument();
});

test('keeps some ideas and archives others, then resets', () => {
  vi.useFakeTimers();
  render(<BuildLoop />);
  expect(log()).toContain('kept 0 · archived 0');
  tick(3); // first idea reaches the shelf: kept
  expect(log()).toContain('kept 1 · archived 0');
  tick(4); // second idea: archived
  expect(log()).toContain('kept 1 · archived 1');
  tick(4); // third: kept
  expect(log()).toContain('kept 2 · archived 1');
  act(() => void vi.advanceTimersByTime(2600));
  expect(log()).toContain('kept 0 · archived 0');
});

test('pauses while its page is off stage', () => {
  vi.useFakeTimers();
  render(
    <PageActive.Provider value={false}>
      <BuildLoop />
    </PageActive.Provider>,
  );
  tick(10);
  expect(log()).toContain('kept 0 · archived 0');
});
