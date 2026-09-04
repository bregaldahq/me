/* oxlint-disable jsx-a11y/prefer-tag-over-role -- Named visual group and inline SVG diagram need explicit accessible roles. */
import { Fingerprint, ShieldCheck } from 'lucide-react';
import s from './artifacts.module.css';
export function AeternisArtifact() {
  return (
    <div
      role="group"
      aria-label="Representative integrity proof"
      data-project-artifact="merkle-proof"
      className={`${s.surface} ${s.proof}`}
    >
      <div className={s.toolbar}>
        <span>
          <Fingerprint size={16} />
          aeternis log
        </span>
        <span className={s.mono}>BAT-024</span>
      </div>
      <div className={s.appBody}>
        <p className={s.eyebrow}>Four records. One verifiable root.</p>
        <svg
          className={s.merkle}
          viewBox="0 0 440 210"
          role="img"
          aria-label="Four record hashes combine into two branches and one Merkle root"
        >
          <g fill="none" stroke="currentColor" strokeWidth="1.3" opacity=".4">
            <path d="M50 45V75H125V112M160 45V75H125M280 45V75H320V112M390 45V75H320M125 130V160H220V183M320 130V160H220" />
          </g>
          {[50, 160, 280, 390].map((x, i) => (
            <g key={x}>
              <rect
                x={x - 35}
                y="17"
                width="70"
                height="32"
                rx="3"
                fill="var(--ink)"
                stroke="var(--green)"
                strokeOpacity=".5"
              />
              <text
                x={x}
                y="37"
                textAnchor="middle"
                fill="var(--cream)"
                fontSize="10"
              >
                record 0{i + 1}
              </text>
            </g>
          ))}
          {[125, 320].map((x, i) => (
            <g key={x}>
              <rect
                x={x - 38}
                y="102"
                width="76"
                height="30"
                rx="3"
                fill="var(--purple)"
              />
              <text
                x={x}
                y="121"
                textAnchor="middle"
                fill="var(--cream)"
                fontSize="10"
              >
                hash 0{i + 1}
              </text>
            </g>
          ))}
          <circle cx="220" cy="190" r="7" fill="var(--green)" />
        </svg>
        <div className={s.certificate}>
          <ShieldCheck size={27} />
          <div>
            <span className={s.eyebrow}>Integrity verified</span>
            <strong>8f41…d2c9</strong>
            <p>Recomputed root matches the Fabric anchor</p>
          </div>
        </div>
      </div>
      <p className={s.disclaimer}>
        Representative integrity proof · no live network connection
      </p>
    </div>
  );
}
