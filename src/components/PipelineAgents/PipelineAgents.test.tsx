import { act, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { PageActive } from '../../motion/PageContext';
import { PipelineAgents } from './PipelineAgents';

afterEach(() => vi.useRealTimers());

const log = (c: HTMLElement) => c.querySelector('p')?.textContent ?? '';

test('describes itself and is captioned as an illustration', () => {
  render(<PipelineAgents />);
  expect(
    screen.getByRole('img', { name: /merged pull request/ }),
  ).toBeInTheDocument();
  expect(screen.getByText(/not a live run/i)).toBeInTheDocument();
});

test('steps through the pipeline, then loops', () => {
  vi.useFakeTimers();
  const { container } = render(<PipelineAgents />);
  expect(log(container)).toContain('item picked');
  for (let i = 0; i < 5; i++) act(() => void vi.advanceTimersByTime(1700));
  expect(log(container)).toContain('PR merged');
  act(() => void vi.advanceTimersByTime(3000));
  expect(log(container)).toContain('item picked');
});

test('pauses while its page is off stage', () => {
  vi.useFakeTimers();
  const { container } = render(
    <PageActive.Provider value={false}>
      <PipelineAgents />
    </PageActive.Provider>,
  );
  act(() => void vi.advanceTimersByTime(10000));
  expect(log(container)).toContain('item picked');
});
