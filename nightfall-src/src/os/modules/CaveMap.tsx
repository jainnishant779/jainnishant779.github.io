import React from 'react';
import { sound } from '../../lib/sound';

interface CaveMapProps {
  onReturnToCave?: () => void;
}

export const CaveMap: React.FC<CaveMapProps> = ({ onReturnToCave }) => {
  return (
    <div className="cave-map-module" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="os-module-header">
        <div className="os-module-title-group">
          <h2>09 // CAVE MAP</h2>
          <p>THE FICTIONAL FACILITY THIS PORTFOLIO LIVES IN</p>
        </div>
        {onReturnToCave && (
          <div className="os-module-actions">
            <button
              type="button"
              className="os-btn os-btn-primary"
              onClick={() => {
                sound.playUiClick();
                onReturnToCave();
              }}
            >
              RETURN TO THE CAVE ↵
            </button>
          </div>
        )}
      </div>

      {/* Blueprint Visual */}
      <div
        style={{
          position: 'relative',
          borderRadius: '6px',
          overflow: 'hidden',
          border: '1px solid rgba(0, 229, 255, 0.35)',
          background: '#070a0e',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7), inset 0 0 50px rgba(0, 229, 255, 0.05)',
        }}
      >
        <img
          src="/nightfall/images/profile/cave_map.jpg"
          alt="Illustrative map of the cave"
          style={{ width: '100%', height: 'auto', display: 'block', opacity: 0.88 }}
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Scanlines overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'repeating-linear-gradient(0deg, rgba(0, 229, 255, 0.04) 0px, rgba(0, 229, 255, 0.04) 1px, transparent 1px, transparent 3px)',
          }}
        />
      </div>

      {/* Sector Descriptions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #1e293b', borderRadius: '4px', padding: '1rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#e8a23a', fontWeight: 700 }}>
            SECTOR 01 // VAULT BLAST GATE
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.4rem', lineHeight: 1.5 }}>
            The sealed entrance in the mountain rock. Scroll to open it and walk in.
          </p>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #1e293b', borderRadius: '4px', padding: '1rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#00e5ff', fontWeight: 700 }}>
            SECTOR 02 // CAVERN & WATERFALL
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.4rem', lineHeight: 1.5 }}>
            Steel catwalks across the cavern, with a waterfall on the east wall.
          </p>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #1e293b', borderRadius: '4px', padding: '1rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#00e5ff', fontWeight: 700 }}>
            SECTOR 03 // COMMAND WORKSTATION
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.4rem', lineHeight: 1.5 }}>
            The raised platform with the multi-display console that runs NJ-OS — this interactive portfolio.
          </p>
        </div>
      </div>
    </div>
  );
};
