/* oxlint-disable jsx-a11y/prefer-tag-over-role -- Named visual demonstration, not a form fieldset or heading group. */
import { Database, FileCode2, MoveRight } from 'lucide-react';
import s from './artifacts.module.css';

const INTERLEAVING = [
  ['01', 'T1', 'Read balance', '1000'],
  ['02', 'T2', 'Read balance', '1000'],
  ['03', 'T1', 'Withdraw 50', '950'],
  ['04', 'T2', 'Withdraw 100', '900'],
] as const;

export function ChaosSqlArtifact() {
  return (
    <div
      role="group"
      aria-label="ChaosSQL synthetic lost-update trace"
      data-project-artifact="concurrency-trace"
      className={`${s.surface} ${s.chaos}`}
    >
      <div className={s.toolbar}>
        <span>
          <Database size={16} />
          chaossql
        </span>
        <span className={s.mono}>banking_lost_update</span>
      </div>
      <div className={s.appBody}>
        <div className={s.decision}>
          <span className={s.eyebrow}>Concurrent withdrawals</span>
          <span className={s.yellow}>Lost update / P4</span>
        </div>
        <table
          className={s.traceTable}
          aria-label="Concurrent withdrawal interleaving"
        >
          <thead>
            <tr>
              <th scope="col">Step</th>
              <th scope="col">Tx</th>
              <th scope="col">Operation</th>
              <th scope="col">Balance</th>
            </tr>
          </thead>
          <tbody>
            {INTERLEAVING.map(([step, transaction, operation, balance]) => (
              <tr key={step} data-trace-step={step}>
                <td>{step}</td>
                <td>
                  <span data-transaction={transaction}>{transaction}</span>
                </td>
                <td>{operation}</td>
                <td>{balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={s.invariant}>
          <p className={s.eyebrow}>ledger_balance_consistency</p>
          <p className={s.violation}>Invariant violated</p>
          <code>actual_balance == expected_balance</code>
          <dl>
            <div>
              <dt>Actual balance</dt>
              <dd>$900</dd>
            </div>
            <div>
              <dt>Expected from ledger</dt>
              <dd>$850</dd>
            </div>
          </dl>
          <p className={s.caption}>
            Two reads of 1000. One withdrawal overwritten.
          </p>
        </div>
        <div className={s.reproduction}>
          <span>Trace</span>
          <MoveRight size={14} aria-hidden="true" />
          <span>Shrink</span>
          <MoveRight size={14} aria-hidden="true" />
          <span>
            <FileCode2 size={14} aria-hidden="true" />
            repro_test.go
          </span>
        </div>
      </div>
      <p className={s.disclaimer}>
        Synthetic illustration · no live database · balances are not measured
        output
      </p>
    </div>
  );
}
