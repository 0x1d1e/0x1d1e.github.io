import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { PageDots } from './PageDots';

test('links to each page and scrolls to it on click', async () => {
  const scrollIntoView = vi.fn();
  Element.prototype.scrollIntoView = scrollIntoView;
  document.body.insertAdjacentHTML('beforeend', '<div id="b"></div>');
  render(
    <PageDots
      items={[
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ]}
    />,
  );
  const link = screen.getByRole('link', { name: 'B' });
  expect(link).toHaveAttribute('href', '#b');
  await userEvent.click(link);
  expect(scrollIntoView).toHaveBeenCalled();
  expect(screen.getByRole('link', { name: 'A' })).toHaveAttribute('href', '#a');
});
