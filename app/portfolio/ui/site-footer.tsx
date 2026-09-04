import { GITHUB_ORG_URL, LINKEDIN_URL } from '../seo';
import { ExternalLink } from './external-link';
import styles from '../portfolio-page.module.css';
export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <span>© {new Date().getFullYear()} Bregalda</span>
      <span className={styles.footerNote}>
        Independent thinking. Considered software.
      </span>
      <nav aria-label="Social links">
        <ExternalLink href={GITHUB_ORG_URL}>GitHub ↗</ExternalLink>
        <ExternalLink href={LINKEDIN_URL}>LinkedIn ↗</ExternalLink>
      </nav>
    </footer>
  );
}
