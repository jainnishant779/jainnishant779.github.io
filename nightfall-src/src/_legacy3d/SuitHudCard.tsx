import React from 'react';
import { useStore } from '../state/store';

export const SuitHudCard: React.FC = () => {
  const setMode = useStore((state) => state.setMode);
  const previousMode = useStore((state) => state.previousMode);

  const handleExit = () => {
    setMode(previousMode || 'guided');
  };

  return (
    <div
      className="suit-hud-card"
      style={{
        position: 'fixed',
        top: '5.5rem',
        right: '1.5rem',
        maxWidth: '380px',
        width: 'calc(100vw - 3rem)',
        background: 'rgba(7, 10, 14, 0.92)',
        border: '1px solid rgba(127, 179, 138, 0.5)',
        borderRadius: '6px',
        padding: '1.25rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7), 0 0 20px rgba(127, 179, 138, 0.2)',
        fontFamily: "'JetBrains Mono', monospace",
        color: '#e6e2d8',
        zIndex: 50,
        pointerEvents: 'auto',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.85rem',
          borderBottom: '1px solid rgba(127, 179, 138, 0.3)',
          paddingBottom: '0.5rem',
        }}
      >
        <div>
          <div style={{ fontSize: '0.78rem', color: '#7fb38a', fontWeight: 700 }}>
            // TACTICAL SPECIFICATION
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#e6e2d8' }}>
            WARDEN EXOSKELETON MK-IV
          </div>
        </div>
        <div
          style={{
            fontSize: '0.7rem',
            background: 'rgba(127, 179, 138, 0.15)',
            border: '1px solid #7fb38a',
            color: '#7fb38a',
            padding: '0.2rem 0.5rem',
            borderRadius: '2px',
          }}
        >
          EDGE READY
        </div>
      </div>

      {/* Specification rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.74rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#9e9a8e' }}>CHASSIS:</span>
          <span style={{ color: '#e6e2d8', textAlign: 'right' }}>Titanium-Carbon Fiber</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#9e9a8e' }}>COMPUTE:</span>
          <span style={{ color: '#7fb38a', textAlign: 'right' }}>NVIDIA Jetson Core (CUDA)</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#9e9a8e' }}>POWER:</span>
          <span style={{ color: '#e6e2d8', textAlign: 'right' }}>48V Li-Ion + Supercap</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#9e9a8e' }}>SENSORS:</span>
          <span style={{ color: '#e6e2d8', textAlign: 'right' }}>Stereo Vision · Thermal IR</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#9e9a8e' }}>AI PIPELINE:</span>
          <span style={{ color: '#e8a23a', textAlign: 'right' }}>YOLO Real-Time Detection</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#9e9a8e' }}>TELEMETRY:</span>
          <span style={{ color: '#e6e2d8', textAlign: 'right' }}>LoRa Mesh (Sub-GHz) + TLS</span>
        </div>
      </div>

      {/* Orbit controls instruction */}
      <div
        style={{
          marginTop: '0.85rem',
          padding: '0.4rem',
          background: 'rgba(14, 18, 22, 0.7)',
          borderRadius: '3px',
          fontSize: '0.68rem',
          color: '#9e9a8e',
          textAlign: 'center',
          border: '1px dashed rgba(127, 179, 138, 0.3)',
        }}
      >
        CLICK & DRAG TO ORBIT · SCROLL TO ZOOM
      </div>

      {/* Exit Button */}
      <button
        onClick={handleExit}
        className="exit-suit-inspect-btn"
        style={{
          marginTop: '0.85rem',
          width: '100%',
          padding: '0.55rem',
          background: 'rgba(127, 179, 138, 0.2)',
          border: '1px solid #7fb38a',
          color: '#7fb38a',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.78rem',
          fontWeight: 700,
          borderRadius: '3px',
          cursor: 'pointer',
          textAlign: 'center',
          transition: 'all 0.2s ease',
        }}
      >
        EXIT INSPECTION [ESC] ✕
      </button>
    </div>
  );
};
