import { act, renderHook } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { useTypewriter } from './useTypewriter';

afterEach(() => vi.useRealTimers());

test('types one char per step and reports done', () => {
  vi.useFakeTimers();
  const { result } = renderHook(() => useTypewriter('abc', { speed: 10 }));
  expect(result.current).toEqual({ typed: '', done: false });
  for (let i = 0; i < 3; i++) act(() => void vi.advanceTimersByTime(10));
  expect(result.current).toEqual({ typed: 'abc', done: true });
});

test('waits for start', () => {
  vi.useFakeTimers();
  const { result, rerender } = renderHook(
    ({ start }) => useTypewriter('ab', { start, speed: 10 }),
    { initialProps: { start: false } },
  );
  act(() => void vi.advanceTimersByTime(100));
  expect(result.current.typed).toBe('');
  rerender({ start: true });
  act(() => void vi.advanceTimersByTime(10));
  expect(result.current.typed).toBe('a');
});
