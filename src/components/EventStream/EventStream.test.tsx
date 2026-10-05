import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import { traces } from '../../data/fixtures';
import { EventStream } from './EventStream';

test('lists spans of the first trace and labels data illustrative', () => {
  render(<EventStream traces={traces} />);
  expect(screen.getByText(/illustrative/i)).toBeInTheDocument();
  const rows = within(screen.getByRole('table')).getAllByRole('row');
  expect(rows).toHaveLength(traces[0]!.spans.length + 1);
});

test('selecting a trace swaps the table', async () => {
  render(<EventStream traces={traces} />);
  await userEvent.click(screen.getByRole('button', { name: 'build pr-18' }));
  expect(
    screen.getByRole('table', { name: /build pr-18/ }),
  ).toBeInTheDocument();
});

test('focus state toggles on click and keyboard', async () => {
  const user = userEvent.setup();
  render(<EventStream traces={traces} />);
  const row = screen.getByRole('row', { name: /install/ });
  await user.click(row);
  expect(row).toHaveAttribute('data-active', 'true');
  const other = screen.getByRole('row', { name: /typecheck/ });
  other.focus();
  await user.keyboard('{Enter}');
  expect(other).toHaveAttribute('data-active', 'true');
  expect(row).toHaveAttribute('data-active', 'false');
});
