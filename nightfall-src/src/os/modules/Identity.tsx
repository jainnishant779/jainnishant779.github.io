import React from 'react';
import { profile, education } from '../../content/profile';
import { projects } from '../../content/projects';
import { getCVUrl } from '../../lib/assets';
import { sound } from '../../lib/sound';
import type { OSModuleId } from '../OSShell';

interface IdentityProps {
  onNavigate?: (module: OSModuleId) => void;
}

export const Identity: React.FC<IdentityProps> = ({ onNavigate }) => {
  const cvUrl = getCVUrl();

  return (
    <div className="identity-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <div className="os-module-header">
        <div className="os-module-title-group">
          <h2>01 // IDENTITY DOSSIER</h2>
          <p>ENGINEER PROFILE & CREDENTIALS</p>
        </div>
        <div className="os-module-actions">
          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="os-btn os-btn-primary"
            style={{ textDecoration: 'none' }}
          >
            DOWNLOAD CV (PDF) ↗
          </a>
        </div>
      </div>

      {/* Main Profile Dossier Card Matching Reference Image 1 Panel 11 */}
      <div
        className="identity-dossier-card"
        style={{
          background: 'linear-gradient(135deg, rgba(14, 20, 28, 0.95) 0%, rgba(9, 13, 18, 0.98) 100%)',
          border: '1px solid rgba(0, 229, 255, 0.25)',
          borderRadius: '6px',
          padding: '1.75rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div style={{ display: 'flex', gap: '1.75rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Avatar Photo Frame */}
          <div
            style={{
              width: '150px',
              height: '150px',
              borderRadius: '6px',
              border: '2px solid rgba(232, 162, 58, 0.45)',
              boxShadow: '0 0 25px rgba(232, 162, 58, 0.25)',
              overflow: 'hidden',
              flexShrink: 0,
              backgroundColor: '#070a0e',
            }}
          >
            <img
              src="/nightfall/images/profile/nishant_avatar.jpg"
              alt="Nishant Jain"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* Dossier Body */}
          <div style={{ flex: 1, minWidth: '260px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.1rem', margin: 0, color: '#f8fafc', fontWeight: 700 }}>
                  {profile.name}
                </h1>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: '#e8a23a', fontWeight: 700, marginTop: '0.2rem' }}>
                  {profile.title}
                </div>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  backgroundColor: 'rgba(52, 211, 153, 0.15)',
                  border: '1px solid #34d399',
                  color: '#34d399',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '2px',
                }}
              >
                ● ACTIVE ENGR
              </span>
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#34d399', marginTop: '0.65rem' }}>
              "{profile.tagline}"
            </div>

            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.6, marginTop: '0.65rem' }}>
              {profile.summary}
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="os-btn os-btn-primary"
                style={{ textDecoration: 'none', backgroundColor: '#e8a23a', color: '#070a0e', fontWeight: 700 }}
              >
                VIEW CV ↗
              </a>

              {onNavigate && (
                <button
                  type="button"
                  className="os-btn os-btn-outline"
                  onClick={() => {
                    sound.playUiClick();
                    onNavigate('projects');
                  }}
                  style={{ borderColor: 'rgba(232, 162, 58, 0.5)', color: '#e8a23a' }}
                >
                  VIEW PROJECTS ({projects.length}) →
                </button>
              )}

              {onNavigate && (
                <button
                  type="button"
                  className="os-btn os-btn-subtle"
                  onClick={() => {
                    sound.playUiClick();
                    onNavigate('contact');
                  }}
                  style={{ color: '#94a3b8' }}
                >
                  TRANSMISSION CHANNEL →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Education & Academic Foundation + Technical Disciplines */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Education Card */}
        <div
          className="identity-card"
          style={{
            background: 'rgba(14, 20, 28, 0.85)',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '1.4rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#f8fafc', margin: 0 }}>
              Academic Foundation
            </h3>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#34d399' }}>
              FROM CV
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.98rem', fontWeight: 600, color: '#f8fafc' }}>
                {education.degree}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                {education.institution}, {education.location}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#e8a23a', marginTop: '0.25rem' }}>
                Period: {education.period}
              </div>
            </div>

            <div style={{ borderTop: '1px solid #1e293b', paddingTop: '0.75rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#64748b', marginBottom: '0.35rem' }}>
                RELEVANT COURSEWORK:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {education.coursework.map((course) => (
                  <span key={course} className="tag-pill" style={{ fontSize: '0.74rem' }}>
                    {course}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Core Verification Meta List */}
        <div
          className="identity-card"
          style={{
            background: 'rgba(14, 20, 28, 0.85)',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '1.4rem',
          }}
        >
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#f8fafc', margin: '0 0 0.85rem 0' }}>
            Operating Parameters
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#64748b' }}>LOCATION:</span>
              <span style={{ color: '#e2e8f0', textAlign: 'right' }}>{profile.location}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#64748b' }}>DISCIPLINE:</span>
              <span style={{ color: '#e8a23a', textAlign: 'right' }}>AI/ML · Edge AI · IoT</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#64748b' }}>EMAIL:</span>
              <a href={`mailto:${profile.email}`} style={{ color: '#00e5ff', textDecoration: 'none', textAlign: 'right' }}>
                {profile.email}
              </a>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#64748b' }}>GITHUB:</span>
              <a href={profile.github} target="_blank" rel="noopener noreferrer" style={{ color: '#00e5ff', textDecoration: 'none', textAlign: 'right' }}>
                github.com/jainnishant779 ↗
              </a>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>LINKEDIN:</span>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#00e5ff', textDecoration: 'none', textAlign: 'right' }}>
                linkedin.com/in/nishujain02 ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
