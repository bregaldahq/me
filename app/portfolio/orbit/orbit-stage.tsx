/* oxlint-disable next/no-img-element -- A static SVG identity needs no runtime image service. */
import type { PortfolioProject } from '../project-data';
import styles from './orbit-stage.module.css';
export function OrbitStage({
  projects,
}: {
  projects: readonly PortfolioProject[];
}) {
  return (
    <section
      id="work"
      className={styles.stage}
      aria-labelledby="work-title"
      data-orbit-stage
    >
      <div className={styles.copy}>
        <p className="technical-label">
          <span className={styles.signal} />
          Independent software studio
        </p>
        <h1 id="work-title">
          Thoughtful tools.
          <br />
          <span>
            Real technical
            <br className={styles.desktopBreak} /> problems.
          </span>
        </h1>
        <p className={styles.intro}>
          A collection of systems built to bring
          <br className={styles.desktopBreak} /> clarity to complexity.
        </p>
        <a href="#project-reconcileflow" className={styles.explore}>
          Explore the work <span aria-hidden="true">↓</span>
        </a>
      </div>
      <div className={styles.visual} data-orbit-visual>
        <div className={styles.monogram}>
          <img
            src="/brand/bregalda_monogram.svg"
            alt="Bregalda"
            width="90"
            height="96"
          />
        </div>
      </div>
      <nav aria-label="Featured projects" className={styles.projectNav}>
        {projects.map((project) => (
          <a
            key={project.id}
            href={`#project-${project.id}`}
            data-orbit-project={project.id}
          >
            <span className="technical-label">{project.sequence}</span>
            <span>{project.navLabel}</span>
            <span aria-hidden="true">↗</span>
          </a>
        ))}
      </nav>
      <p className={`technical-label ${styles.scrollNote}`}>
        Four projects. One curious mind.
      </p>
    </section>
  );
}
