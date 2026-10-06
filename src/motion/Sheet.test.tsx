import { render } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Sheet } from './Sheet';

test('renders children with id, tab label and page edge', () => {
  const { container, getByText } = render(
    <Sheet id="x" label="01 / x">
      <p>hi</p>
    </Sheet>,
  );
  expect(container.querySelector('#x[data-sheet]')).not.toBeNull();
  expect(getByText('hi')).toBeInTheDocument();
  expect(getByText('01 / x')).toHaveAttribute('aria-hidden', 'true');
});
