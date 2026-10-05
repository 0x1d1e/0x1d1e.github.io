import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Chip, type ChipStatus } from './Chip';

test.each<ChipStatus>(['PASS', 'WARN', 'FAIL'])(
  'shows %s as text',
  (status) => {
    render(<Chip status={status} />);
    expect(screen.getByText(status)).toHaveClass('font-mono', 'uppercase');
  },
);
