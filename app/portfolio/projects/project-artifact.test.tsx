import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProjectArtifact } from './project-artifact';

describe('project evidence surfaces', () => {
  it('explains a synthetic split decision without presenting live metrics', () => {
    render(<ProjectArtifact type="reconciliation" />);
    const surface = screen.getByRole('group', {
      name: 'ReconcileFlow synthetic decision',
    });
    expect(within(surface).getByText('bounded_split@1')).toBeVisible();
    expect(within(surface).getByText('$1,000.00')).toBeVisible();
    expect(within(surface).getByText('$500.00')).toBeVisible();
    expect(within(surface).getByText('$300.00')).toBeVisible();
    expect(within(surface).getByText('$200.00')).toBeVisible();
    expect(
      within(surface).getByText(/synthetic demonstration data/i),
    ).toBeVisible();
  });
  it('labels a representative integrity proof and its verification result', () => {
    render(<ProjectArtifact type="merkle-proof" />);
    expect(
      screen.getByRole('group', { name: 'Representative integrity proof' }),
    ).toBeVisible();
    expect(
      screen.getByText('Recomputed root matches the Fabric anchor'),
    ).toBeVisible();
  });
  it('keeps the domain separate from delivery mechanisms', () => {
    render(<ProjectArtifact type="service-order" />);
    expect(
      screen.getByRole('list', { name: 'Service order lifecycle' }).children,
    ).toHaveLength(6);
    expect(
      screen.getByText('Independent from HTTP, PDO, and JWT'),
    ).toBeVisible();
  });
  it('shows the lost update and ledger mismatch as a synthetic concurrency trace', () => {
    render(<ProjectArtifact type="concurrency-trace" />);
    const surface = screen.getByRole('group', {
      name: 'ChaosSQL synthetic lost-update trace',
    });
    expect(within(surface).getByText('Invariant violated')).toBeVisible();
    expect(
      within(surface).getByText('actual_balance == expected_balance'),
    ).toBeVisible();
    expect(within(surface).getByText('$900')).toBeVisible();
    expect(within(surface).getByText('$850')).toBeVisible();
    const table = within(surface).getByRole('table', {
      name: 'Concurrent withdrawal interleaving',
    });
    expect(table).toBeVisible();
    const rows = within(table).getAllByRole('row');
    expect(
      rows.slice(1).map((row) =>
        within(row)
          .getAllByRole('cell')
          .map((cell) => cell.textContent),
      ),
    ).toEqual([
      ['01', 'T1', 'Read balance', '1000'],
      ['02', 'T2', 'Read balance', '1000'],
      ['03', 'T1', 'Withdraw 50', '950'],
      ['04', 'T2', 'Withdraw 100', '900'],
    ]);
    for (const header of within(table).getAllByRole('columnheader')) {
      expect(header).toHaveAttribute('scope', 'col');
    }
    expect(within(surface).getByText('repro_test.go')).toBeVisible();
    expect(
      within(surface).getByText(/synthetic illustration.*no live database/i),
    ).toBeVisible();
  });
});
