import React, { useState } from 'react';
import { EdgeDeskDiagram } from '../diagrams/EdgeDeskDiagram';
import { CrowdDiagram } from '../diagrams/CrowdDiagram';
import { PoultryHealthDiagram } from '../diagrams/PoultryHealthDiagram';
import { FacialAttendanceDiagram } from '../diagrams/FacialAttendanceDiagram';
import { OnDeviceAiDiagram } from '../diagrams/OnDeviceAiDiagram';
import { sound } from '../../lib/sound';

type ArchTab = 'edgedesk' | 'crowd' | 'poultry' | 'facial' | 'ondevice';

const TABS: { id: ArchTab; label: string }[] = [
  { id: 'edgedesk', label: 'EdgeDesk' },
  { id: 'crowd', label: 'Crowd Analytics' },
  { id: 'poultry', label: 'Poultry AI' },
  { id: 'facial', label: 'Facial Attendance' },
  { id: 'ondevice', label: 'On-Device AI' },
];

// EdgeDesk facts straight from the CV (no extra protocol or auth claims).
const EDGEDESK_FACTS: { title: string; value: string; color: string }[] = [
  { title: 'Encrypted Transport', value: 'TLS / WSS', color: '#e8a23a' },
  { title: 'Screen Access', value: 'VNC', color: '#00e5ff' },
  { title: 'File Transfer', value: 'Encrypted · drag-and-drop', color: '#34d399' },
  { title: 'Reboot-Safe', value: 'Linux services', color: '#e8a23a' },
];

export const Architecture: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ArchTab>('edgedesk');

  return (
    <div className="architecture-module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
      <div className="os-module-header">
        <div className="os-module-title-group">
          <h2>08 // SYSTEMS LAB & TOPOLOGY</h2>
          <p>SIMPLIFIED ARCHITECTURE DIAGRAMS</p>
        </div>
        <div className="os-module-actions">
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: '#94a3b8',
              border: '1px solid #334155',
              padding: '0.2rem 0.6rem',
              borderRadius: '2px',
            }}
          >
            BASED ON CV DESCRIPTIONS
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.65rem', flexWrap: 'wrap' }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`os-btn ${isActive ? 'os-btn-primary' : 'os-btn-subtle'}`}
              onClick={() => {
                sound.playUiClick();
                setActiveTab(tab.id);
              }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.76rem',
                fontWeight: 700,
                backgroundColor: isActive ? '#e8a23a' : 'rgba(15, 23, 42, 0.7)',
                color: isActive ? '#070a0e' : '#94a3b8',
                borderColor: isActive ? '#e8a23a' : '#334155',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div style={{ marginBottom: '0.25rem' }}>
        <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5 }}>
          Simplified diagrams built from each project&apos;s description. Select any block to read what it does.
        </p>
      </div>

      <div style={{ background: 'rgba(14, 20, 28, 0.85)', border: '1px solid #1e293b', borderRadius: '6px', padding: '1.25rem' }}>
        {activeTab === 'edgedesk' && <EdgeDeskDiagram />}
        {activeTab === 'crowd' && <CrowdDiagram />}
        {activeTab === 'poultry' && <PoultryHealthDiagram />}
        {activeTab === 'facial' && <FacialAttendanceDiagram />}
        {activeTab === 'ondevice' && <OnDeviceAiDiagram />}
      </div>

      {activeTab === 'edgedesk' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.65rem',
            marginTop: '0.5rem',
          }}
        >
          {EDGEDESK_FACTS.map((fact) => (
            <div
              key={fact.title}
              style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #1e293b', padding: '0.65rem 0.85rem', borderRadius: '4px', textAlign: 'center' }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: fact.color, fontWeight: 700 }}>
                {fact.title}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                {fact.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
