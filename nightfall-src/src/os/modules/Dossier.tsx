import React from 'react';
import { profile } from '../../content/profile';
import { getCVUrl } from '../../lib/assets';

export const Dossier: React.FC = () => {
  const cvUrl = getCVUrl();

  return (
    <div className="dossier-container">
      <div className="os-module-header">
        <div className="os-module-title-group">
          <h2>06 // CURRICULUM VITAE</h2>
          <p>STANDARDIZED TECHNICAL RÉSUMÉ</p>
        </div>
        <div className="os-module-actions">
          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="os-btn os-btn-primary"
          >
            OPEN IN NEW TAB ↗
          </a>
          <a
            href={cvUrl}
            download="Nishant_Jain_CV.pdf"
            className="os-btn os-btn-outline"
          >
            DOWNLOAD PDF ↓
          </a>
        </div>
      </div>

      <div className="dossier-notice">
        <strong>PROFESSIONAL OVERVIEW:</strong> {profile.summary}
      </div>

      <div className="cv-frame-box">
        <iframe
          src={`${cvUrl}#toolbar=0&navpanes=0`}
          title="Nishant Jain CV Document"
          aria-label="Nishant Jain Curriculum Vitae"
        />
      </div>
    </div>
  );
};
