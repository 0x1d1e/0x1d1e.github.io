import { act, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { AgentSwarm } from './AgentSwarm';

afterEach(() => vi.useRealTimers());

test('completes tasks over time, then resets', () => {
  vi.useFakeTimers();
  render(<AgentSwarm />);
  expect(screen.getByText(/tasks done/)).toHaveTextContent('0/6');
  for (let i = 0; i < 7; i++) act(() => void vi.advanceTimersByTime(800));
  expect(screen.getByText(/tasks done/)).toHaveTextContent('6/6');
  act(() => void vi.advanceTimersByTime(2200));
  expect(screen.getByText(/tasks done/)).toHaveTextContent('0/6');
});

test('is labeled as an illustration', () => {
  render(<AgentSwarm />);
  expect(screen.getByText(/not a live run/i)).toBeInTheDocument();
});
