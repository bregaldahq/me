import { LINKEDIN_URL } from '../seo';
import { ExternalLink } from './external-link';
import styles from '../portfolio-page.module.css';
export function ContactSection() {
  return (
    <section
      id="contact"
      className={styles.contact}
      aria-labelledby="contact-title"
    >
      <p className="technical-label">A new problem. A new possibility.</p>
      <h2 id="contact-title" data-scroll-reveal>
        Let’s build
        <br />
        something thoughtful.
      </h2>
      <p>
        Engineering roles, product work, or a freelance project.
        <br />A good conversation is where it starts.
      </p>
      <ExternalLink href={LINKEDIN_URL} className={styles.contactCta}>
        Connect on LinkedIn<span aria-hidden="true">↗</span>
      </ExternalLink>
    </section>
  );
}
