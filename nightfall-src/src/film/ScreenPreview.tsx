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
  const [activeProjectIndex, setActiveProjectIndex] = useState<number | null>(null);

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
            backgroundColor: 'rgba(7, 10, 14, 0.78)',
            backdropFilter: 'blur(2px)',
            color: '#e6e2d8',
            fontFamily: "'JetBrains Mono', monospace",
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '2rem 2.5rem',
            boxSizing: 'border-box',
            borderRadius: '4px',
            border: '2px solid rgba(232, 162, 58, 0.45)',
            boxShadow: '0 0 50px rgba(232, 162, 58, 0.28), inset 0 0 70px rgba(0, 0, 0, 0.85)',
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
                'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 2px, transparent 2px, transparent 4px)',
              zIndex: 2,
            }}
          />

          {/* Top Status Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(232, 162, 58, 0.3)',
              paddingBottom: '0.65rem',
              zIndex: 3,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: '#7fb38a',
                  boxShadow: '0 0 10px #7fb38a',
                }}
              />
              <span style={{ fontSize: '0.92rem', color: '#e8a23a', fontWeight: 700 }}>
                NJ-OS v2.4 // WORKSTATION PRIMARY DISPLAY
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#9e9a8e' }}>
              SECURE FACILITY // 5 VERIFIED PROJECTS ONLINE
            </div>
          </div>

          {/* Central Profile & Projects Brief */}
          <div style={{ zIndex: 3, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div
                  style={{
                    fontSize: '2.4rem',
                    fontWeight: 700,
                    color: '#e6e2d8',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  NISHANT JAIN
                </div>
                <div
                  style={{
                    fontSize: '1.05rem',
                    color: '#e8a23a',
                    marginTop: '0.2rem',
                  }}
                >
                  AI/ML Engineer · Computer Vision · Edge AI · IoT
                </div>
              </div>

              <div
                style={{
                  fontSize: '0.72rem',
                  color: '#9e9a8e',
                  textAlign: 'right',
                  lineHeight: 1.5,
                  maxWidth: '380px',
                }}
              >
                Production Computer Vision & Edge AI systems with Python, YOLO, OpenCV, AWS, & NVIDIA Jetson. Patent applicant.
              </div>
            </div>

            {/* Verified Production Projects Showcase Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
                marginTop: '0.25rem',
              }}
            >
              {projects.slice(0, 3).map((proj, idx) => (
                <div
                  key={proj.slug}
                  onMouseEnter={() => setActiveProjectIndex(idx)}
                  onMouseLeave={() => setActiveProjectIndex(null)}
                  style={{
                    backgroundColor:
                      activeProjectIndex === idx
                        ? 'rgba(232, 162, 58, 0.15)'
                        : 'rgba(14, 17, 20, 0.88)',
                    border: `1px solid ${
                      activeProjectIndex === idx ? '#e8a23a' : 'rgba(232, 162, 58, 0.35)'
                    }`,
                    borderRadius: '4px',
                    padding: '0.75rem 0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '135px',
                    boxShadow:
                      activeProjectIndex === idx
                        ? '0 0 15px rgba(232, 162, 58, 0.25)'
                        : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '0.65rem',
                        color: '#e8a23a',
                        marginBottom: '0.25rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {proj.badge}
                    </div>
                    <div
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        color: '#e6e2d8',
                        lineHeight: 1.25,
                      }}
                    >
                      {proj.title}
                    </div>
                    <div
                      style={{
                        fontSize: '0.7rem',
                        color: '#9e9a8e',
                        marginTop: '0.35rem',
                        lineHeight: 1.35,
                      }}
                    >
                      {proj.description[0]?.slice(0, 85)}...
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: '0.5rem',
                      display: 'flex',
                      gap: '0.3rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    {proj.stack.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        style={{
                          fontSize: '0.62rem',
                          backgroundColor: 'rgba(232, 162, 58, 0.12)',
                          color: '#e8a23a',
                          padding: '0.12rem 0.35rem',
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

            {/* Row 2: Remaining 2 Projects */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem',
              }}
            >
              {projects.slice(3, 5).map((proj, idx) => (
                <div
                  key={proj.slug}
                  onMouseEnter={() => setActiveProjectIndex(3 + idx)}
                  onMouseLeave={() => setActiveProjectIndex(null)}
                  style={{
                    backgroundColor:
                      activeProjectIndex === 3 + idx
                        ? 'rgba(232, 162, 58, 0.15)'
                        : 'rgba(14, 17, 20, 0.88)',
                    border: `1px solid ${
                      activeProjectIndex === 3 + idx ? '#e8a23a' : 'rgba(232, 162, 58, 0.35)'
                    }`,
                    borderRadius: '4px',
                    padding: '0.65rem 0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '105px',
                    boxShadow:
                      activeProjectIndex === 3 + idx
                        ? '0 0 15px rgba(232, 162, 58, 0.25)'
                        : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '0.64rem',
                        color: '#7fb38a',
                        marginBottom: '0.2rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {proj.badge}
                    </div>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#e6e2d8',
                        lineHeight: 1.25,
                      }}
                    >
                      {proj.title}
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: '0.35rem',
                      display: 'flex',
                      gap: '0.3rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    {proj.stack.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        style={{
                          fontSize: '0.62rem',
                          backgroundColor: 'rgba(127, 179, 138, 0.12)',
                          color: '#7fb38a',
                          padding: '0.12rem 0.35rem',
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
              borderTop: '1px solid rgba(232, 162, 58, 0.3)',
              paddingTop: '0.75rem',
              zIndex: 3,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                type="button"
                onClick={handleTriggerEnter}
                className="workstation-access-btn"
                style={{
                  padding: '0.7rem 1.6rem',
                  backgroundColor: '#e8a23a',
                  color: '#07080a',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: '0 0 20px rgba(232, 162, 58, 0.45)',
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
            <div style={{ fontSize: '0.8rem', color: '#7fb38a' }}>
              ● 5 PRODUCTION PROJECTS LOADED // STANDBY READY
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
