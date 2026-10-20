import React from 'react';
import { Project } from '../../content/types';
import { EdgeDeskDiagram } from '../diagrams/EdgeDeskDiagram';
import { CrowdDiagram } from '../diagrams/CrowdDiagram';
import { LoRaDiagram } from '../diagrams/LoRaDiagram';

interface ProjectDossierProps {
  project: Project;
  onBack: () => void;
}

export const ProjectDossier: React.FC<ProjectDossierProps> = ({ project, onBack }) => {
  return (
    <div className="project-dossier">
      <button className="os-btn os-btn-subtle dossier-back-btn" onClick={onBack}>
        ← BACK TO PROJECTS OVERVIEW
      </button>

      <div className="os-module-header" style={{ marginBottom: '1rem' }}>
        <div className="os-module-title-group">
          <h2>{project.title}</h2>
          <p>{project.badge}</p>
        </div>
        <div className="os-module-actions">
          <a
            href="https://github.com/jainnishant779"
            target="_blank"
            rel="noopener noreferrer"
            className="os-btn os-btn-primary"
          >
            VIEW GITHUB PROFILE ↗
          </a>
        </div>
      </div>

      <div className="dossier-notice">
        <strong>NOTE:</strong> Repository source code is private. Source is available for technical review on request.
      </div>

      {project.image ? (
        <div className="dossier-banner">
          <div>
            <img
              src={project.image}
              alt={project.title}
              className="dossier-banner-img"
              onError={(e) => {
                // If image fails to load, gracefully hide it
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            {project.imageCaption && (
              <div className="artwork-caption">{project.imageCaption}</div>
            )}
          </div>
          <div className="dossier-banner-info">
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent)' }}>
              Core Specifications
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div>
                <span className="meta-label" style={{ display: 'block', marginBottom: '0.25rem' }}>
                  TECHNOLOGY STACK:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {project.stack.map((t) => (
                    <span key={t} className="tag-pill">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <span className="meta-label" style={{ display: 'block', marginBottom: '0.25rem' }}>
                  DEPLOYMENT STATUS:
                </span>
                <span className="meta-value" style={{ color: 'var(--green)' }}>
                  {project.badge}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="dossier-section">
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent)' }}>
            Technology Stack & Scope
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {project.stack.map((t) => (
              <span key={t} className="tag-pill" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="dossier-section">
        <h3>Engineering Overview</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {project.description.map((desc, idx) => (
            <p key={idx} className="dossier-text">
              {desc}
            </p>
          ))}
        </div>
      </div>

      {project.slug === 'edgedesk' && (
        <div className="dossier-section">
          <h3>System Architecture Diagram</h3>
          <p className="dossier-text" style={{ marginBottom: '1rem' }}>
            Interactive block diagram of the EdgeDesk multi-device streaming pipeline. Select any node for subsystem details.
          </p>
          <EdgeDeskDiagram />
        </div>
      )}

      {project.slug === 'crowd-analytics' && (
        <div className="dossier-section">
          <h3>Inference & Tracking Pipeline</h3>
          <p className="dossier-text" style={{ marginBottom: '1rem' }}>
            GPU-accelerated end-to-end edge pipeline from raw camera stream to real-time density and velocity anomaly detection. Select any node to inspect subsystem mechanics.
          </p>
          <CrowdDiagram />
        </div>
      )}

      {project.slug === 'lora-traffic-mesh' && (
        <div className="dossier-section">
          <h3>Decentralized Mesh & Fail-Safe Architecture</h3>
          <p className="dossier-text" style={{ marginBottom: '1rem' }}>
            Ad-hoc gossip protocol across sub-GHz ESP32 hardware nodes coordinating traffic signals without internet backhaul.
          </p>
          <LoRaDiagram />
        </div>
      )}
    </div>
  );
};
