import React from 'react';
import { certifications } from '../../content/achievements';

export const Achievements: React.FC = () => {
  return (
    <div className="achievements-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <div className="os-module-header">
        <div className="os-module-title-group">
          <h2>05 // HONORS & CREDENTIALS</h2>
          <p>COMPETITIVE RECOGNITIONS, PATENTS & ACCREDITATIONS</p>
        </div>
      </div>

      {/* 3 Top Milestone Hero Cards Matching Reference Image 1 Panel 10 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(14, 20, 28, 0.95) 0%, rgba(9, 13, 18, 0.98) 100%)',
            border: '1px solid rgba(232, 162, 58, 0.35)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 0 30px rgba(232, 162, 58, 0.05)',
            borderRadius: '6px',
            padding: '1.5rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🏆</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: '#f8fafc', fontWeight: 700 }}>
            Winner
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.86rem', color: '#e8a23a', fontWeight: 700, marginTop: '0.2rem' }}>
            Sustainathon 2025
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            NATRAX Automotive Testing Center
          </div>
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, rgba(14, 20, 28, 0.95) 0%, rgba(9, 13, 18, 0.98) 100%)',
            border: '1px solid rgba(0, 229, 255, 0.35)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 0 30px rgba(0, 229, 255, 0.05)',
            borderRadius: '6px',
            padding: '1.5rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🏅</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: '#f8fafc', fontWeight: 700 }}>
            Top Finalist
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.86rem', color: '#00e5ff', fontWeight: 700, marginTop: '0.2rem' }}>
            MPSEDC Mahakumbh 2025
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            Among 200+ Competitive Engineering Teams
          </div>
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, rgba(14, 20, 28, 0.95) 0%, rgba(9, 13, 18, 0.98) 100%)',
            border: '1px solid rgba(52, 211, 153, 0.35)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 0 30px rgba(52, 211, 153, 0.05)',
            borderRadius: '6px',
            padding: '1.5rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>📜</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: '#f8fafc', fontWeight: 700 }}>
            Patent Filed
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.86rem', color: '#34d399', fontWeight: 700, marginTop: '0.2rem' }}>
            EdgeDesk Multi-Device Platform
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            Multi-Device Edge Architecture (Application Filed)
          </div>
        </div>
      </div>

      {/* Grid of Verified Certifications & Engineering Highlights */}
      <div className="achievements-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        <div className="achievement-panel" style={{ background: 'rgba(14, 20, 28, 0.85)', border: '1px solid #1e293b', borderRadius: '6px', padding: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: '#e8a23a', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
            Verified Industry Certifications
          </h3>
          <ul className="achievements-list">
            {certifications.map((item, idx) => (
              <li key={idx} className="achievement-item">
                <span className="achievement-title">{item.title}</span>
                <span className="achievement-detail">ISSUING BODY: {item.issuer}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="achievement-panel" style={{ background: 'rgba(14, 20, 28, 0.85)', border: '1px solid #1e293b', borderRadius: '6px', padding: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: '#00e5ff', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
            Engineering Highlights & Milestones
          </h3>
          <ul className="achievements-list">
            <li className="achievement-item">
              <span className="achievement-title">Edge AI Client Delivery</span>
              <span className="achievement-detail">Owned complete pipeline from data annotation to NVIDIA Jetson hardware deployment.</span>
            </li>
            <li className="achievement-item">
              <span className="achievement-title">Production Computer Vision</span>
              <span className="achievement-detail">Benchmarked YOLO models with precision/recall KPIs and deployed Nginx/Systemd services.</span>
            </li>
            <li className="achievement-item">
              <span className="achievement-title">On-Device Local Inference R&D</span>
              <span className="achievement-detail">Zero-cloud offline Whisper speech recognition & 4-bit local LLM inference on edge devices.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
