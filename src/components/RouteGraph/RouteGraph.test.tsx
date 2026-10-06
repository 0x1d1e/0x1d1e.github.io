import { act, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { RouteGraph } from './RouteGraph';

afterEach(() => vi.useRealTimers());

test('is labeled as an illustration with an accessible description', () => {
  render(<RouteGraph />);
  expect(screen.getByRole('img', { name: /falls back/ })).toBeInTheDocument();
  expect(screen.getByText(/not live traffic/i)).toBeInTheDocument();
});

test('cycles through route, failover, route', () => {
  vi.useFakeTimers();
  const { container } = render(<RouteGraph />);
  const log = () => container.querySelector('p')?.textContent ?? '';
  expect(log()).toContain('provider-a');
  act(() => void vi.advanceTimersByTime(4200));
  expect(log()).toContain('fallback provider-b');
  act(() => void vi.advanceTimersByTime(4200));
  expect(log()).toContain('provider-c');
});
