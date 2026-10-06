import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Stage } from './Stage';

// jsdom reports no wide viewport, so Stage renders its plain-column fallback.
test('fallback renders every page in order with ids', () => {
  const { container } = render(
    <Stage
      pages={[
        { id: 'one', label: 'One', node: <h2>First</h2> },
        { id: 'two', label: 'Two', node: <h2>Second</h2> },
      ]}
    />,
  );
  const pages = [...container.querySelectorAll('[data-page]')];
  expect(pages.map((p) => p.id)).toEqual(['one', 'two']);
  expect(screen.getByRole('heading', { name: 'Second' })).toBeInTheDocument();
});
