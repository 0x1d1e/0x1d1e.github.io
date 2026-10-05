import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { expect, test, vi } from 'vitest';
import { Markdown } from './Markdown';

const md = (src: string) =>
  render(
    <MemoryRouter>
      <Markdown project="merro" slugs={['lifecycle']}>
        {src}
      </Markdown>
    </MemoryRouter>,
  );

test('headings get ids and anchor links', () => {
  md('## Quick start');
  expect(screen.getByRole('heading', { name: /Quick start/ })).toHaveAttribute(
    'id',
    'quick-start',
  );
  expect(
    screen.getByRole('link', { name: 'Link to this section' }),
  ).toHaveAttribute('href', '#quick-start');
});

test('relative links: known docs go in-app, others to the repo, external opens new tab', () => {
  md('[a](docs/lifecycle.md#x) [b](../CONTEXT.md) [c](https://example.com)');
  expect(screen.getByRole('link', { name: 'a' })).toHaveAttribute(
    'href',
    '/docs/merro/lifecycle#x',
  );
  expect(screen.getByRole('link', { name: 'b' })).toHaveAttribute(
    'href',
    'https://github.com/0x1d1e/merro/blob/main/CONTEXT.md',
  );
  expect(screen.getByRole('link', { name: 'c' })).toHaveAttribute(
    'rel',
    'noopener noreferrer',
  );
});

test('remote images are not loaded', () => {
  const { container } = md('![badge](https://img.shields.io/x.svg)');
  expect(container.querySelector('img')).toBeNull();
});

test('code blocks can be copied', async () => {
  const user = userEvent.setup();
  const writeText = vi
    .spyOn(navigator.clipboard, 'writeText')
    .mockResolvedValue();
  md('```sh\npnpm install\n```');
  await user.click(screen.getByRole('button', { name: 'Copy code' }));
  expect(writeText).toHaveBeenCalledWith('pnpm install');
  expect(screen.getByText('copied')).toBeInTheDocument();
});

test('renders gfm tables', () => {
  md('| a | b |\n|---|---|\n| 1 | 2 |');
  expect(screen.getByRole('table')).toBeInTheDocument();
});
