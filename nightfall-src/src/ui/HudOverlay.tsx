import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../state/store';
import { getActiveHint } from '../world/cameraPath';
import { getCVUrl } from '../lib/assets';
import { isMobileDevice } from '../lib/quality';
import { sound } from '../lib/sound';
import { SkipButton } from './SkipButton';

interface HudOverlayProps {
  onOpenOS: () => void;
  onSkipIntro: () => void;
  onAccessFacility: () => void;
}

export const HudOverlay: React.FC<HudOverlayProps> = ({
  onOpenOS,
  onSkipIntro,
  onAccessFacility,
}) => {
  const mode = useStore((state) => state.mode);
  const setMode = useStore((state) => state.setMode);
  const progress = useStore((state) => state.progress);
  const activeInteraction = useStore((state) => state.activeInteraction);
  const audioEnabled = useStore((state) => state.audioEnabled);
  const setAudioEnabled = useStore((state) => state.setAudioEnabled);
  const activeHint = getActiveHint(progress);
  const cvUrl = getCVUrl();
  const isMobile = isMobileDevice();

  const isNearComputer = activeInteraction === 'workstation' || (mode === 'guided' && progress >= 0.85);
  const isNearSuit = activeInteraction === 'suit' || (mode === 'guided' && progress >= 0.65 && progress <= 0.76);
  const showAccessButton = mode === 'guided' && progress < 0.12;

  const handleToggleAudio = () => {
    const nextState = !audioEnabled;
    if (nextState) {
      sound.initContext();
    }
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
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          <button
            onClick={handleToggleAudio}
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

          {!isMobile && (
            <button
              onClick={() => setMode(mode === 'free' ? 'guided' : 'free')}
              className="free-explore-toggle-btn"
              title={mode === 'free' ? 'Return to guided camera tour (ESC)' : 'Explore cave freely with WASD'}
              style={{
                background: mode === 'free' ? 'rgba(232, 162, 58, 0.25)' : 'rgba(14, 17, 20, 0.85)',
                border: `1px solid ${mode === 'free' ? '#e8a23a' : '#2a3038'}`,
                color: mode === 'free' ? '#e8a23a' : '#e6e2d8',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.78rem',
                padding: '0.4rem 0.85rem',
                borderRadius: '3px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {mode === 'free' ? '✕ EXIT FREE EXPLORE [ESC]' : 'FREE EXPLORE [WASD]'}
            </button>
          )}
        </div>
      </div>

      {/* Free Explore Top Instruction Banner */}
      {mode === 'free' && (
        <div
          className="free-explore-banner"
          style={{
            position: 'fixed',
            top: '4.8rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(7, 8, 10, 0.92)',
            border: '1px solid rgba(232, 162, 58, 0.5)',
            color: '#e6e2d8',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.78rem',
            padding: '0.45rem 1.25rem',
            borderRadius: '4px',
            pointerEvents: 'auto',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          }}
        >
          <span>WASD to walk · Click to look · ESC / Click to return</span>
          <span style={{ color: '#e8a23a' }}>·</span>
          <button
            onClick={() => setMode('guided')}
            style={{
              color: '#e8a23a',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Return to Tour
          </button>
        </div>
      )}

      {/* Center Dynamic Interaction Prompt / Access Facility Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: showAccessButton || isNearComputer || isNearSuit ? 'auto' : 'none',
        }}
      >
        {/* Phase 3 "ACCESS THE FACILITY" Button */}
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
          <span>{mode === 'free' ? 'FREE EXPLORE MODE // MANUAL LOCOMOTION ACTIVE' : activeHint}</span>
          <span style={{ color: '#e8a23a' }}>
            {mode === 'free' ? 'CAVERN INTERIOR' : `${Math.round(progress * 100)}% FACILITY DEPTH`}
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
              width: `${mode === 'free' ? 100 : Math.round(progress * 100)}%`,
              height: '100%',
              background: '#e8a23a',
              transition: 'width 0.1s linear',
            }}
          />
        </div>
      </div>

      {/* Skip button for intro phase (guided mode only) */}
      {mode === 'guided' && progress < 0.45 && <SkipButton onSkip={onSkipIntro} />}
    </div>
  );
};
