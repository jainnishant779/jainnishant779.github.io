import React from 'react';
import { profile } from '../content/profile';
import { projects } from '../content/projects';
import { experiences } from '../content/experience';
import { skillGroups } from '../content/skills';
import { getCVUrl } from '../lib/assets';
import { sound } from '../lib/sound';
import type { OSModuleId } from './OSShell';

interface OSHomeProps {
  onSelectModule: (moduleId: OSModuleId, slug?: string) => void;
}

export const OSHome: React.FC<OSHomeProps> = ({ onSelectModule }) => {
  const cvUrl = getCVUrl();
  const companyCount = new Set(experiences.map((e) => e.company)).size;

  const featuredProjects = projects.slice(0, 4);

  return (
    <div className="os-home-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <div className="os-module-header">
        <div className="os-module-title-group">
          <h2>NJ-OS // COMMAND CENTER</h2>
          <p>PROFILE OVERVIEW</p>
        </div>
      </div>

      {/* ============================================================
       * 1. TOP CARDS ROW: PERSONAL PROFILE HERO + LIVE SYSTEM STATUS
       * Matches Reference Image 2 & Image 1 Panel 4
       * ============================================================ */}
      <div
        className="home-top-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.65fr) minmax(320px, 1fr)',
          gap: '1.25rem',
        }}
      >
        {/* LEFT / CENTER: PERSONAL PROFILE HERO BANNER */}
        <div
          className="home-hero-card"
          style={{
            background: 'linear-gradient(135deg, rgba(14, 20, 28, 0.95) 0%, rgba(9, 13, 18, 0.98) 100%)',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 0 40px rgba(0, 229, 255, 0.04)',
            borderRadius: '6px',
            padding: '1.6rem 1.8rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Top Indicator */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#00e5ff', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00e5ff', boxShadow: '0 0 6px #00e5ff' }} />
              // PERSONAL PROFILE
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#7fb38a' }}>
              PROFILE // FROM CV
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.4rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Nishant Jain Avatar Portrait */}
            <div
              style={{
                position: 'relative',
                width: '130px',
                height: '130px',
                borderRadius: '6px',
                border: '2px solid rgba(0, 229, 255, 0.45)',
                boxShadow: '0 0 20px rgba(0, 229, 255, 0.25)',
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
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background: 'linear-gradient(180deg, transparent 65%, rgba(4, 8, 12, 0.8) 100%)',
                }}
              />
            </div>

            {/* Profile Intro Body */}
            <div style={{ flex: 1, minWidth: '240px' }}>
              <h1
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '2rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: '#f8fafc',
                  margin: 0,
                  lineHeight: 1.15,
                }}
              >
                NISHANT JAIN
              </h1>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  color: '#e8a23a',
                  letterSpacing: '0.05em',
                  marginTop: '0.25rem',
                }}
              >
                AI/ML ENGINEER
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.74rem',
                  color: '#94a3b8',
                  marginTop: '0.2rem',
                  letterSpacing: '0.04em',
                }}
              >
                COMPUTER VISION • EDGE AI • IOT
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  color: '#34d399',
                  fontWeight: 600,
                  marginTop: '0.55rem',
                }}
              >
                "{profile.tagline}"
              </div>

              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.88rem',
                  color: '#cbd5e1',
                  lineHeight: 1.55,
                  marginTop: '0.55rem',
                  maxWidth: '560px',
                }}
              >
                {profile.summary}
              </p>

              {/* 3 Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.1rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="os-btn os-btn-primary"
                  onClick={() => {
                    sound.playUiClick();
                    onSelectModule('projects');
                  }}
                  style={{
                    backgroundColor: '#e8a23a',
                    color: '#070a0e',
                    border: 'none',
                    fontWeight: 700,
                    padding: '0.55rem 1.3rem',
                    boxShadow: '0 0 15px rgba(232, 162, 58, 0.4)',
                  }}
                >
                  EXPLORE PROJECTS →
                </button>

                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="os-btn os-btn-outline"
                  style={{
                    borderColor: 'rgba(232, 162, 58, 0.5)',
                    color: '#e8a23a',
                    padding: '0.55rem 1.1rem',
                    textDecoration: 'none',
                  }}
                >
                  VIEW CV (PDF) ↗
                </a>
              </div>
            </div>
          </div>

          {/* 4 Key Metrics Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.75rem',
              marginTop: '1.4rem',
              paddingTop: '1.1rem',
              borderTop: '1px solid rgba(0, 229, 255, 0.15)',
            }}
          >
            <div style={{ background: 'rgba(11, 16, 22, 0.75)', border: '1px solid rgba(232, 162, 58, 0.25)', padding: '0.65rem 0.85rem', borderRadius: '4px' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', color: '#e8a23a', fontWeight: 700 }}>2021–26</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.64rem', color: '#94a3b8' }}>B.TECH + M.TECH · IOT</div>
            </div>

            <div style={{ background: 'rgba(11, 16, 22, 0.75)', border: '1px solid rgba(0, 229, 255, 0.25)', padding: '0.65rem 0.85rem', borderRadius: '4px' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', color: '#00e5ff', fontWeight: 700 }}>{companyCount}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.64rem', color: '#94a3b8' }}>COMPANIES: COGNICITY · SYNQUIC</div>
            </div>

            <div style={{ background: 'rgba(11, 16, 22, 0.75)', border: '1px solid rgba(52, 211, 153, 0.25)', padding: '0.65rem 0.85rem', borderRadius: '4px' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', color: '#34d399', fontWeight: 700 }}>{projects.length}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.64rem', color: '#94a3b8' }}>PROJECTS</div>
            </div>

            <div style={{ background: 'rgba(11, 16, 22, 0.75)', border: '1px solid rgba(232, 162, 58, 0.25)', padding: '0.65rem 0.85rem', borderRadius: '4px' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', color: '#e8a23a', fontWeight: 700 }}>1</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.64rem', color: '#94a3b8' }}>PATENT APP FILED · NOT GRANTED</div>
            </div>
          </div>
        </div>

        {/* RIGHT: LIVE SYSTEM TELEMETRY & FOCUS PANEL */}
        <div
          className="home-telemetry-card"
          style={{
            background: 'linear-gradient(135deg, rgba(14, 20, 28, 0.95) 0%, rgba(9, 13, 18, 0.98) 100%)',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
            borderRadius: '6px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#00e5ff', letterSpacing: '0.06em', marginBottom: '0.85rem' }}>
              // SELECTED WORK
            </div>

            {/* Current Focus List */}
            <div style={{ borderTop: '1px solid rgba(0, 229, 255, 0.15)', paddingTop: '0.85rem', marginBottom: '1rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#94a3b8', marginBottom: '0.45rem' }}>
                PROJECTS & STATUS:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.74rem', fontFamily: 'var(--font-mono)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0' }}>
                  <span>▸ On-Device AI Assistant</span>
                  <span style={{ color: '#00e5ff' }}>Personal R&D</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0' }}>
                  <span>▸ EdgeDesk Fleet Access</span>
                  <span style={{ color: '#e8a23a' }}>Patent app filed</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0' }}>
                  <span>▸ Poultry Health Monitoring</span>
                  <span style={{ color: '#34d399' }}>Client project</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0' }}>
                  <span>▸ Crowd Analytics Stampede</span>
                  <span style={{ color: '#e8a23a' }}>Top Finalist</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Access Channel Links */}
          <div style={{ borderTop: '1px solid rgba(0, 229, 255, 0.15)', paddingTop: '0.85rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: '#64748b', marginBottom: '0.45rem' }}>
              DIRECT ACCESS CHANNELS:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.45rem' }}>
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid #334155',
                  color: '#cbd5e1',
                  padding: '0.35rem 0.55rem',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  borderRadius: '3px',
                  textDecoration: 'none',
                  textAlign: 'center',
                }}
              >
                GitHub ↗
              </a>

              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid #334155',
                  color: '#cbd5e1',
                  padding: '0.35rem 0.55rem',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  borderRadius: '3px',
                  textDecoration: 'none',
                  textAlign: 'center',
                }}
              >
                LinkedIn ↗
              </a>

              <button
                type="button"
                onClick={() => onSelectModule('contact')}
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid #334155',
                  color: '#e8a23a',
                  padding: '0.35rem 0.55rem',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                Email Me ✉
              </button>

              <button
                type="button"
                onClick={() => onSelectModule('architecture')}
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid #334155',
                  color: '#00e5ff',
                  padding: '0.35rem 0.55rem',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                Systems Lab 🔬
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
       * 2. BOTTOM THREE-COLUMN SECTION:
       * FEATURED PROJECTS + EXPERIENCE TIMELINE + SKILLS MATRIX
       * Directly matches Reference Image 2!
       * ============================================================ */}
      <div
        className="home-bottom-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.35fr) minmax(280px, 1fr) minmax(280px, 1fr)',
          gap: '1.25rem',
        }}
      >
        {/* COLUMN 1: FEATURED PROJECTS */}
        <div
          style={{
            background: 'rgba(11, 16, 22, 0.85)',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#00e5ff', fontWeight: 700 }}>
              // FEATURED PROJECTS
            </div>
            <button
              type="button"
              onClick={() => onSelectModule('projects')}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: '#e8a23a',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              VIEW ALL ({projects.length}) →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
            {featuredProjects.map((p) => (
              <div
                key={p.slug}
                onClick={() => {
                  sound.playUiClick();
                  onSelectModule('projects', p.slug);
                }}
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid #334155',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease, transform 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#00e5ff';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#334155';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ height: '70px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                  {p.image ? (
                    <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#090d14' }} />
                  )}
                  <span
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      fontSize: '0.55rem',
                      fontFamily: 'var(--font-mono)',
                      background: 'rgba(7, 10, 14, 0.85)',
                      color: '#e8a23a',
                      padding: '0.1rem 0.35rem',
                      borderRadius: '2px',
                    }}
                  >
                    {p.category}
                  </span>
                </div>
                <div style={{ padding: '0.55rem' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.title.split(':')[0]}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                    {p.subtitle || p.badge}
                  </div>
                  <div style={{ marginTop: '0.45rem', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#00e5ff', fontWeight: 600 }}>
                    View Details →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: EXPERIENCE TIMELINE */}
        <div
          style={{
            background: 'rgba(11, 16, 22, 0.85)',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#00e5ff', fontWeight: 700 }}>
              // EXPERIENCE TIMELINE
            </div>
            <button
              type="button"
              onClick={() => onSelectModule('experience')}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: '#e8a23a',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              DETAILS →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {experiences.map((exp, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.65rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#e8a23a', boxShadow: '0 0 6px #e8a23a' }} />
                  {idx < experiences.length - 1 && <div style={{ width: '2px', flex: 1, backgroundColor: '#334155', margin: '4px 0' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#e8a23a', fontWeight: 700 }}>
                    {exp.period}
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', color: '#f8fafc', fontWeight: 600 }}>
                    {exp.role}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#94a3b8' }}>
                    {exp.company}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 3: SKILLS MATRIX */}
        <div
          style={{
            background: 'rgba(11, 16, 22, 0.85)',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#00e5ff', fontWeight: 700 }}>
              // SKILLS MATRIX
            </div>
            <button
              type="button"
              onClick={() => onSelectModule('skills')}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: '#e8a23a',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              FULL MATRIX →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {skillGroups.slice(0, 4).map((group) => (
              <div key={group.group} style={{ borderBottom: '1px solid #1e293b', paddingBottom: '0.55rem' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.35rem' }}>
                  {group.group}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {group.skills.slice(0, 4).map((s) => (
                    <span
                      key={s}
                      style={{
                        fontSize: '0.66rem',
                        fontFamily: 'var(--font-mono)',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid #334155',
                        color: '#94a3b8',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '2px',
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
