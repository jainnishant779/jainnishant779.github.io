import React from 'react';
import { projects } from '../../content/projects';
import { ProjectDossier } from './ProjectDossier';

interface ProjectsProps {
  selectedSlug?: string;
  onSelectProject: (slug: string) => void;
  onClearSelection?: () => void;
}

export const Projects: React.FC<ProjectsProps> = ({
  selectedSlug,
  onSelectProject,
  onClearSelection,
}) => {
  const activeProject = projects.find((p) => p.slug === selectedSlug);

  if (activeProject) {
    return (
      <ProjectDossier
        project={activeProject}
        onBack={() => {
          if (onClearSelection) onClearSelection();
        }}
      />
    );
  }

  return (
    <div className="projects-container">
      <div className="os-module-header">
        <div className="os-module-title-group">
          <h2>02 // PROJECT ARCHIVES</h2>
          <p>EDGE AI, EMBEDDED COMPUTER VISION & DISTRIBUTED SYSTEMS</p>
        </div>
        <div className="os-module-actions">
          <a
            href="https://github.com/jainnishant779"
            target="_blank"
            rel="noopener noreferrer"
            className="os-btn os-btn-outline"
          >
            GITHUB PROFILE ↗
          </a>
        </div>
      </div>

      <div className="projects-grid">
        {projects.map((project) => (
          <div
            key={project.slug}
            className="project-card"
            onClick={() => onSelectProject(project.slug)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onSelectProject(project.slug);
              }
            }}
          >
            <div className="project-image-box">
              {project.image ? (
                <img
                  src={project.image}
                  alt={project.title}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#090c0f',
                    color: 'var(--accent)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                  }}
                >
                  [ PIPELINE ARCHITECTURE ]
                </div>
              )}
              <div className="project-badge-overlay">{project.badge}</div>
            </div>

            <div className="project-card-body">
              <div className="project-card-title">{project.title}</div>
              <p className="project-card-desc">{project.description[0]}</p>

              <div className="project-stack-tags">
                {project.stack.map((tag) => (
                  <span key={tag} className="tag-pill">
                    {tag}
                  </span>
                ))}
              </div>

              {project.imageCaption && (
                <div className="artwork-caption">{project.imageCaption}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
