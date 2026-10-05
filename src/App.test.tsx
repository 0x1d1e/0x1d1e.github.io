import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

test('renders the org name, real projects and footer', () => {
  render(<App />);
  expect(
    screen.getByRole('heading', { level: 1, name: '0x1d1e' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Projects' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'merro' })).toBeInTheDocument();
  expect(
    screen.getByRole('navigation', { name: 'Footer' }),
  ).toBeInTheDocument();
});
