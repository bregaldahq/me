/* oxlint-disable jsx-a11y/prefer-tag-over-role -- Named visual demonstration, not a form fieldset or heading group. */
import { Check, GitMerge } from 'lucide-react';
import s from './artifacts.module.css';
export function ReconcileFlowArtifact() {
  return (
    <div
      role="group"
      aria-label="ReconcileFlow synthetic decision"
      data-project-artifact="reconciliation"
      className={`${s.surface} ${s.reconcile}`}
    >
      <div className={s.toolbar}>
        <span>
          <GitMerge size={15} />
          reconcileflow
        </span>
        <span className={s.mono}>Demo dataset</span>
      </div>
      <div className={s.appBody}>
        <div className={s.tabRow}>
          <span className={s.selectedTab}>
            Matched <b>3</b>
          </span>
          <span>
            Review <b>1</b>
          </span>
          <span>
            Unmatched <b>1</b>
          </span>
        </div>
        <div className={s.decision}>
          <span className={s.eyebrow}>Decision / RF-024</span>
          <span className={s.success}>
            <Check size={12} />
            SPLIT_MATCHED
          </span>
        </div>
        <p className={s.amount}>$1,000.00</p>
        <p className={s.caption}>One source. Three matching records.</p>
        <div className={s.splitAmounts}>
          {['$500.00', '$300.00', '$200.00'].map((amount, i) => (
            <div key={amount}>
              <span className={s.eyebrow}>Target 0{i + 1}</span>
              <strong>{amount}</strong>
            </div>
          ))}
        </div>
        <dl className={s.rule}>
          <div>
            <dt>Applied rule</dt>
            <dd>bounded_split@1</dd>
          </div>
          <div>
            <dt>Confidence</dt>
            <dd>1.000000</dd>
          </div>
        </dl>
        <div className={s.checks}>
          {[
            'amount delta 0.00 ≤ 0.50',
            'currency equal',
            'group size 3 ≤ 4',
          ].map((text) => (
            <p key={text}>
              <Check size={12} />
              {text}
            </p>
          ))}
        </div>
      </div>
      <p className={s.disclaimer}>
        Synthetic demonstration data · not a live account
      </p>
    </div>
  );
}
