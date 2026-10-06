import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { expect, test } from 'vitest';
import { App } from '../App';

const at = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );

test('home is one story: intro, what we build, how we work, join in', () => {
  const { container } = at('/');
  expect(
    [...container.querySelectorAll('[data-page]')].map((p) => p.id),
  ).toEqual(['intro', 'build', 'principles', 'next']);
  expect(
    screen.getByRole('heading', {
      name: 'Tools for the problems in front of us.',
    }),
  ).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Browse projects' })).toHaveAttribute(
    'href',
    '/projects',
  );
});

test('home does not feature individual projects or focus areas', () => {
  at('/');
  for (const n of ['kanade', 'kinetix', 'merro', 'neural', 'tiling'])
    expect(screen.queryByText(new RegExp(n, 'i'))).toBeNull();
});

test('about page has the org story', () => {
  at('/about');
  expect(
    screen.getByRole('heading', { level: 1, name: 'About' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Why' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Security policy/ })).toHaveAttribute(
    'rel',
    'noopener noreferrer',
  );
});

test('projects index and detail', async () => {
  at('/projects');
  expect(
    screen.getByRole('heading', { level: 1, name: 'Projects' }),
  ).toBeInTheDocument();
  expect(screen.getAllByRole('listitem')).toHaveLength(3);
});

test('detail shows docs and add-ons for kinetix', async () => {
  at('/projects/kinetix');
  expect(
    await screen.findByRole('heading', { level: 1, name: 'kinetix' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Overview/ })).toHaveAttribute(
    'href',
    '/docs/kinetix/overview',
  );
  expect(screen.getByRole('link', { name: /kinetix-plugins/ })).toHaveAttribute(
    'href',
    'https://github.com/0x1d1e/kinetix-plugins',
  );
});

test('unknown project is not found', async () => {
  at('/projects/nope');
  expect(
    await screen.findByRole('heading', { name: 'Not found' }),
  ).toBeInTheDocument();
});
