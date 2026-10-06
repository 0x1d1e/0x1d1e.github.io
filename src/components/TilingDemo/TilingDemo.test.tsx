import { act, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { TilingDemo } from './TilingDemo';

afterEach(() => vi.useRealTimers());

test('shows three windows and is labeled as an illustration', () => {
  render(<TilingDemo />);
  for (const t of ['terminal', 'editor', 'browser'])
    expect(screen.getByText(t)).toBeInTheDocument();
  expect(screen.getByText(/not a screenshot/i)).toBeInTheDocument();
});

test('re-tiles over time', () => {
  vi.useFakeTimers();
  const { container } = render(<TilingDemo />);
  const first = container.innerHTML;
  act(() => void vi.advanceTimersByTime(2200));
  expect(container.innerHTML).not.toBe(first);
});
