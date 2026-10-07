import { expect, test } from 'vitest';
import { render } from '@testing-library/react';
import { hideLogos, readLogoPoints } from '../../motion/logoSource';
import { HeroBot } from './HeroBot';

test('the bot is a decorative sprite with two eyes', () => {
  const { container } = render(<HeroBot />);
  const svg = container.querySelector('svg')!;
  expect(svg).toHaveAttribute('aria-hidden', 'true');
  expect(svg.querySelectorAll('rect.fill-accent')).toHaveLength(2);
  // the favicon's body: 10x10 sprite, more than a handful of pixels
  expect(svg.querySelectorAll('rect.fill-text').length).toBeGreaterThan(60);
});

test('it registers as a logo for the page transition and lets go when it unmounts', () => {
  const { container, unmount } = render(<HeroBot />);
  const svg = container.querySelector('svg')!;
  hideLogos(true);
  expect(svg.style.opacity).toBe('0');
  hideLogos(false);
  expect(svg.style.opacity).toBe('');
  expect(readLogoPoints()).toEqual([]); // no layout in jsdom: nothing to read yet
  unmount();
  svg.style.opacity = '1';
  hideLogos(true);
  expect(svg.style.opacity).toBe('1'); // no longer registered
});
