import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getQuadMatrix3d, getCoverQuadInViewport, type Quad } from './quad';
import { prefersReducedMotion } from '../lib/reducedMotion';
import { sound } from '../lib/sound';
import { projects } from '../content/projects';

interface ScreenPreviewProps {
  visible: boolean;
  rawQuad: Quad;
  nativeWidth: number;
  nativeHeight: number;
  onOpenOS: () => void;
}

export const ScreenPreview: React.FC<ScreenPreviewProps> = ({
  visible,
  rawQuad,
  nativeWidth,
  nativeHeight,
  onOpenOS,
}) => {
  const [viewport, setViewport] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 1600,
    h: typeof window !== 'undefined' ? window.innerHeight : 900,
  });
  const [isZooming, setIsZooming] = useState(false);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute CSS matrix3d transform
  const screenTransform = useMemo(() => {
    const srcW = 1280;
    const srcH = 720;
    const quadInViewport = getCoverQuadInViewport(
      rawQuad,
      nativeWidth,
      nativeHeight,
      viewport.w,
      viewport.h
    );
    return getQuadMatrix3d(srcW, srcH, quadInViewport);
  }, [rawQuad, nativeWidth, nativeHeight, viewport]);

  // Handle enter OS action with zoom transition
  const handleTriggerEnter = useCallback(() => {
    if (isZooming) return;
    sound.initContext();
    sound.playBootHum();

    if (prefersReducedMotion()) {
      onOpenOS();
      return;
    }

    setIsZooming(true);
    setTimeout(() => {
      onOpenOS();
      setIsZooming(false);
    }, 900);
  }, [isZooming, onOpenOS]);

  // Keyboard shortcut: Pressing Enter while screen preview is visible
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (visible && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleTriggerEnter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, handleTriggerEnter]);

  if (!visible && !isZooming) return null;

  return (
    <>
      {/* 3D Quad Screen Container */}
      <div
        className="film-screen-quad-container"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 35,
          overflow: 'hidden',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.5s ease-out',
        }}
      >
        <div
          onClick={handleTriggerEnter}
          tabIndex={0}
          role="button"
          aria-label="Enter NJ-OS Command Center"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1280,
            height: 720,
            transformOrigin: '0 0',
            transform: screenTransform,
            pointerEvents: visible && !isZooming ? 'auto' : 'none',
            cursor: 'pointer',
            backgroundColor: '#070a0e',
            color: '#e6e2d8',
            fontFamily: "'JetBrains Mono', monospace",
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '2.5rem',
            boxSizing: 'border-box',
            borderRadius: '4px',
            border: '2px solid rgba(232, 162, 58, 0.4)',
            boxShadow: '0 0 45px rgba(232, 162, 58, 0.25), inset 0 0 60px rgba(0, 0, 0, 0.9)',
            overflow: 'hidden',
            userSelect: 'none',
          }}
        >
          {/* Subtle Scanlines overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background:
                'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 2px, transparent 2px, transparent 4px)',
              zIndex: 2,
            }}
          />

          {/* Top Status Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(232, 162, 58, 0.25)',
              paddingBottom: '1rem',
              zIndex: 3,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#7fb38a',
                  boxShadow: '0 0 10px #7fb38a',
                }}
              />
              <span style={{ fontSize: '1rem', color: '#e8a23a', fontWeight: 700 }}>
                NJ-OS v2.4 // WORKSTATION PRIMARY DISPLAY
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#9e9a8e' }}>
              SECURE FACILITY // TERMINAL READY
            </div>
          </div>

          {/* Central Profile Brief */}
          <div style={{ zIndex: 3, margin: 'auto 0' }}>
            <div
              style={{
                fontSize: '2.6rem',
                fontWeight: 700,
                color: '#e6e2d8',
                letterSpacing: '-0.02em',
                marginBottom: '0.5rem',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              NISHANT JAIN
            </div>
            <div
              style={{
                fontSize: '1.25rem',
                color: '#e8a23a',
                marginBottom: '1rem',
              }}
            >
              AI/ML Engineer · Edge AI & Computer Vision · IoT
            </div>
            <div
              style={{
                maxWidth: '850px',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                color: '#9e9a8e',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Building production-grade Computer Vision and Edge AI systems with Python,
              YOLO, OpenCV, AWS, and NVIDIA Jetson. Patent applicant with verified production
              deliveries.
            </div>

            {/* Verified Production Projects Showcase */}
            <div
              style={{
                marginTop: '1.25rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
              }}
            >
              {projects.slice(0, 3).map((proj) => (
                <div
                  key={proj.slug}
                  style={{
                    backgroundColor: 'rgba(14, 17, 20, 0.85)',
                    border: '1px solid rgba(232, 162, 58, 0.3)',
                    borderRadius: '3px',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '0.68rem',
                        color: '#e8a23a',
                        marginBottom: '0.35rem',
                        fontWeight: 600,
                      }}
                    >
                      {proj.badge}
                    </div>
                    <div
                      style={{
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        color: '#e6e2d8',
                        lineHeight: 1.3,
                      }}
                    >
                      {proj.title}
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: '0.5rem',
                      display: 'flex',
                      gap: '0.35rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    {proj.stack.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        style={{
                          fontSize: '0.68rem',
                          backgroundColor: 'rgba(232, 162, 58, 0.12)',
                          color: '#c4872e',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '2px',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Interactive CTA */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid rgba(232, 162, 58, 0.25)',
              paddingTop: '1rem',
              zIndex: 3,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                type="button"
                onClick={handleTriggerEnter}
                className="workstation-access-btn"
                style={{
                  padding: '0.75rem 1.75rem',
                  backgroundColor: '#e8a23a',
                  color: '#07080a',
                  fontWeight: 700,
                  fontSize: '1rem',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: '0 0 20px rgba(232, 162, 58, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontFamily: 'inherit',
                }}
              >
                <span>[ ACCESS COMPUTER WORKSTATION / INITIALIZE NJ-OS ]</span>
                <span className="terminal-cursor">_</span>
              </button>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#7fb38a' }}>
              ONLINE // STANDBY MODE
            </div>
          </div>
        </div>
      </div>

      {/* Cinematic Zoom Transition Overlay */}
      {isZooming && (
        <div
          className="film-zoom-transition"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            backgroundColor: '#07080a',
            animation: 'filmZoomFade 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            pointerEvents: 'none',
          }}
        >
          <style>{`
            @keyframes filmZoomFade {
              0% { opacity: 0; transform: scale(1); }
              40% { opacity: 0.6; }
              100% { opacity: 1; transform: scale(1.08); }
            }
          `}</style>
        </div>
      )}
    </>
  );
};
