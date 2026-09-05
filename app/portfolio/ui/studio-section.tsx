/* oxlint-disable next/no-img-element -- Keep the supplied SVG identity unchanged. */
import { LINKEDIN_URL } from '../seo';
import { ExternalLink } from './external-link';
import styles from '../portfolio-page.module.css';
export function StudioSection() {
  return (
    <section
      id="studio"
      className={styles.studio}
      aria-labelledby="studio-title"
    >
      <div className={styles.studioTop}>
        <span className="technical-label">
          The studio / the thinking behind the tools
        </span>
        <ExternalLink href={LINKEDIN_URL} className={styles.textLink}>
          Connect on LinkedIn<span aria-hidden="true">↗</span>
        </ExternalLink>
      </div>
      <div className={styles.studioGrid}>
        <div data-scroll-reveal>
          <h2 id="studio-title">
            Small studio.
            <br />
            Deep technical curiosity.
          </h2>
          <p>
            Bregalda is an independent software studio founded by Ricardo
            Bregalda.
          </p>
        </div>
        <div className={styles.studioDetail} data-scroll-reveal>
          <img
            src="/brand/bregalda_primary_lockup.svg"
            alt="Bregalda — Build • Learn • Ship"
            width="340"
            height="180"
          />
          <p>Bregalda builds thoughtful tools for real technical problems.</p>
          <p>
            Backend development, production troubleshooting, APIs, and
            distributed systems. Connected by a belief that good software should
            make complex things understandable.
          </p>
        </div>
      </div>
    </section>
  );
}
