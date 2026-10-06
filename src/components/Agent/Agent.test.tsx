import { render } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Agent } from './Agent';

test('worker and reviewer sprites are decorative and differ', () => {
  const w = render(<Agent />).container.innerHTML;
  const r = render(<Agent variant="reviewer" />).container.innerHTML;
  expect(w).toContain('aria-hidden="true"');
  expect(w).not.toEqual(r);
});
