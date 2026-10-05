import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

test('renders the org name and every section', () => {
  render(<App />);
  expect(
    screen.getByRole('heading', { level: 1, name: '0x1d1e' }),
  ).toBeInTheDocument();
  for (const name of ['Projects', 'Event stream', 'Regression'])
    expect(screen.getByRole('heading', { name })).toBeInTheDocument();
  expect(
    screen.getByRole('navigation', { name: 'Footer' }),
  ).toBeInTheDocument();
});
