import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../state/store';
import { getActiveHint } from '../world/cameraPath';
import { getCVUrl } from '../lib/assets';
import { SkipButton } from './SkipButton';

interface HudOverlayProps {
  onOpenOS: () => void;
  onSkipIntro: () => void;
}

export const HudOverlay: React.FC<HudOverlayProps> = ({ onOpenOS, onSkipIntro }) => {
  const progress = useStore((state) => state.progress);
  const activeHint = getActiveHint(progress);
  const cvUrl = getCVUrl();

  const isNearComputer = progress >= 0.85;
  const isNearSuit = progress >= 0.65 && progress <= 0.76;

  return (
    <div
      className="hud-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem',
        boxSizing: 'border-box',
        userSelect: 'none',
      }}
    >
      {/* Top HUD Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'auto',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#e6e2d8',
              letterSpacing: '0.05em',
            }}
          >
            THE ENGINEER'S CAVE
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.7rem',
              color: '#e8a23a',
            }}
          >
            NISHANT JAIN // AI/ML · EDGE AI · COMPUTER VISION
          </div>
        </div>

        {/* Permanent Quick Navigation Shortcuts */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={onOpenOS}
            style={{
              background: 'rgba(232, 162, 58, 0.15)',
              border: '1px solid #e8a23a',
              color: '#e8a23a',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.78rem',
              padding: '0.4rem 0.85rem',
              borderRadius: '3px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            LAUNCH NJ-OS →
          </button>

          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'rgba(14, 17, 20, 0.85)',
              border: '1px solid #2a3038',
              color: '#e6e2d8',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.78rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '3px',
              textDecoration: 'none',
            }}
          >
            CV ↗
          </a>

          <Link
            to="/contact"
            style={{
              background: 'rgba(14, 17, 20, 0.85)',
              border: '1px solid #2a3038',
              color: '#9e9a8e',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.78rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '3px',
              textDecoration: 'none',
            }}
          >
            CONTACT
          </Link>
        </div>
      </div>

      {/* Center Dynamic Interaction Prompt */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: isNearComputer || isNearSuit ? 'auto' : 'none',
        }}
      >
        {isNearComputer && (
          <button
            onClick={onOpenOS}
            style={{
              background: 'rgba(7, 8, 10, 0.92)',
              border: '2px solid #e8a23a',
              color: '#e8a23a',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '1rem',
              fontWeight: 700,
              padding: '0.85rem 2rem',
              borderRadius: '4px',
              cursor: 'pointer',
              boxShadow: '0 0 25px rgba(232, 162, 58, 0.35)',
              animation: 'pulse 2s infinite',
            }}
          >
            [E] ACCESS COMPUTER WORKSTATION →
          </button>
        )}

        {isNearSuit && (
          <div
            style={{
              background: 'rgba(7, 8, 10, 0.88)',
              border: '1px solid #7fb38a',
              color: '#7fb38a',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.85rem',
              padding: '0.55rem 1.25rem',
              borderRadius: '3px',
            }}
          >
            INSPECTING TACTICAL ARMOR POD
          </div>
        )}
      </div>

      {/* Bottom HUD Bar & Progress */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.72rem',
            color: '#9e9a8e',
          }}
        >
          <span>{activeHint}</span>
          <span style={{ color: '#e8a23a' }}>{Math.round(progress * 100)}% FACILITY DEPTH</span>
        </div>

        {/* Thin amber progress line */}
        <div
          style={{
            width: '100%',
            height: '2px',
            background: 'rgba(30, 34, 40, 0.8)',
            position: 'relative',
            borderRadius: '1px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${Math.round(progress * 100)}%`,
              height: '100%',
              background: '#e8a23a',
              transition: 'width 0.1s linear',
            }}
          />
        </div>
      </div>

      {/* Skip button for intro phase */}
      {progress < 0.4 && <SkipButton onSkip={onSkipIntro} />}
    </div>
  );
};
