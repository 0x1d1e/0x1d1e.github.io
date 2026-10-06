import { act, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { PageActive } from '../../motion/PageContext';
import { NeuralNet } from './NeuralNet';

afterEach(() => vi.useRealTimers());

const lit = (c: HTMLElement) => c.querySelectorAll('rect.fill-accent').length;

test('is labeled as an illustration', () => {
  render(<NeuralNet />);
  expect(screen.getByLabelText(/neural network/)).toBeInTheDocument();
  expect(screen.getByText(/not a real model/i)).toBeInTheDocument();
});

test('fires layer by layer while on stage', () => {
  vi.useFakeTimers();
  const { container } = render(<NeuralNet />);
  const first = container.innerHTML;
  act(() => void vi.advanceTimersByTime(520));
  expect(container.innerHTML).not.toBe(first);
  expect(lit(container)).toBeGreaterThan(0);
});

test('pauses while its page is off stage', () => {
  vi.useFakeTimers();
  const { container } = render(
    <PageActive.Provider value={false}>
      <NeuralNet />
    </PageActive.Provider>,
  );
  const first = container.innerHTML;
  act(() => void vi.advanceTimersByTime(5000));
  expect(container.innerHTML).toBe(first);
});
