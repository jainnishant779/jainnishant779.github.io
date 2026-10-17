import React from 'react';
import { profile } from '../content/profile';
import type { OSModuleId } from './OSShell';

interface OSHomeProps {
  onSelectModule: (moduleId: OSModuleId) => void;
}

export const OSHome: React.FC<OSHomeProps> = ({ onSelectModule }) => {
  return (
    <div className="os-home-dashboard">
      <div className="os-module-header">
        <div className="os-module-title-group">
          <h2>NJ-OS // COMMAND CENTER</h2>
          <p>ENGINEERING INTELLIGENCE & TELEMETRY</p>
        </div>
      </div>

      <div className="identity-card featured" style={{ marginBottom: '1.75rem' }}>
        <div className="identity-headline">
          <h3>{profile.name}</h3>
          <div className="role-subtitle">{profile.title}</div>
        </div>
        <p className="identity-summary">{profile.summary}</p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <button className="os-btn os-btn-primary" onClick={() => onSelectModule('projects')}>
            EXPLORE PROJECTS (5) →
          </button>
          <button className="os-btn os-btn-outline" onClick={() => onSelectModule('dossier')}>
            CURRICULUM VITAE →
          </button>
          <button className="os-btn os-btn-subtle" onClick={() => onSelectModule('architecture')}>
            SYSTEM TOPOLOGY →
          </button>
        </div>
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        QUICK ACCESS MODULES:
      </div>

      <div className="projects-grid">
        <div
          className="project-card"
          onClick={() => onSelectModule('identity')}
          role="button"
          tabIndex={0}
        >
          <div className="project-card-body">
            <div className="project-card-title">01 // Identity Dossier</div>
            <p className="project-card-desc">
              Biographical profile, core discipline, and verified academic degree at DAVV Indore.
            </p>
          </div>
        </div>

        <div
          className="project-card"
          onClick={() => onSelectModule('projects')}
          role="button"
          tabIndex={0}
        >
          <div className="project-card-body">
            <div className="project-card-title">02 // Project Archives</div>
            <p className="project-card-desc">
              5 production & edge AI projects including EdgeDesk, Crowd Analytics, and Poultry Health AI.
            </p>
          </div>
        </div>

        <div
          className="project-card"
          onClick={() => onSelectModule('experience')}
          role="button"
          tabIndex={0}
        >
          <div className="project-card-body">
            <div className="project-card-title">03 // Experience Log</div>
            <p className="project-card-desc">
              Founding Engineer at Cognicity, AI/ML & IoT Engineer at Synquic Labs.
            </p>
          </div>
        </div>

        <div
          className="project-card"
          onClick={() => onSelectModule('skills')}
          role="button"
          tabIndex={0}
        >
          <div className="project-card-body">
            <div className="project-card-title">04 // Capabilities</div>
            <p className="project-card-desc">
              Categorized proficiency across CV, PyTorch/YOLO, CUDA, embedded edge hardware, and cloud.
            </p>
          </div>
        </div>

        <div
          className="project-card"
          onClick={() => onSelectModule('achievements')}
          role="button"
          tabIndex={0}
        >
          <div className="project-card-body">
            <div className="project-card-title">05 // Honors & Certs</div>
            <p className="project-card-desc">
              Sustainathon NATRAX winner, MPSEDC Mahakumbh finalist, patent application status.
            </p>
          </div>
        </div>

        <div
          className="project-card"
          onClick={() => onSelectModule('contact')}
          role="button"
          tabIndex={0}
        >
          <div className="project-card-body">
            <div className="project-card-title">07 // Transmission</div>
            <p className="project-card-desc">
              Direct dispatch mailer, email copy utility, and social coordinates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
