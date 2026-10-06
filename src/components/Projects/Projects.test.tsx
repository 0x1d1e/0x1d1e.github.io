import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { projects } from '../../content/projects';
import { ProjectCard } from './Projects';

test('card links to the project page and shows status and tags', () => {
  const p = projects.find((x) => x.name === 'kinetix')!;
  render(<ProjectCard p={p} />);
  expect(screen.getByRole('link', { name: 'kinetix' })).toHaveAttribute(
    'href',
    '/projects/kinetix',
  );
  expect(screen.getByText('experimental')).toBeInTheDocument();
  expect(screen.getByText(/llm-gateway/)).toBeInTheDocument();
});
