import React, { useState } from 'react';
import { Project } from '../../content/types';
import { EdgeDeskDiagram } from '../diagrams/EdgeDeskDiagram';
import { CrowdDiagram } from '../diagrams/CrowdDiagram';
import { PoultryHealthDiagram } from '../diagrams/PoultryHealthDiagram';
import { FacialAttendanceDiagram } from '../diagrams/FacialAttendanceDiagram';
import { OnDeviceAiDiagram } from '../diagrams/OnDeviceAiDiagram';
import { sound } from '../../lib/sound';

interface ProjectDossierProps {
  project: Project;
  onBack: () => void;
}

const TABS = ['overview', 'architecture'] as const;
type DossierTab = (typeof TABS)[number];

export const ProjectDossier: React.FC<ProjectDossierProps> = ({ project, onBack }) => {
  const [activeTab, setActiveTab] = useState<DossierTab>('overview');

  return (
    <div className="project-dossier" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
      <button
        className="os-btn os-btn-subtle dossier-back-btn"
        onClick={() => {
          sound.playUiClick();
          onBack();
        }}
        style={{ width: 'fit-content' }}
      >
        ← BACK TO PROJECTS OVERVIEW
      </button>

      {/* Header bar */}
      <div className="os-module-header" style={{ marginBottom: 0 }}>
        <div className="os-module-title-group">
          <h2>{project.title}</h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                backgroundColor: 'rgba(232, 162, 58, 0.15)',
                border: '1px solid #e8a23a',
                color: '#e8a23a',
                padding: '0.15rem 0.55rem',
                borderRadius: '2px',
                fontWeight: 700,
              }}
            >
              {project.badge}
            </span>
            {project.category && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  backgroundColor: 'rgba(0, 229, 255, 0.12)',
                  border: '1px solid rgba(0, 229, 255, 0.3)',
                  color: '#00e5ff',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '2px',
                }}
              >
                {project.category}
              </span>
            )}
          </div>
        </div>
        <div className="os-module-actions" style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <a
            href="https://github.com/jainnishant779"
            target="_blank"
            rel="noopener noreferrer"
            className="os-btn os-btn-primary"
            style={{ textDecoration: 'none', backgroundColor: '#e8a23a', color: '#070a0e', fontWeight: 700 }}
            title="Source code is private — available for technical review on request"
          >
            GITHUB PROFILE ↗
          </a>
        </div>
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#94a3b8' }}>
        Source code is private — available for technical review on request.
      </div>

      {/* Sub-navigation tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid #1e293b',
          paddingBottom: '0.65rem',
          flexWrap: 'wrap',
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                sound.playUiClick();
                setActiveTab(tab);
              }}
              style={{
                padding: '0.35rem 0.85rem',
                backgroundColor: isActive ? '#e8a23a' : 'rgba(15, 23, 42, 0.7)',
                color: isActive ? '#070a0e' : '#94a3b8',
                border: `1px solid ${isActive ? '#e8a23a' : '#334155'}`,
                borderRadius: '3px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {project.image ? (
            <div className="dossier-banner" style={{ background: 'rgba(14, 20, 28, 0.85)', border: '1px solid #1e293b', borderRadius: '6px', padding: '1.25rem' }}>
              <div>
                <img
                  src={project.image}
                  alt={project.title}
                  className="dossier-banner-img"
                  style={{ borderRadius: '4px', maxHeight: '220px', width: 'auto', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                {project.imageCaption && (
                  <div className="artwork-caption">{project.imageCaption}</div>
                )}
              </div>
              <div className="dossier-banner-info">
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent)', fontSize: '1.2rem', margin: 0 }}>
                  Stack & Status
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.75rem' }}>
                  <div>
                    <span className="meta-label" style={{ display: 'block', marginBottom: '0.35rem' }}>
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
                      STATUS:
                    </span>
                    <span className="meta-value" style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>
                      {project.badge}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="dossier-section">
              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent)' }}>
                Technology Stack
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {project.stack.map((t) => (
                  <span key={t} className="tag-pill" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="dossier-section" style={{ background: 'rgba(14, 20, 28, 0.85)', border: '1px solid #1e293b', borderRadius: '6px', padding: '1.25rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: '#f8fafc', fontSize: '1.2rem', marginBottom: '0.75rem' }}>
              Overview
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {project.description.map((desc, idx) => (
                <p key={idx} className="dossier-text" style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                  {desc}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'architecture' && (
        <div className="dossier-section" style={{ background: 'rgba(14, 20, 28, 0.85)', border: '1px solid #1e293b', borderRadius: '6px', padding: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: '#f8fafc', fontSize: '1.2rem', marginBottom: '0.4rem' }}>
            Simplified Architecture
          </h3>
          <p className="dossier-text" style={{ marginBottom: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
            Built from the project description. Click any block to read what it does.
          </p>

          {project.slug === 'edgedesk' && <EdgeDeskDiagram />}
          {project.slug === 'crowd-analytics' && <CrowdDiagram />}
          {project.slug === 'poultry-health-ai' && <PoultryHealthDiagram />}
          {project.slug === 'facial-attendance' && <FacialAttendanceDiagram />}
          {project.slug === 'on-device-ai' && <OnDeviceAiDiagram />}
        </div>
      )}
    </div>
  );
};
