import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Hero } from './Hero';

test('renders headline, subtext and CTA link', () => {
  render(<Hero headline="H" subtext="sub" cta={{ label: 'Go', href: '#x' }} />);
  expect(
    screen.getByRole('heading', { level: 1, name: 'H' }),
  ).toBeInTheDocument();
  expect(screen.getByText('sub')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Go' })).toHaveAttribute(
    'href',
    '#x',
  );
});
