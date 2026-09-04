/* oxlint-disable next/no-img-element -- Keep the supplied SVG identity unchanged. */
/* oxlint-disable jsx-a11y/prefer-tag-over-role -- SheetClose renders real anchors; override its default button role. */
'use client';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetClose,
  SheetDescription,
} from '@/components/ui/sheet';
import { LINKEDIN_URL } from '../seo';
import { ExternalLink } from './external-link';
import styles from '../portfolio-page.module.css';
export function SiteNav() {
  return (
    <header className={styles.nav} data-nav>
      <a
        href="#work"
        aria-label="Bregalda — back to top"
        className={styles.wordmark}
      >
        <img
          src="/brand/bregalda_wordmark.svg"
          alt="Bregalda"
          width="152"
          height="38"
        />
      </a>
      <nav aria-label="Main navigation" className={styles.desktopLinks}>
        <a href="#work">Work</a>
        <a href="#studio">Studio</a>
        <a href="#contact">Contact</a>
      </nav>
      <ExternalLink href={LINKEDIN_URL} className={styles.navCta}>
        Connect on LinkedIn<span aria-hidden="true">↗</span>
      </ExternalLink>
      <div className={styles.mobileMenu} data-mobile-menu>
        <Sheet>
          <SheetTrigger
            render={<Button variant="ghost" className={styles.menuButton} />}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </SheetTrigger>
          <SheetContent className={styles.menuPanel} showCloseButton={false}>
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription className="sr-only">
              Explore the work and connect with Bregalda.
            </SheetDescription>
            <SheetClose
              render={<Button variant="ghost" className={styles.menuClose} />}
              aria-label="Close navigation"
            >
              <X size={20} />
            </SheetClose>
            <nav aria-label="Mobile navigation">
              {[
                ['Work', 'work'],
                ['Studio', 'studio'],
                ['Contact', 'contact'],
              ].map(([name, id]) => (
                <SheetClose
                  key={id}
                  role="link"
                  nativeButton={false}
                  render={<a href={`#${id}`} aria-label={`Go to ${id}`} />}
                >
                  {name}
                  <span aria-hidden="true">↗</span>
                </SheetClose>
              ))}
              <ExternalLink href={LINKEDIN_URL}>
                LinkedIn<span aria-hidden="true">↗</span>
              </ExternalLink>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
      <noscript>
        <nav
          className={styles.noScriptNav}
          aria-label="Navigation without JavaScript"
        >
          <a href="#work">Work</a>
          <a href="#studio">Studio</a>
          <a href="#contact">Contact</a>
          <a href={LINKEDIN_URL}>LinkedIn</a>
        </nav>
      </noscript>
    </header>
  );
}
