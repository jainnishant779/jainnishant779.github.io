import React from 'react';
import { sound } from '../../lib/sound';

interface CaveMapProps {
  onReturnToCave?: () => void;
  onOpenSuitChamber?: () => void;
}

export const CaveMap: React.FC<CaveMapProps> = ({ onReturnToCave, onOpenSuitChamber }) => {
  return (
    <div className="cave-map-module" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="os-module-header">
        <div className="os-module-title-group">
          <h2>09 // CAVE TACTICAL MAP</h2>
          <p>FACILITY GEOMETRY, SECTORS & PLATFORMS</p>
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
              RETURN TO 3D EXPLORATION ↵
            </button>
          </div>
        )}
      </div>

      {/* Blueprint Visual & Sector Hotspots */}
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
          alt="Cave Holographic Tactical Map"
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
            Heavy steel sliding vault door set into exterior mountain basalt. Hydraulic locking pins, amber sodium light bars, and status telemetry feed.
          </p>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #1e293b', borderRadius: '4px', padding: '1rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#00e5ff', fontWeight: 700 }}>
            SECTOR 02 // SUBTERRANEAN WATERFALL
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.4rem', lineHeight: 1.5 }}>
            Natural cascading subterranean cataract along the East cliff face. Industrial drainage conduits and moisture exhaust ventilation.
          </p>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #1e293b', borderRadius: '4px', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#34d399', fontWeight: 700 }}>
              SECTOR 03 // SUIT DISPLAY CHAMBER
            </div>
            {onOpenSuitChamber && (
              <button
                type="button"
                onClick={onOpenSuitChamber}
                style={{
                  fontSize: '0.66rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#34d399',
                  background: 'rgba(52, 211, 153, 0.15)',
                  border: '1px solid #34d399',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '2px',
                  cursor: 'pointer',
                }}
              >
                INSPECT 3D ↗
              </button>
            )}
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.4rem', lineHeight: 1.5 }}>
            Isolated West alcove housing the Warden Exoskeleton MK-IV inside a reinforced glass cylinder plinth with 360° orbit inspection.
          </p>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #1e293b', borderRadius: '4px', padding: '1rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#00e5ff', fontWeight: 700 }}>
            SECTOR 04 // COMMAND WORKSTATION
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.4rem', lineHeight: 1.5 }}>
            Elevated steel platform housing the multi-display console. Live telemetry, GPU inference pipelines, edge device remote management, and full NJ-OS.
          </p>
        </div>
      </div>
    </div>
  );
};
