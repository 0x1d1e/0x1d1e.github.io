import { act, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { AgentLoop } from './AgentLoop';

afterEach(() => vi.useRealTimers());

// Each tick re-arms the timer in an effect, so advance one tick per act().
function step(times: number, ms: number) {
  for (let i = 0; i < times; i++) act(() => void vi.advanceTimersByTime(ms));
}

test('types lines out over time and loops', () => {
  vi.useFakeTimers();
  const { container } = render(<AgentLoop />);
  const count = () =>
    [...container.querySelectorAll('li')].filter((l) =>
      l.textContent?.startsWith('✓'),
    ).length;
  expect(count()).toBe(0);
  step(2, 1100);
  expect(count()).toBe(2);
  step(3, 1100);
  expect(count()).toBe(5);
  step(1, 2800);
  expect(count()).toBe(0);
});

test('is labeled as an illustration', () => {
  render(<AgentLoop />);
  expect(screen.getByText(/not a live run/i)).toBeInTheDocument();
});
