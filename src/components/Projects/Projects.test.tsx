import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { projects } from '../../content/projects';
import { Projects } from './Projects';

test('renders a card per project with status', () => {
  render(<Projects projects={projects} />);
  expect(screen.getAllByRole('listitem')).toHaveLength(projects.length);
  expect(screen.getByRole('link', { name: 'kanade' })).toBeInTheDocument();
  expect(screen.getAllByText('experimental')).toHaveLength(projects.length);
});
