import React, { useState } from 'react';
import { Project } from '../../content/types';
import { EdgeDeskDiagram } from '../diagrams/EdgeDeskDiagram';
import { CrowdDiagram } from '../diagrams/CrowdDiagram';
import { LoRaDiagram } from '../diagrams/LoRaDiagram';
import { sound } from '../../lib/sound';

interface ProjectDossierProps {
  project: Project;
  onBack: () => void;
}

export const ProjectDossier: React.FC<ProjectDossierProps> = ({ project, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture' | 'features' | 'hardware'>('overview');

  return (
    <div className="project-dossier" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
      <button
        className="os-btn os-btn-subtle dossier-back-btn"
        onClick={() => {
          sound.playUiClick();
          onBack();
        }}
        style={{ width: 'fit-content' }}
      >
        ← BACK TO PROJECTS OVERVIEW
      </button>

      {/* Header bar */}
      <div className="os-module-header" style={{ marginBottom: 0 }}>
        <div className="os-module-title-group">
          <h2>{project.title}</h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                backgroundColor: 'rgba(232, 162, 58, 0.15)',
                border: '1px solid #e8a23a',
                color: '#e8a23a',
                padding: '0.15rem 0.55rem',
                borderRadius: '2px',
                fontWeight: 700,
              }}
            >
              {project.badge}
            </span>
            {project.category && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  backgroundColor: 'rgba(0, 229, 255, 0.12)',
                  border: '1px solid rgba(0, 229, 255, 0.3)',
                  color: '#00e5ff',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '2px',
                }}
              >
                {project.category}
              </span>
            )}
          </div>
        </div>
        <div className="os-module-actions">
          <a
            href="https://github.com/jainnishant779"
            target="_blank"
            rel="noopener noreferrer"
            className="os-btn os-btn-primary"
            style={{ textDecoration: 'none', backgroundColor: '#e8a23a', color: '#070a0e', fontWeight: 700 }}
          >
            VIEW CODE (GITHUB) ↗
          </a>
        </div>
      </div>

      {/* Sub-navigation tabs matching Reference Image 1 Panel 6 */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid #1e293b',
          paddingBottom: '0.65rem',
          flexWrap: 'wrap',
        }}
      >
        {(['overview', 'architecture', 'features', 'hardware'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                sound.playUiClick();
                setActiveTab(tab);
              }}
              style={{
                padding: '0.35rem 0.85rem',
                backgroundColor: isActive ? '#e8a23a' : 'rgba(15, 23, 42, 0.7)',
                color: isActive ? '#070a0e' : '#94a3b8',
                border: `1px solid ${isActive ? '#e8a23a' : '#334155'}`,
                borderRadius: '3px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {project.image ? (
            <div className="dossier-banner" style={{ background: 'rgba(14, 20, 28, 0.85)', border: '1px solid #1e293b', borderRadius: '6px', padding: '1.25rem' }}>
              <div>
                <img
                  src={project.image}
                  alt={project.title}
                  className="dossier-banner-img"
                  style={{ borderRadius: '4px', maxHeight: '220px', width: 'auto', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                {project.imageCaption && (
                  <div className="artwork-caption">{project.imageCaption}</div>
                )}
              </div>
              <div className="dossier-banner-info">
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent)', fontSize: '1.2rem', margin: 0 }}>
                  System Architecture & Stack
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.75rem' }}>
                  <div>
                    <span className="meta-label" style={{ display: 'block', marginBottom: '0.35rem' }}>
                      TECHNOLOGY STACK:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {project.stack.map((t) => (
                        <span key={t} className="tag-pill">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: '0.5rem' }}>
                    <span className="meta-label" style={{ display: 'block', marginBottom: '0.25rem' }}>
                      DEPLOYMENT STATUS:
                    </span>
                    <span className="meta-value" style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>
                      {project.badge}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="dossier-section">
              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent)' }}>
                Technology Stack & Scope
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {project.stack.map((t) => (
                  <span key={t} className="tag-pill" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="dossier-section" style={{ background: 'rgba(14, 20, 28, 0.85)', border: '1px solid #1e293b', borderRadius: '6px', padding: '1.25rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: '#f8fafc', fontSize: '1.2rem', marginBottom: '0.75rem' }}>
              Engineering Overview
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {project.description.map((desc, idx) => (
                <p key={idx} className="dossier-text" style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                  {desc}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'architecture' && (
        <div className="dossier-section" style={{ background: 'rgba(14, 20, 28, 0.85)', border: '1px solid #1e293b', borderRadius: '6px', padding: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: '#f8fafc', fontSize: '1.2rem', marginBottom: '0.4rem' }}>
            Interactive System Topology
          </h3>
          <p className="dossier-text" style={{ marginBottom: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
            Click any block node to inspect its protocol layer, data flow role, and hardware allocation.
          </p>

          {project.slug === 'edgedesk' && <EdgeDeskDiagram />}
          {project.slug === 'crowd-analytics' && <CrowdDiagram />}
          {project.slug === 'lora-traffic-mesh' && <LoRaDiagram />}
          {project.slug !== 'edgedesk' && project.slug !== 'crowd-analytics' && project.slug !== 'lora-traffic-mesh' && (
            <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'var(--font-mono)', color: '#00e5ff', background: '#090d14', border: '1px solid #1e293b', borderRadius: '4px' }}>
              [ PIPELINE TOPOLOGY: DATA INGESTION → MODEL INFERENCE → TELEMETRY / ACTION ENGINE ]
            </div>
          )}
        </div>
      )}

      {activeTab === 'features' && (
        <div className="dossier-section" style={{ background: 'rgba(14, 20, 28, 0.85)', border: '1px solid #1e293b', borderRadius: '6px', padding: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: '#f8fafc', fontSize: '1.2rem', marginBottom: '0.85rem' }}>
            Key Features & System Specifications
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: '#cbd5e1' }}>
              <span style={{ color: '#34d399', fontWeight: 700 }}>✓</span>
              <span>Encrypted Low-Latency Screen & Data Transport</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: '#cbd5e1' }}>
              <span style={{ color: '#34d399', fontWeight: 700 }}>✓</span>
              <span>Reboot-Safe Linux Systemd Watchdog Daemons</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: '#cbd5e1' }}>
              <span style={{ color: '#34d399', fontWeight: 700 }}>✓</span>
              <span>Zero-Trust Token-Based Authentication & Session Management</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: '#cbd5e1' }}>
              <span style={{ color: '#34d399', fontWeight: 700 }}>✓</span>
              <span>Hardware-Accelerated Edge Inference (NVIDIA Jetson / CUDA)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: '#cbd5e1' }}>
              <span style={{ color: '#34d399', fontWeight: 700 }}>✓</span>
              <span>Deterministic Sub-50ms Frame Latency Benchmarks</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'hardware' && (
        <div className="dossier-section" style={{ background: 'rgba(14, 20, 28, 0.85)', border: '1px solid #1e293b', borderRadius: '6px', padding: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: '#f8fafc', fontSize: '1.2rem', marginBottom: '0.85rem' }}>
            Target Compute Hardware Architecture
          </h3>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ width: '180px', height: '140px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #334155', flexShrink: 0, background: '#090d14' }}>
              <img
                src="/nightfall/images/projects/jetson_hardware.jpg"
                alt="NVIDIA Jetson Hardware"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '240px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>COMPUTE PLATFORM:</span>
                <span style={{ color: '#00e5ff' }}>NVIDIA Jetson Nano / Orin</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>ACCELERATION:</span>
                <span style={{ color: '#34d399' }}>CUDA Core Architecture</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>OS RUNTIME:</span>
                <span style={{ color: '#e2e8f0' }}>Ubuntu Linux for Tegra (L4T)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>SERVICE MANAGER:</span>
                <span style={{ color: '#e8a23a' }}>Systemd Persistent Daemon</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
