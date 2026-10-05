import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

test('renders the org name', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: '0x1d1e' })).toBeInTheDocument();
});
