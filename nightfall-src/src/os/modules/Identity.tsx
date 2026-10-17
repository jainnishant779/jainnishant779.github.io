import React from 'react';
import { profile, education } from '../../content/profile';
import type { OSModuleId } from '../OSShell';

interface IdentityProps {
  onNavigate?: (module: OSModuleId) => void;
}

export const Identity: React.FC<IdentityProps> = ({ onNavigate }) => {
  return (
    <div className="identity-container">
      <div className="os-module-header">
        <div className="os-module-title-group">
          <h2>01 // IDENTITY DOSSIER</h2>
          <p>ENGINEER SPECIFICATION & CREDENTIALS</p>
        </div>
        <div className="os-module-actions">
          {onNavigate && (
            <button
              className="os-btn os-btn-primary"
              onClick={() => onNavigate('dossier')}
            >
              DOWNLOAD CV ↗
            </button>
          )}
        </div>
      </div>

      <div className="identity-grid">
        <div className="identity-card featured">
          <div className="identity-headline">
            <h3>{profile.name}</h3>
            <div className="role-subtitle">{profile.title}</div>
          </div>

          <p className="identity-summary">{profile.summary}</p>

          <div className="identity-meta-list">
            <div className="identity-meta-item">
              <span className="meta-label">TAGLINE:</span>
              <span className="meta-value" style={{ color: 'var(--accent)' }}>
                "{profile.tagline}"
              </span>
            </div>
            <div className="identity-meta-item">
              <span className="meta-label">LOCATION:</span>
              <span className="meta-value">{profile.location}</span>
            </div>
            <div className="identity-meta-item">
              <span className="meta-label">DISCIPLINE:</span>
              <span className="meta-value">Computer Vision, Edge AI, IoT, Model Deployment</span>
            </div>
          </div>
        </div>

        <div className="identity-card">
          <div className="identity-headline">
            <h3 style={{ fontSize: '1.4rem' }}>Education & Foundation</h3>
            <div className="role-subtitle" style={{ color: 'var(--green)' }}>
              ACADEMIC VERIFICATION
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {education.degree}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {education.institution}, {education.location}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent)', marginTop: '0.2rem' }}>
                Period: {education.period}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.85rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                CORE COURSEWORK:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {education.coursework.map((course) => (
                  <span key={course} className="tag-pill">
                    {course}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.85rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                CONTACT CHANNELS:
              </div>
              <div className="identity-meta-list" style={{ borderTop: 'none', paddingTop: 0 }}>
                <div className="identity-meta-item">
                  <span className="meta-label">EMAIL:</span>
                  <a href={`mailto:${profile.email}`} className="meta-value">
                    {profile.email}
                  </a>
                </div>
                <div className="identity-meta-item">
                  <span className="meta-label">GITHUB:</span>
                  <a href={profile.github} target="_blank" rel="noopener noreferrer" className="meta-value">
                    github.com/jainnishant779 ↗
                  </a>
                </div>
                <div className="identity-meta-item">
                  <span className="meta-label">LINKEDIN:</span>
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="meta-value">
                    linkedin.com/in/nishujain02 ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
