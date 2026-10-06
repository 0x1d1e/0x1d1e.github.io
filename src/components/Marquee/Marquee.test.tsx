import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Marquee } from './Marquee';

test('repeats items once, hiding the copy from assistive tech', () => {
  render(<Marquee items={['a', 'b']} />);
  expect(screen.getAllByText('a')).toHaveLength(2);
  expect(screen.getAllByRole('list')).toHaveLength(1);
});
