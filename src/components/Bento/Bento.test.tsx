import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { clusters, regressions, replayDiff } from '../../data/fixtures';
import {
  Bento,
  ClusteringCard,
  RegressionCard,
  VersionReplayCard,
} from './Bento';

test('renders all three cards', () => {
  render(
    <Bento>
      <RegressionCard items={regressions} />
      <ClusteringCard items={clusters} />
      <VersionReplayCard lines={replayDiff} />
    </Bento>,
  );
  for (const name of ['Regression', 'Failure clustering', 'Version replay'])
    expect(screen.getByRole('heading', { name })).toBeInTheDocument();
  expect(screen.getByText('cold start')).toBeInTheDocument();
  expect(screen.getByText('FAIL')).toBeInTheDocument();
  expect(screen.getByText('timeout in setup')).toBeInTheDocument();
});

test('diff lines carry their kind', () => {
  const { container } = render(<VersionReplayCard lines={replayDiff} />);
  expect(container.querySelectorAll('[data-kind="add"]')).toHaveLength(1);
  expect(container.querySelectorAll('[data-kind="del"]')).toHaveLength(1);
});
