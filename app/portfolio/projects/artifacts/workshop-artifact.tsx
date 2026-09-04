/* oxlint-disable jsx-a11y/prefer-tag-over-role -- Named visual demonstration, not a form fieldset or heading group. */
import { Wrench, Check } from 'lucide-react';
import s from './artifacts.module.css';
export function WorkshopArtifact() {
  return (
    <div
      role="group"
      aria-label="Service order and software boundaries"
      data-project-artifact="service-order"
      className={`${s.surface} ${s.workshop}`}
    >
      <div className={s.toolbar}>
        <span>
          <Wrench size={15} />
          workshop / service order
        </span>
        <span className={s.mono}>WO-2048</span>
      </div>
      <div className={s.appBody}>
        <div className={s.decision}>
          <span className={s.eyebrow}>From reception to delivery</span>
          <span className={s.yellow}>Executing</span>
        </div>
        <ol aria-label="Service order lifecycle" className={s.lifecycle}>
          {[
            'Received',
            'Diagnosis',
            'Awaiting approval',
            'Executing',
            'Finished',
            'Delivered',
          ].map((step, i) => (
            <li key={step} data-current={i === 3 || undefined}>
              <span>
                {i < 3 ? <Check size={10} /> : String(i + 1).padStart(2, '0')}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <p className={s.eyebrow}>
          A business process. Clear software boundaries.
        </p>
        <div className={s.layers}>
          {[
            ['Presentation', 'HTTP / REST'],
            ['Application', 'Use cases'],
            ['Domain', 'Business rules'],
            ['Infrastructure', 'Persistence / integrations'],
          ].map(([name, detail]) => (
            <div key={name} data-domain={name === 'Domain' || undefined}>
              <strong>{name}</strong>
              <span>{detail}</span>
            </div>
          ))}
        </div>
        <p className={s.domainNote}>Independent from HTTP, PDO, and JWT</p>
      </div>
      <p className={s.disclaimer}>
        Representative service order · architecture grounded in the repository
      </p>
    </div>
  );
}
