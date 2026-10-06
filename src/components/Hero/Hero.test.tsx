import { act, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { Hero } from './Hero';

afterEach(() => vi.useRealTimers());

test('exposes full text to assistive tech and links the CTA', () => {
  render(<Hero headline="H" subtext="sub" cta={{ label: 'Go', href: '#x' }} />);
  expect(
    screen.getByRole('heading', { level: 1, name: 'H' }),
  ).toBeInTheDocument();
  expect(screen.getByText('sub', { selector: '.sr-only' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Go' })).toHaveAttribute(
    'href',
    '#x',
  );
});

test('types the subtext', () => {
  vi.useFakeTimers();
  const { container } = render(
    <Hero headline="ab" subtext="cd" cta={{ label: 'Go', href: '#x' }} />,
  );
  const visible = () =>
    [...container.querySelectorAll('[aria-hidden="true"]')]
      .map((e) => e.textContent)
      .join('|');
  expect(visible()).not.toContain('cd');
  for (let i = 0; i < 30; i++) act(() => void vi.advanceTimersByTime(300));
  expect(visible()).toContain('cd');
});
