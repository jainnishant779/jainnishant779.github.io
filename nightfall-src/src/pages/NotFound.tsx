import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#07080a',
        color: '#e6e2d8',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          color: '#e8a23a',
          fontSize: '0.9rem',
          letterSpacing: '0.1em',
          marginBottom: '0.5rem',
        }}
      >
        // 404 PROTOCOL ERROR
      </div>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#e6e2d8' }}>
        SECTOR UNMAPPED
      </h1>
      <p
        style={{
          maxWidth: '460px',
          color: '#9e9a8e',
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.95rem',
          marginBottom: '2rem',
          lineHeight: '1.6',
        }}
      >
        The requested coordinate does not exist within the Engineer's Cave installation.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link
          to="/"
          style={{
            padding: '0.65rem 1.25rem',
            background: '#e8a23a',
            color: '#07080a',
            borderRadius: '3px',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
            fontSize: '0.85rem',
          }}
        >
          ENTER 3D CAVE
        </Link>
        <Link
          to="/os"
          style={{
            padding: '0.65rem 1.25rem',
            background: '#151a1f',
            border: '1px solid #1e2228',
            color: '#e8a23a',
            borderRadius: '3px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.85rem',
          }}
        >
          LAUNCH NJ-OS
        </Link>
      </div>
    </div>
  );
};
