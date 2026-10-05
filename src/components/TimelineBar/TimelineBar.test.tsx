import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { TimelineBar } from './TimelineBar';

test('positions by percentage', () => {
  render(<TimelineBar left={10} width={40} />);
  const bar = screen.getByTestId('bar');
  expect(bar).toHaveStyle({ left: '10%', width: '40%' });
  expect(bar).toHaveClass('bg-muted');
});

test('active uses accent', () => {
  render(<TimelineBar left={0} width={5} active />);
  expect(screen.getByTestId('bar')).toHaveClass('bg-accent');
});
