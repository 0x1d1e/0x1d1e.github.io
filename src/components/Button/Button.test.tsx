import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Button } from './Button';

test('renders a link with its label', () => {
  render(<Button href="/x">Read more</Button>);
  expect(screen.getByRole('link', { name: 'Read more' })).toHaveAttribute(
    'href',
    '/x',
  );
});

test('arrow icon is decorative and optional', () => {
  const { container, rerender } = render(<Button href="/x">Go</Button>);
  expect(container.querySelector('svg')).toBeNull();
  rerender(
    <Button href="/x" arrow>
      Go
    </Button>,
  );
  expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  expect(screen.getByRole('link', { name: 'Go' })).toBeInTheDocument();
});
