import React from 'react';
import { achievements, certifications } from '../../content/achievements';

export const Achievements: React.FC = () => {
  return (
    <div className="achievements-container">
      <div className="os-module-header">
        <div className="os-module-title-group">
          <h2>05 // HONORS & CREDENTIALS</h2>
          <p>COMPETITIVE ACHIEVEMENTS & ACCREDITATIONS</p>
        </div>
      </div>

      <div className="achievements-grid">
        <div className="achievement-panel">
          <h3>Competitive Honors & Patents</h3>
          <ul className="achievements-list">
            {achievements.map((item, idx) => (
              <li key={idx} className="achievement-item">
                <span className="achievement-title">{item.title}</span>
                {item.detail && <span className="achievement-detail">▸ {item.detail}</span>}
              </li>
            ))}
          </ul>
        </div>

        <div className="achievement-panel">
          <h3>Verified Certifications</h3>
          <ul className="achievements-list">
            {certifications.map((item, idx) => (
              <li key={idx} className="achievement-item">
                <span className="achievement-title">{item.title}</span>
                <span className="achievement-detail">ISSUING BODY: {item.issuer}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
