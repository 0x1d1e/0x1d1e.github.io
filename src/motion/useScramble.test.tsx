import { act, renderHook } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { useScramble } from './useScramble';

afterEach(() => vi.useRealTimers());

test('returns the text when inactive', () => {
  const { result } = renderHook(() => useScramble('merro', false));
  expect(result.current).toBe('merro');
});

test('scrambles while active, then resolves to the text', () => {
  vi.useFakeTimers();
  const { result } = renderHook(() => useScramble('merro', true));
  act(() => void vi.advanceTimersByTime(30));
  expect(result.current).toHaveLength(5);
  for (let i = 0; i < 20; i++) act(() => void vi.advanceTimersByTime(30));
  expect(result.current).toBe('merro');
});
