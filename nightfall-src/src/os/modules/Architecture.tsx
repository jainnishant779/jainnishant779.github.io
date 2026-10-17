import React, { useState } from 'react';
import { EdgeDeskDiagram } from '../diagrams/EdgeDeskDiagram';
import { CrowdDiagram } from '../diagrams/CrowdDiagram';

export const Architecture: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'edgedesk' | 'crowd'>('edgedesk');

  return (
    <div className="architecture-module-container">
      <div className="os-module-header">
        <div className="os-module-title-group">
          <h2>08 // SYSTEM TOPOLOGY</h2>
          <p>INTERACTIVE ARCHITECTURE SCHEMATICS & DATA FLOW</p>
        </div>
        <div className="os-module-actions">
          <button
            className={`os-btn ${activeTab === 'edgedesk' ? 'os-btn-primary' : 'os-btn-subtle'}`}
            onClick={() => setActiveTab('edgedesk')}
          >
            EDGEDESK TOPOLOGY
          </button>
          <button
            className={`os-btn ${activeTab === 'crowd' ? 'os-btn-primary' : 'os-btn-subtle'}`}
            onClick={() => setActiveTab('crowd')}
          >
            CROWD ANALYTICS PIPELINE
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Click any block node in the interactive topology below to inspect its data flow role, protocol layer, and hardware allocation.
        </p>
      </div>

      {activeTab === 'edgedesk' ? <EdgeDeskDiagram /> : <CrowdDiagram />}
    </div>
  );
};
