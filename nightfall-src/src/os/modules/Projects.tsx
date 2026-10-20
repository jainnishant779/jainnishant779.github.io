import React, { useState, useMemo } from 'react';
import { projects } from '../../content/projects';
import { ProjectDossier } from './ProjectDossier';

interface ProjectsProps {
  selectedSlug?: string;
  onSelectProject: (slug: string) => void;
  onClearSelection?: () => void;
}

const CATEGORIES = ['All', 'AI/ML', 'Computer Vision', 'Edge AI', 'IoT', 'Research'] as const;

export const Projects: React.FC<ProjectsProps> = ({
  selectedSlug,
  onSelectProject,
  onClearSelection,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const activeProject = projects.find((p) => p.slug === selectedSlug);

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'All') return projects;
    return projects.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

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

      {/* Category Filter Pills Matching Reference Panel 5 */}
      <div
        className="project-category-filters"
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
        }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '0.4rem 0.95rem',
                backgroundColor: isActive ? '#e8a23a' : 'rgba(14, 18, 24, 0.85)',
                color: isActive ? '#070a0e' : '#9e9a8e',
                border: `1px solid ${isActive ? '#e8a23a' : '#232a35'}`,
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <div className="projects-grid">
        {filteredProjects.map((project) => (
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
              {project.subtitle && (
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--accent)',
                    fontFamily: 'var(--font-mono)',
                    marginBottom: '0.35rem',
                    fontWeight: 600,
                  }}
                >
                  {project.subtitle}
                </div>
              )}
              <p className="project-card-desc">{project.description[0]}</p>

              <div className="project-stack-tags">
                {project.stack.map((tag) => (
                  <span key={tag} className="tag-pill">
                    {tag}
                  </span>
                ))}
              </div>

              <div
                style={{
                  marginTop: '0.85rem',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <span
                  style={{
                    fontSize: '0.74rem',
                    color: 'var(--accent)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                  }}
                >
                  View Details →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
