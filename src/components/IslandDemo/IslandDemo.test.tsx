import { act, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { IslandDemo } from './IslandDemo';

afterEach(() => vi.useRealTimers());

test('is labeled as a concept, not a capture', () => {
  render(<IslandDemo />);
  expect(screen.getByLabelText(/Concept illustration/)).toBeInTheDocument();
  expect(screen.getByText(/not a capture/i)).toBeInTheDocument();
});

test('expands, lists apps, then collapses', () => {
  vi.useFakeTimers();
  render(<IslandDemo />);
  expect(screen.getByText('island')).toBeInTheDocument();
  act(() => void vi.advanceTimersByTime(2200));
  expect(screen.getByText('Finding apps…')).toBeInTheDocument();
  act(() => void vi.advanceTimersByTime(1500));
  expect(screen.getByText('Terminal')).toBeInTheDocument();
  act(() => void vi.advanceTimersByTime(2600));
  expect(screen.getByText('island')).toBeInTheDocument();
});
