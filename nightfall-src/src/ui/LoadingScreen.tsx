import React from 'react';
import { useProgress } from '@react-three/drei';

export const LoadingScreen: React.FC = () => {
  const { progress, active, loaded, total } = useProgress();

  // Only display loading screen when assets are actively downloading
  if (!active || total === 0 || progress >= 100) return null;

  return (
    <div
      className="loading-screen"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#07080a',
        zIndex: 90,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#e6e2d8',
        fontFamily: "'JetBrains Mono', monospace",
        userSelect: 'none',
      }}
    >
      <div
        style={{
          fontSize: '0.85rem',
          color: '#e8a23a',
          letterSpacing: '0.1em',
          marginBottom: '1.2rem',
          fontWeight: 600,
        }}
      >
        NJ-OS // INITIALIZING 3D CAVERN ENVIRONMENT...
      </div>

      {/* Amber progress track line */}
      <div
        style={{
          width: '280px',
          height: '3px',
          background: 'rgba(30, 34, 40, 0.85)',
          position: 'relative',
          borderRadius: '2px',
          overflow: 'hidden',
          marginBottom: '0.8rem',
        }}
      >
        <div
          style={{
            width: `${Math.round(progress)}%`,
            height: '100%',
            background: '#e8a23a',
            boxShadow: '0 0 12px rgba(232, 162, 58, 0.6)',
            transition: 'width 0.2s ease-out',
          }}
        />
      </div>

      <div style={{ fontSize: '0.75rem', color: '#9e9a8e' }}>
        {Math.round(progress)}% {total > 0 && `[${loaded}/${total}]`}
      </div>
    </div>
  );
};
