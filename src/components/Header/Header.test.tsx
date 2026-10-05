import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import { Header } from './Header';

const links = [
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
];

test('menu is closed by default', () => {
  render(<Header links={links} />);
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByRole('button', { name: 'Menu' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
});

test('opens, focuses first item, locks scroll', async () => {
  const user = userEvent.setup();
  render(<Header links={links} />);
  await user.click(screen.getByRole('button', { name: 'Menu' }));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
  expect(document.body.style.overflow).toBe('hidden');
});

test('Escape closes, restores scroll and returns focus to the trigger', async () => {
  const user = userEvent.setup();
  render(<Header links={links} />);
  const trigger = screen.getByRole('button', { name: 'Menu' });
  await user.click(trigger);
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.body.style.overflow).toBe('');
  expect(trigger).toHaveFocus();
});

test('Tab wraps within the dialog in both directions', async () => {
  const user = userEvent.setup();
  render(<Header links={links} />);
  await user.click(screen.getByRole('button', { name: 'Menu' }));
  const close = screen.getByRole('button', { name: 'Close' });
  await user.tab({ shift: true });
  expect(
    within(screen.getByRole('dialog')).getByRole('link', { name: 'Contact' }),
  ).toHaveFocus();
  await user.tab();
  expect(close).toHaveFocus();
});

test('choosing a link closes the menu', async () => {
  const user = userEvent.setup();
  render(<Header links={links} />);
  await user.click(screen.getByRole('button', { name: 'Menu' }));
  const dialog = screen.getByRole('dialog');
  await user.click(dialog.querySelector('a[href="#projects"]')!);
  expect(screen.queryByRole('dialog')).toBeNull();
});
