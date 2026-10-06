import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { PageDots } from './PageDots';

const items = [
  { id: 'a', label: 'A' },
  { id: 'b', label: 'B' },
];

test('marks the active page and reports jumps', async () => {
  const onJump = vi.fn();
  render(<PageDots items={items} active={1} onJump={onJump} />);
  expect(screen.getByRole('link', { name: 'B' })).toHaveAttribute(
    'aria-current',
    'true',
  );
  expect(screen.getByRole('link', { name: 'A' })).not.toHaveAttribute(
    'aria-current',
  );
  await userEvent.click(screen.getByRole('link', { name: 'A' }));
  expect(onJump).toHaveBeenCalledWith(0);
});
