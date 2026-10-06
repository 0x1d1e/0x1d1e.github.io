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

test('home stacks the pages and a side pager', () => {
  const { container } = at('/');
  expect(container.querySelectorAll('[data-sheet]')).toHaveLength(5);
  expect(
    screen.getByRole('navigation', { name: 'Sections' }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: 'LLM traffic, in motion.' }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: 'How we work' }),
  ).toBeInTheDocument();
});

test('landing lists only the main projects', () => {
  at('/');
  for (const n of ['kanade', 'kinetix', 'merro'])
    expect(screen.getByRole('link', { name: n })).toHaveAttribute(
      'href',
      `/projects/${n}`,
    );
  expect(screen.queryByRole('link', { name: 'kinetix-plugins' })).toBeNull();
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
