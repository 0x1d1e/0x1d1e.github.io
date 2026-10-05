import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Footer } from './Footer';

test('renders links', () => {
  render(<Footer links={[{ label: 'Security', href: 'https://x.test/s' }]} />);
  expect(screen.getByRole('link', { name: 'Security' })).toHaveAttribute(
    'href',
    'https://x.test/s',
  );
});
