import { render } from '@testing-library/react';
import { expect, test } from 'vitest';
import { PixelField } from './PixelField';

test('is a decorative, non-interactive canvas', () => {
  const { container } = render(<PixelField />);
  const c = container.querySelector('canvas');
  expect(c).toHaveAttribute('aria-hidden', 'true');
  expect(c).toHaveClass('pointer-events-none');
});
