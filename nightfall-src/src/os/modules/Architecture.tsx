import React, { useState } from 'react';
import { EdgeDeskDiagram } from '../diagrams/EdgeDeskDiagram';
import { CrowdDiagram } from '../diagrams/CrowdDiagram';
import { LoRaDiagram } from '../diagrams/LoRaDiagram';
import { PoultryHealthDiagram } from '../diagrams/PoultryHealthDiagram';
import { FacialAttendanceDiagram } from '../diagrams/FacialAttendanceDiagram';
import { OnDeviceAiDiagram } from '../diagrams/OnDeviceAiDiagram';
import { sound } from '../../lib/sound';

export const Architecture: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'edgedesk' | 'crowd' | 'poultry' | 'facial' | 'ondevice' | 'lora'>('edgedesk');

  return (
    <div className="architecture-module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
      <div className="os-module-header">
        <div className="os-module-title-group">
          <h2>08 // SYSTEMS LAB & TOPOLOGY</h2>
          <p>TECHNICAL ARCHITECTURE, RELAY BROKERS & EDGE SCHEMATICS</p>
        </div>
        <div className="os-module-actions">
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: '#34d399',
              backgroundColor: 'rgba(52, 211, 153, 0.12)',
              border: '1px solid #34d399',
              padding: '0.2rem 0.6rem',
              borderRadius: '2px',
            }}
          >
            ● ALL SCHEMATICS ONLINE
          </span>
        </div>
      </div>

      {/* Sub-system Tabs Matching Reference Image 1 Panel 7 */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.65rem', flexWrap: 'wrap' }}>
        {[
          { id: 'edgedesk', label: 'EdgeDesk' },
          { id: 'crowd', label: 'Crowd Analytics' },
          { id: 'poultry', label: 'Poultry AI' },
          { id: 'facial', label: 'Facial Attendance' },
          { id: 'ondevice', label: 'On-Device AI' },
          { id: 'lora', label: 'LoRa Mesh' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`os-btn ${isActive ? 'os-btn-primary' : 'os-btn-subtle'}`}
              onClick={() => {
                sound.playUiClick();
                setActiveTab(tab.id as any);
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
          Interactive schematic for system pipelines. Select any block node below to inspect its data flow, encryption protocols, and edge compute allocation.
        </p>
      </div>

      {/* Interactive Architecture Canvas */}
      <div style={{ background: 'rgba(14, 20, 28, 0.85)', border: '1px solid #1e293b', borderRadius: '6px', padding: '1.25rem' }}>
        {activeTab === 'edgedesk' && <EdgeDeskDiagram />}
        {activeTab === 'crowd' && <CrowdDiagram />}
        {activeTab === 'lora' && <LoRaDiagram />}
        {activeTab === 'poultry' && <PoultryHealthDiagram />}
        {activeTab === 'facial' && <FacialAttendanceDiagram />}
        {activeTab === 'ondevice' && <OnDeviceAiDiagram />}
      </div>

      {/* Bottom Service Layer Bar Matching Reference Image 1 Panel 7 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.65rem',
          marginTop: '0.5rem',
        }}
      >
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #1e293b', padding: '0.65rem 0.85rem', borderRadius: '4px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#00e5ff', fontWeight: 700 }}>
            Authentication
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#64748b', marginTop: '0.2rem' }}>
            Token-Based Auth & ACL
          </div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #1e293b', padding: '0.65rem 0.85rem', borderRadius: '4px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#e8a23a', fontWeight: 700 }}>
            Encrypted Transport
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#64748b', marginTop: '0.2rem' }}>
            TLS 1.3 & WSS Tunnels
          </div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #1e293b', padding: '0.65rem 0.85rem', borderRadius: '4px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#34d399', fontWeight: 700 }}>
            Screen & File I/O
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#64748b', marginTop: '0.2rem' }}>
            Encrypted VNC & Chunks
          </div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #1e293b', padding: '0.65rem 0.85rem', borderRadius: '4px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#00e5ff', fontWeight: 700 }}>
            Device Management
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#64748b', marginTop: '0.2rem' }}>
            Fleet Telemetry & Status
          </div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #1e293b', padding: '0.65rem 0.85rem', borderRadius: '4px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#e8a23a', fontWeight: 700 }}>
            Reboot-Safe
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#64748b', marginTop: '0.2rem' }}>
            Systemd Watchdogs
          </div>
        </div>
      </div>
    </div>
  );
};
