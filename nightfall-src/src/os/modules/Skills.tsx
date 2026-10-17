import React from 'react';
import { skillGroups } from '../../content/skills';

export const Skills: React.FC = () => {
  return (
    <div className="skills-container">
      <div className="os-module-header">
        <div className="os-module-title-group">
          <h2>04 // TECHNICAL CAPABILITIES</h2>
          <p>CATEGORIZED STACK & SYSTEM PROFICIENCIES</p>
        </div>
      </div>

      <div className="skills-grid">
        {skillGroups.map((group) => (
          <div key={group.group} className="skill-group-card">
            <h3>{group.group}</h3>
            <div className="skill-pills-wrap">
              {group.skills.map((skill) => (
                <span key={skill} className="skill-pill">
                  {skill}
                </span>
              ))}
            </div>
            {group.note && <div className="skill-group-note">※ {group.note}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};
