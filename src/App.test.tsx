import { expect, test } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
  expect(
    screen.getByRole('heading', {
      name: 'Tools for the problems in front of us.',
    }),
  ).toBeInTheDocument();
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

test('each page sets its own tab title', async () => {
  const at = async (path: string) => {
    const { unmount } = render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    );
    return { unmount };
  };
  let r = await at('/about');
  await waitFor(() => expect(document.title).toBe('About · 0x1d1e'));
  r.unmount();
  r = await at('/projects/kinetix');
  await waitFor(() => expect(document.title).toBe('kinetix · 0x1d1e'));
  r.unmount();
  r = await at('/docs/merro/lifecycle');
  await waitFor(() =>
    expect(document.title).toBe('Lifecycle: merro docs · 0x1d1e'),
  );
  r.unmount();
  r = await at('/nope');
  await waitFor(() => expect(document.title).toBe('Not found · 0x1d1e'));
  expect(
    document.head.querySelector('meta[name="robots"]')?.getAttribute('content'),
  ).toBe('noindex');
  r.unmount();
});
