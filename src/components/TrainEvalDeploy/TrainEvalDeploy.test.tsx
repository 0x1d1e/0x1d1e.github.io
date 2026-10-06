import { act, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { PageActive } from '../../motion/PageContext';
import { TrainEvalDeploy } from './TrainEvalDeploy';

afterEach(() => vi.useRealTimers());

const tick = (n: number) => {
  for (let i = 0; i < n; i++) act(() => void vi.advanceTimersByTime(280));
};

test('is labeled as an illustration, not results', () => {
  render(<TrainEvalDeploy />);
  expect(
    screen.getByLabelText(/trained, evaluated, and deployed/),
  ).toBeInTheDocument();
  expect(screen.getByText(/not real results/i)).toBeInTheDocument();
});

test('trains, evaluates, goes live, then resets', () => {
  vi.useFakeTimers();
  render(<TrainEvalDeploy />);
  expect(screen.getByText('idle')).toBeInTheDocument();
  tick(12 + 4 + 2);
  expect(screen.getByText('rolling out')).toBeInTheDocument();
  tick(1);
  expect(screen.getByText('live')).toBeInTheDocument();
  tick(8);
  expect(screen.getByText('idle')).toBeInTheDocument();
});

test('pauses while its page is off stage', () => {
  vi.useFakeTimers();
  render(
    <PageActive.Provider value={false}>
      <TrainEvalDeploy />
    </PageActive.Provider>,
  );
  tick(30);
  expect(screen.getByText('idle')).toBeInTheDocument();
});
