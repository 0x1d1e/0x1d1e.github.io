import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { MetricsGrid } from './MetricsGrid';

test('renders each metric value with its label', () => {
  render(
    <MetricsGrid
      metrics={[
        { label: 'a', value: '1' },
        { label: 'b', value: '2' },
      ]}
    />,
  );
  expect(screen.getByText('1')).toBeInTheDocument();
  expect(screen.getByText('b')).toBeInTheDocument();
});
