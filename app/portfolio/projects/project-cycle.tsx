import type { PortfolioProject } from '../project-data';
import { ExternalLink } from '../ui/external-link';
import { ProjectArtifact } from './project-artifact';
import styles from '../portfolio-page.module.css';
export function ProjectCycle({ project }: { project: PortfolioProject }) {
  return (
    <article
      id={`project-${project.id}`}
      className={styles.chapter}
      data-project-cycle
      data-project-id={project.id}
      aria-labelledby={`${project.id}-title`}
    >
      <div className={styles.chapterGrid}>
        <div className={styles.chapterCopy}>
          <p className={`technical-label ${styles.projectName}`}>
            <span>{project.sequence} /</span>
            {project.name}
          </p>
          <h2 id={`${project.id}-title`}>{project.headline}</h2>
          <p className={styles.summary}>{project.summary}</p>
          <ExternalLink
            className={styles.textLink}
            href={project.repository}
            aria-label={`View ${project.name} on GitHub`}
          >
            View project on GitHub<span aria-hidden="true">↗</span>
          </ExternalLink>
          <dl className={styles.evidence}>
            {project.evidence.map((item) => (
              <div key={item.label}>
                <dt className="technical-label">{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className={styles.projectDetails}>
          <div data-artifact-reveal className={styles.artifactReveal}>
            <ProjectArtifact type={project.artifact} />
          </div>
        </div>
      </div>
      <div className={styles.chapterFoot}>
        <ul aria-label={`${project.name} technologies`}>
          {project.technologies.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>
        {project.disclosure && <p>{project.disclosure}</p>}
        {project.limitation && <p>{project.limitation}</p>}
      </div>
    </article>
  );
}
