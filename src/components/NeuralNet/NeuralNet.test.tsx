import { act, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { PageActive } from '../../motion/PageContext';
import { NeuralNet } from './NeuralNet';

afterEach(() => vi.useRealTimers());

const status = () => screen.getByText(/epoch \d/).textContent ?? '';
const tick = (n: number) => {
  for (let i = 0; i < n; i++) act(() => void vi.advanceTimersByTime(420));
};

test('is labeled as an illustration, not a real run', () => {
  render(<NeuralNet />);
  expect(screen.getByLabelText(/neural network training/)).toBeInTheDocument();
  expect(screen.getByText(/not a real run/i)).toBeInTheDocument();
});

test('goes forward, then backward, then updates weights, then the next epoch', () => {
  vi.useFakeTimers();
  render(<NeuralNet />);
  expect(status()).toContain('epoch 1/8');
  expect(status()).toContain('forward pass');
  tick(4);
  expect(status()).toContain('backward pass');
  tick(4);
  expect(status()).toContain('update weights');
  tick(1);
  expect(status()).toContain('epoch 2/8');
});

test('the loss curve grows as epochs reach their backward pass', () => {
  vi.useFakeTimers();
  const { container } = render(<NeuralNet />);
  const count = () =>
    (container.querySelector('polyline')?.getAttribute('points') ?? '')
      .split(' ')
      .filter(Boolean).length;
  expect(count()).toBe(0);
  tick(4); // epoch 1 starts its backward pass
  expect(count()).toBe(1);
  tick(9); // epoch 2 starts its backward pass
  expect(count()).toBe(2);
});

test('pauses while its page is off stage', () => {
  vi.useFakeTimers();
  render(
    <PageActive.Provider value={false}>
      <NeuralNet />
    </PageActive.Provider>,
  );
  tick(30);
  expect(status()).toContain('epoch 1/8');
});
