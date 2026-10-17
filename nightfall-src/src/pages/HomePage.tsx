import React from 'react';
import { Link } from 'react-router-dom';
import { getCVUrl } from '../lib/assets';

export const HomePage: React.FC = () => {
  const cvUrl = getCVUrl();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 30%, #0e1217 0%, #07080a 75%)',
        color: '#e6e2d8',
        padding: '2rem',
        textAlign: 'center',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* Facility Header */}
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.8rem',
          letterSpacing: '0.15em',
          color: '#e8a23a',
          marginBottom: '1rem',
          textTransform: 'uppercase',
          border: '1px solid rgba(232, 162, 58, 0.3)',
          padding: '0.35rem 0.85rem',
          borderRadius: '2px',
          background: 'rgba(232, 162, 58, 0.05)',
        }}
      >
        THE ENGINEER'S CAVE // PHASE 1 INITIALIZATION
      </div>

      <h1
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 700,
          color: '#e6e2d8',
          letterSpacing: '-0.02em',
          marginBottom: '0.75rem',
        }}
      >
        NISHANT JAIN
      </h1>

      <p
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 'clamp(0.85rem, 2vw, 1.05rem)',
          color: '#7fb38a',
          marginBottom: '1.5rem',
          maxWidth: '680px',
        }}
      >
        AI/ML Engineer · Computer Vision · Edge AI · IoT
      </p>

      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.95rem',
          color: '#9e9a8e',
          maxWidth: '560px',
          lineHeight: '1.65',
          marginBottom: '2.5rem',
        }}
      >
        Production-grade Computer Vision and Edge AI systems on NVIDIA Jetson,
        custom WebSockets, and AWS. Fully interactive NJ-OS command interface is online.
      </p>

      {/* Main Action CTAs */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '3rem',
        }}
      >
        <Link
          to="/os"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.85rem 1.75rem',
            background: '#e8a23a',
            color: '#07080a',
            borderRadius: '3px',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            fontSize: '0.9rem',
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(232, 162, 58, 0.25)',
          }}
        >
          ENTER NJ-OS COMMAND CENTER →
        </Link>

        <a
          href={cvUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.85rem 1.5rem',
            background: '#12161c',
            border: '1px solid rgba(232, 162, 58, 0.4)',
            color: '#e8a23a',
            borderRadius: '3px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.9rem',
            textDecoration: 'none',
          }}
        >
          VIEW CV (PDF) ↗
        </a>
      </div>

      {/* Quick Navigation Links */}
      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.78rem',
          borderTop: '1px solid #1e2228',
          paddingTop: '1.5rem',
          maxWidth: '600px',
          width: '100%',
        }}
      >
        <Link to="/about" style={{ color: '#9e9a8e' }}>
          01 // ABOUT
        </Link>
        <Link to="/projects" style={{ color: '#9e9a8e' }}>
          02 // PROJECTS
        </Link>
        <Link to="/experience" style={{ color: '#9e9a8e' }}>
          03 // EXPERIENCE
        </Link>
        <Link to="/skills" style={{ color: '#9e9a8e' }}>
          04 // SKILLS
        </Link>
        <Link to="/contact" style={{ color: '#9e9a8e' }}>
          07 // CONTACT
        </Link>
      </div>

      {/* 3D Experience Notice */}
      <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.7rem',
          color: '#6b675d',
        }}
      >
        [ 3D CAVE ENGINE COMING IN PHASE 2 ]
      </div>
    </div>
  );
};
