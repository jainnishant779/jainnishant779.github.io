import React from 'react';
import { skillGroups } from '../../content/skills';

const GROUP_ICONS: Record<string, string> = {
  'AI/ML & Computer Vision': '🧠',
  'Edge AI & Embedded': '⚡',
  'IoT & Hardware': '📡',
  'Backend & Databases': '🗄️',
  'Cloud & DevOps': '☁️',
  'GenAI': '✨',
  'Mobile & On-device AI': '📱',
};

export const Skills: React.FC = () => {
  return (
    <div className="skills-container">
      <div className="os-module-header">
        <div className="os-module-title-group">
          <h2>04 // TECHNICAL CAPABILITIES</h2>
          <p>CATEGORIZED STACK & SYSTEM PROFICIENCIES</p>
        </div>
      </div>

      <div className="skills-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {skillGroups.map((group) => (
          <div
            key={group.group}
            className="skill-group-card"
            style={{
              background: 'linear-gradient(135deg, rgba(14, 20, 28, 0.95) 0%, rgba(9, 13, 18, 0.98) 100%)',
              border: '1px solid rgba(0, 229, 255, 0.25)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              borderRadius: '6px',
            }}
          >
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f8fafc' }}>
              <span>{GROUP_ICONS[group.group] || '⚡'}</span>
              <span>{group.group}</span>
            </h3>
            <div className="skill-pills-wrap">
              {group.skills.map((skill) => (
                <span
                  key={skill}
                  className="skill-pill"
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid rgba(0, 229, 255, 0.3)',
                    color: '#e2e8f0',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
            {group.note && <div className="skill-group-note" style={{ color: '#00e5ff', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>※ {group.note}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};
