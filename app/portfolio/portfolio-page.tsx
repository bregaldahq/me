import { PROJECTS } from './project-data';
import { OrbitStage } from './orbit/orbit-stage';
import { ProjectCycle } from './projects/project-cycle';
import { SiteNav } from './ui/site-nav';
import { StudioSection } from './ui/studio-section';
import { ContactSection } from './ui/contact-section';
import { SiteFooter } from './ui/site-footer';
import styles from './portfolio-page.module.css';
export function PortfolioPage() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <SiteNav />
      <main id="main-content">
        <div className={styles.story} data-orbit-story>
          <OrbitStage projects={PROJECTS} />
          <div aria-label="Selected work">
            {PROJECTS.map((project) => (
              <ProjectCycle key={project.id} project={project} />
            ))}
          </div>
        </div>
        <StudioSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}
