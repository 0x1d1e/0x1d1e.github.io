import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { App } from './App';

test('home renders the org name, real projects and footer', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
  expect(
    screen.getByRole('heading', { level: 1, name: '0x1d1e' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Projects' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'merro' })).toBeInTheDocument();
  expect(
    screen.getByRole('navigation', { name: 'Footer' }),
  ).toBeInTheDocument();
});

test('unknown paths show not found', () => {
  render(
    <MemoryRouter initialEntries={['/nope']}>
      <App />
    </MemoryRouter>,
  );
  expect(
    screen.getByRole('heading', { name: 'Not found' }),
  ).toBeInTheDocument();
});

test('docs routes render the wiki', async () => {
  render(
    <MemoryRouter initialEntries={['/docs/merro/lifecycle']}>
      <App />
    </MemoryRouter>,
  );
  expect(
    await screen.findByRole('heading', { level: 1, name: 'Lifecycle' }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('complementary', { name: 'Docs navigation' }),
  ).toBeInTheDocument();
});
