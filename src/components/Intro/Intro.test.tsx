import { expect, test, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Intro, shouldPlayIntro } from './Intro';

test('plays on every home load, not on deep links; automation needs ?intro', () => {
  expect(shouldPlayIntro('/', '')).toBe(true);
  expect(shouldPlayIntro('/about', '')).toBe(false);
  Object.defineProperty(navigator, 'webdriver', {
    value: true,
    configurable: true,
  });
  expect(shouldPlayIntro('/', '')).toBe(false);
  expect(shouldPlayIntro('/', '?intro')).toBe(true);
  Reflect.deleteProperty(navigator, 'webdriver');
});

test('skip closes it', async () => {
  const onClose = vi.fn();
  const onGone = vi.fn();
  render(<Intro onClose={onClose} onGone={onGone} />);
  expect(screen.getByRole('dialog', { name: 'Intro' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Skip intro' }));
  expect(onClose).toHaveBeenCalledOnce();
});

test('gives up if the video never starts', () => {
  vi.useFakeTimers();
  const onClose = vi.fn();
  render(<Intro onClose={onClose} onGone={() => undefined} />);
  act(() => void vi.advanceTimersByTime(3000));
  expect(onClose).toHaveBeenCalled();
  vi.useRealTimers();
});

test('scrolling is blocked while it plays and works again afterwards', async () => {
  const { unmount } = render(
    <Intro onClose={() => undefined} onGone={() => undefined} />,
  );
  const wheel = new WheelEvent('wheel', { cancelable: true });
  window.dispatchEvent(wheel);
  expect(wheel.defaultPrevented).toBe(true);
  unmount();
  const after = new WheelEvent('wheel', { cancelable: true });
  window.dispatchEvent(after);
  expect(after.defaultPrevented).toBe(false);
});
