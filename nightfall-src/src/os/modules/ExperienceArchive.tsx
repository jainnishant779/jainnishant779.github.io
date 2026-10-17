import React from 'react';
import { experiences } from '../../content/experience';

export const ExperienceArchive: React.FC = () => {
  return (
    <div className="experience-container">
      <div className="os-module-header">
        <div className="os-module-title-group">
          <h2>03 // EXPERIENCE LOG</h2>
          <p>ENGINEERING ROLES & PRODUCTION DEPLOYMENTS</p>
        </div>
      </div>

      <div className="timeline">
        {experiences.map((exp, idx) => (
          <div key={idx} className="timeline-item">
            <div className="timeline-header">
              <div>
                <div className="timeline-role">{exp.role}</div>
                <div className="timeline-company">
                  {exp.company} — {exp.location}
                </div>
              </div>
              <div className="timeline-period">{exp.period}</div>
            </div>

            <ul className="timeline-bullets">
              {exp.bullets.map((bullet, bIdx) => (
                <li key={bIdx} className="timeline-bullet-item">
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
