import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Card } from './Card';

test('renders children with card surface and ring', () => {
  render(<Card data-testid="c">hello</Card>);
  const el = screen.getByTestId('c');
  expect(el).toHaveTextContent('hello');
  expect(el).toHaveClass('bg-card', 'ring-1', 'ring-ring');
});

test('merges extra classes', () => {
  render(
    <Card data-testid="c" className="p-6">
      x
    </Card>,
  );
  expect(screen.getByTestId('c')).toHaveClass('p-6', 'bg-card');
});
