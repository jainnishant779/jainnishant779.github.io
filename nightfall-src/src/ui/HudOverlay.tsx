import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../state/store';
import { getCVUrl } from '../lib/assets';
import { sound } from '../lib/sound';
import { SkipButton } from './SkipButton';

interface HudOverlayProps {
  onOpenOS: () => void;
  onSkipIntro: () => void;
  onAccessFacility: () => void;
}

function getFilmHint(progress: number): string {
  if (progress < 0.15) return 'VAULT BLAST GATE // SEALED — SCROLL TO OPEN';
  if (progress < 0.35) return 'TRANSIT CORRIDOR // HYDRAULIC LOCKS DISENGAGED';
  if (progress < 0.65) return 'SUBTERRANEAN CAVERN // CATWALK PASSAGE & WATERFALL';
  if (progress < 0.88) return 'APPROACHING COMMAND WORKSTATION PLATFORM';
  return 'WORKSTATION PRIMARY TERMINAL // STANDBY READY';
}

export const HudOverlay: React.FC<HudOverlayProps> = ({
  onOpenOS,
  onSkipIntro,
  onAccessFacility,
}) => {
  const progress = useStore((state) => state.progress);
  const audioEnabled = useStore((state) => state.audioEnabled);
  const setAudioEnabled = useStore((state) => state.setAudioEnabled);
  const cvUrl = getCVUrl();

  const showAccessButton = progress < 0.1;
  const activeHint = getFilmHint(progress);

  const handleToggleAudio = () => {
    const nextState = !audioEnabled;
    sound.initContext();
    sound.playUiClick();
    setAudioEnabled(nextState);
  };

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
          flexWrap: 'wrap',
          gap: '0.75rem',
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

        {/* Permanent Quick Navigation Shortcuts & Audio Toggle */}
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleToggleAudio}
            className="audio-toggle-btn"
            title={audioEnabled ? 'Mute audio' : 'Enable facility audio effects'}
            style={{
              background: audioEnabled ? 'rgba(232, 162, 58, 0.15)' : 'rgba(14, 17, 20, 0.85)',
              border: `1px solid ${audioEnabled ? '#e8a23a' : '#2a3038'}`,
              color: audioEnabled ? '#e8a23a' : '#9e9a8e',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.76rem',
              padding: '0.4rem 0.65rem',
              borderRadius: '3px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {audioEnabled ? '🔊 AUDIO ON' : '🔇 AUDIO OFF'}
          </button>

          <button
            onClick={() => {
              if (audioEnabled) sound.playBootHum();
              onOpenOS();
            }}
            className="quick-portfolio-btn"
            title="Open Quick Portfolio / NJ-OS Command Center"
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
            QUICK PORTFOLIO [OS] →
          </button>

          <button
            onClick={() => {
              if (audioEnabled) sound.playAccessBeep();
              useStore.getState().setMode('suit-inspect');
            }}
            className="suit-vault-hud-btn"
            title="Inspect 3D Warden Exoskeleton Suit Chamber"
            style={{
              background: 'rgba(127, 179, 138, 0.15)',
              border: '1px solid #7fb38a',
              color: '#7fb38a',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.78rem',
              padding: '0.4rem 0.85rem',
              borderRadius: '3px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            🛡️ SUIT VAULT [3D]
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

      {/* Center Dynamic Interaction Prompt / Access Facility Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: showAccessButton ? 'auto' : 'none',
        }}
      >
        {showAccessButton && (
          <button
            onClick={onAccessFacility}
            className="access-facility-btn"
            style={{
              background: 'rgba(7, 8, 10, 0.92)',
              border: '2px solid #e8a23a',
              color: '#e8a23a',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.92rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              padding: '0.85rem 2.2rem',
              borderRadius: '4px',
              cursor: 'pointer',
              boxShadow: '0 0 25px rgba(232, 162, 58, 0.35)',
              transition: 'all 0.2s ease',
            }}
          >
            ACCESS THE FACILITY ▾
          </button>
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
          <span style={{ color: '#e8a23a' }}>
            {`${Math.round(progress * 100)}% FACILITY DEPTH`}
          </span>
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
      {progress < 0.85 && <SkipButton onSkip={onSkipIntro} />}
    </div>
  );
};
