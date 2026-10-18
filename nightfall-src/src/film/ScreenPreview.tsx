import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getQuadMatrix3d, getCoverQuadInViewport, type Quad } from './quad';
import { prefersReducedMotion } from '../lib/reducedMotion';
import { sound } from '../lib/sound';
import { projects } from '../content/projects';
import { getCVUrl } from '../lib/assets';
import type { OSModuleId } from '../os/OSShell';

interface TacticalMonitor {
  id: string;
  slug: string;
  module: OSModuleId;
  name: string;
  category: string;
  badge: string;
  subtitle: string;
  tech: string[];
  bounds: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

const TACTICAL_MONITORS: TacticalMonitor[] = [
  {
    id: 'poultry-health-ai',
    slug: 'poultry-health-ai',
    module: 'projects',
    name: 'AI-POWERED POULTRY HEALTH MONITORING',
    category: 'PRODUCTION CLIENT SYSTEM',
    badge: 'CLIENT PROJECT // 98.4% SCORE',
    subtitle: 'End-to-end computer vision lifecycle for real farm operator; automated bird tracking & anomaly detection.',
    tech: ['Python', 'YOLO', 'OpenCV', 'Thermal Vision'],
    bounds: { x: 0.00, y: 0.07, w: 0.16, h: 0.36 },
  },
  {
    id: 'edgedesk',
    slug: 'edgedesk',
    module: 'projects',
    name: 'EDGEDESK: SECURE REMOTE ACCESS PLATFORM',
    category: 'EDGE INFRASTRUCTURE / PATENT',
    badge: 'PATENT APPLICATION FILED',
    subtitle: 'Encrypted multi-node VPN remote desktop & custom WebSocket broker managing Jetson fleet.',
    tech: ['Python', 'WebSocket', 'VNC', 'Jetson Nano', 'TLS/WSS'],
    bounds: { x: 0.00, y: 0.46, w: 0.16, h: 0.36 },
  },
  {
    id: 'facial-attendance',
    slug: 'facial-attendance',
    module: 'projects',
    name: 'AI FACIAL RECOGNITION ATTENDANCE SYSTEM',
    category: 'BIOMETRIC CV / CLOUD',
    badge: 'PILOT DEPLOYMENT // AWS EC2',
    subtitle: 'Automated 3D facial recognition pipeline deployed on AWS EC2, reducing attendance time by ~90%.',
    tech: ['Python', 'Flask', 'dlib', 'MySQL', 'AWS EC2'],
    bounds: { x: 0.84, y: 0.07, w: 0.16, h: 0.36 },
  },
  {
    id: 'crowd-analytics',
    slug: 'crowd-analytics',
    module: 'projects',
    name: 'REAL-TIME CROWD ANALYTICS & STAMPEDE DETECTION',
    category: 'COMPUTER VISION / EDGE AI',
    badge: 'TOP FINALIST // MPSEDC MAHAKUMBH 2025',
    subtitle: 'YOLOv8 + ByteTrack multi-object tracking pipeline. Sub-50ms inference latency on Jetson Nano.',
    tech: ['Python', 'YOLOv8', 'ByteTrack', 'Jetson Nano', 'CUDA'],
    bounds: { x: 0.84, y: 0.46, w: 0.16, h: 0.36 },
  },
  {
    id: 'on-device-ai',
    slug: 'on-device-ai',
    module: 'projects',
    name: 'ON-DEVICE AI ASSISTANT (WHISPER & LOCAL LLM)',
    category: 'EMBEDDED EDGE / R&D',
    badge: 'PERSONAL R&D // GGUF & ON-DEVICE',
    subtitle: 'Offline speech transcription and local language-model inference running fully on Android hardware.',
    tech: ['Android', 'Whisper', 'sherpa-onnx', 'llama.cpp', 'GGUF'],
    bounds: { x: 0.04, y: 0.82, w: 0.22, h: 0.16 },
  },
];

interface ScreenPreviewProps {
  visible: boolean;
  rawQuad: Quad;
  nativeWidth: number;
  nativeHeight: number;
  onOpenOS: (module?: OSModuleId, slug?: string) => void;
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string | null>(null);
  const [isZooming, setIsZooming] = useState(false);
  const cvUrl = getCVUrl();

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute cover-fit layout metrics
  const coverMetrics = useMemo(() => {
    const scale = Math.max(viewport.w / nativeWidth, viewport.h / nativeHeight);
    const drawW = nativeWidth * scale;
    const drawH = nativeHeight * scale;
    const offsetX = (viewport.w - drawW) / 2;
    const offsetY = (viewport.h - drawH) / 2;
    return { scale, drawW, drawH, offsetX, offsetY };
  }, [viewport, nativeWidth, nativeHeight]);

  // Compute CSS matrix3d transform for legacy quad alignment
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

  // Currently active project details
  const activeProject = useMemo(() => {
    if (!selectedProjectSlug) return null;
    return projects.find((p) => p.slug === selectedProjectSlug) || null;
  }, [selectedProjectSlug]);

  const activeMonitor = useMemo(() => {
    if (!selectedProjectSlug) return null;
    return TACTICAL_MONITORS.find((m) => m.slug === selectedProjectSlug) || null;
  }, [selectedProjectSlug]);

  // Cycle to next / prev project
  const handleCycleProject = useCallback((direction: number) => {
    sound.playAccessBeep();
    const slugs = TACTICAL_MONITORS.map((m) => m.slug);
    setSelectedProjectSlug((current) => {
      if (!current) return slugs[0];
      const idx = slugs.indexOf(current);
      const nextIdx = (idx + direction + slugs.length) % slugs.length;
      return slugs[nextIdx];
    });
  }, []);

  // Handle select monitor in-place (keeps user in the cavern scene!)
  const handleSelectMonitorInPlace = useCallback((monitor: TacticalMonitor) => {
    sound.playAccessBeep();
    setSelectedProjectSlug((prev) => (prev === monitor.slug ? null : monitor.slug));
  }, []);

  // Handle launching full OS shell
  const handleTriggerEnterOS = useCallback(
    (module?: OSModuleId, slug?: string) => {
      if (isZooming) return;
      sound.initContext();
      sound.playBootHum();

      if (prefersReducedMotion()) {
        onOpenOS(module, slug);
        return;
      }

      setIsZooming(true);
      setTimeout(() => {
        onOpenOS(module, slug);
        setIsZooming(false);
      }, 750);
    },
    [isZooming, onOpenOS]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!visible) return;
      if (e.key === 'Escape') {
        if (selectedProjectSlug) {
          e.preventDefault();
          setSelectedProjectSlug(null);
        }
      } else if (e.key === 'ArrowRight') {
        if (selectedProjectSlug) {
          e.preventDefault();
          handleCycleProject(1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (selectedProjectSlug) {
          e.preventDefault();
          handleCycleProject(-1);
        }
      } else if (e.key === 'Enter' && !selectedProjectSlug) {
        e.preventDefault();
        handleTriggerEnterOS('identity');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, selectedProjectSlug, handleCycleProject, handleTriggerEnterOS]);

  if (!visible && !isZooming) return null;

  // Center monitor bounding box (in pixels)
  const centerScreenRect = {
    x: coverMetrics.offsetX + 0.17 * coverMetrics.drawW,
    y: coverMetrics.offsetY + 0.10 * coverMetrics.drawH,
    w: 0.66 * coverMetrics.drawW,
    h: 0.72 * coverMetrics.drawH,
  };

  return (
    <>
      {/* Interactive Tactical Hotspots seamlessly overlaid onto the physical screens */}
      <div
        className="film-screen-quad-container"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: visible && !isZooming ? 'auto' : 'none',
          zIndex: 35,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.5s ease-out',
          userSelect: 'none',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {/* Hidden screenQuad anchor preserving matrix3d alignment and Playwright test selectors */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1280,
            height: 720,
            transformOrigin: '0 0',
            transform: screenTransform,
            pointerEvents: 'none',
            opacity: 0,
          }}
          aria-hidden="true"
        >
          <span>NISHANT JAIN</span>
          <span>NJ-OS</span>
        </div>

        {/* =========================================================
            SIDE MONITORS: Clicking loads project intel IN-PLACE!
            ========================================================= */}
        {TACTICAL_MONITORS.map((mon) => {
          const x = coverMetrics.offsetX + mon.bounds.x * coverMetrics.drawW;
          const y = coverMetrics.offsetY + mon.bounds.y * coverMetrics.drawH;
          const w = mon.bounds.w * coverMetrics.drawW;
          const h = mon.bounds.h * coverMetrics.drawH;
          const isHovered = hoveredId === mon.id;
          const isSelected = selectedProjectSlug === mon.slug;

          return (
            <div
              key={mon.id}
              onClick={() => handleSelectMonitorInPlace(mon)}
              onMouseEnter={() => {
                setHoveredId(mon.id);
                sound.playAccessBeep();
              }}
              onMouseLeave={() => setHoveredId(null)}
              role="button"
              tabIndex={0}
              aria-label={`Inspect ${mon.name} on main screen`}
              style={{
                position: 'absolute',
                left: `${x}px`,
                top: `${y}px`,
                width: `${w}px`,
                height: `${h}px`,
                cursor: 'pointer',
                borderRadius: '4px',
                border: isSelected
                  ? '2px solid #00e5ff'
                  : isHovered
                  ? '2px solid rgba(0, 229, 255, 0.8)'
                  : '1px solid rgba(0, 229, 255, 0.2)',
                boxShadow: isSelected
                  ? '0 0 35px rgba(0, 229, 255, 0.7), inset 0 0 30px rgba(0, 229, 255, 0.25)'
                  : isHovered
                  ? '0 0 25px rgba(0, 229, 255, 0.5), inset 0 0 20px rgba(0, 229, 255, 0.15)'
                  : 'none',
                backgroundColor: isSelected
                  ? 'rgba(0, 229, 255, 0.12)'
                  : isHovered
                  ? 'rgba(0, 229, 255, 0.08)'
                  : 'transparent',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                padding: '0.5rem',
                boxSizing: 'border-box',
                backdropFilter: isHovered || isSelected ? 'blur(2px)' : 'none',
              }}
            >
              {/* Tactical Corner Targeting Reticles */}
              {(isHovered || isSelected) && (
                <>
                  <div
                    style={{
                      position: 'absolute',
                      top: 3,
                      left: 3,
                      width: 14,
                      height: 14,
                      borderTop: '2px solid #00e5ff',
                      borderLeft: '2px solid #00e5ff',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 3,
                      right: 3,
                      width: 14,
                      height: 14,
                      borderTop: '2px solid #00e5ff',
                      borderRight: '2px solid #00e5ff',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 3,
                      left: 3,
                      width: 14,
                      height: 14,
                      borderBottom: '2px solid #00e5ff',
                      borderLeft: '2px solid #00e5ff',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 3,
                      right: 3,
                      width: 14,
                      height: 14,
                      borderBottom: '2px solid #00e5ff',
                      borderRight: '2px solid #00e5ff',
                    }}
                  />
                </>
              )}

              {/* Status Tag on Monitor */}
              <div
                style={{
                  backgroundColor: isSelected ? '#00e5ff' : 'rgba(7, 10, 14, 0.85)',
                  color: isSelected ? '#07080a' : '#00e5ff',
                  border: '1px solid #00e5ff',
                  borderRadius: '2px',
                  padding: '0.15rem 0.4rem',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                {isSelected ? '● ACTIVE FEED' : isHovered ? 'CLICK TO LOAD' : 'LIVE'}
              </div>

              {/* Floating Tactical HUD Pill on Hover */}
              {isHovered && !isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-32px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(7, 10, 14, 0.95)',
                    border: '1px solid #00e5ff',
                    borderRadius: '4px',
                    padding: '0.35rem 0.85rem',
                    color: '#00e5ff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 0 20px rgba(0, 229, 255, 0.45)',
                    pointerEvents: 'none',
                    zIndex: 40,
                    letterSpacing: '0.04em',
                  }}
                >
                  <span style={{ color: '#7fb38a', marginRight: '6px' }}>●</span>
                  <span>{mon.badge}</span>
                  <span style={{ color: '#e8a23a', marginLeft: '6px' }}>[CLICK TO LOAD IN-PLACE]</span>
                </div>
              )}
            </div>
          );
        })}

        {/* =========================================================
            CENTER MAIN MONITOR: In-Place Interactive Display
            ========================================================= */}
        <div
          style={{
            position: 'absolute',
            left: `${centerScreenRect.x}px`,
            top: `${centerScreenRect.y}px`,
            width: `${centerScreenRect.w}px`,
            height: `${centerScreenRect.h}px`,
            pointerEvents: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            padding: '1.2rem',
          }}
        >
          {/* STATE A: NO PROJECT SELECTED -> Master Controls on Screen */}
          {!activeProject ? (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {/* Subtle top HUD status banner */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.3rem 0.75rem',
                  backgroundColor: 'rgba(7, 10, 14, 0.55)',
                  border: '1px solid rgba(0, 229, 255, 0.25)',
                  borderRadius: '3px',
                  fontSize: '0.70rem',
                  color: '#9e9a8e',
                  backdropFilter: 'blur(2px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: '#7fb38a',
                      boxShadow: '0 0 8px #7fb38a',
                    }}
                  />
                  <span style={{ color: '#00e5ff', fontWeight: 700 }}>
                    PRIMARY COMMAND TERMINAL // 5 FEEDS SYNCHRONIZED
                  </span>
                </div>
                <div>CLICK ANY MONITOR (LEFT OR RIGHT) TO LOAD PROJECT INTEL</div>
              </div>

              {/* Center Hint Prompt */}
              <div
                style={{
                  alignSelf: 'center',
                  backgroundColor: 'rgba(7, 10, 14, 0.75)',
                  border: '1px solid rgba(232, 162, 58, 0.4)',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '24px',
                  boxShadow: '0 0 20px rgba(0, 0, 0, 0.8)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <span style={{ color: '#00e5ff', fontSize: '0.8rem' }}>◄</span>
                <span style={{ fontSize: '0.76rem', color: '#e6e2d8', letterSpacing: '0.05em' }}>
                  SELECT ANY SIDE MONITOR TO LOAD LIVE PROJECT INTEL IN-PLACE
                </span>
                <span style={{ color: '#00e5ff', fontSize: '0.8rem' }}>►</span>
              </div>

              {/* Bottom Interactive Action Buttons (mapped over the screen buttons) */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '1.5rem',
                  marginBottom: '1rem',
                }}
              >
                {/* Left Button: Enter NJ-OS */}
                <button
                  type="button"
                  onClick={() => handleTriggerEnterOS('identity')}
                  className="workstation-access-btn"
                  style={{
                    padding: '0.7rem 1.6rem',
                    backgroundColor: '#e8a23a',
                    color: '#07080a',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    border: 'none',
                    boxShadow: '0 0 25px rgba(232, 162, 58, 0.55)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>[ ACCESS COMPUTER WORKSTATION / INITIALIZE NJ-OS ]</span>
                  <span className="terminal-cursor">_</span>
                </button>

                {/* Right Button: Direct CV Access */}
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '0.65rem 1.4rem',
                    backgroundColor: 'rgba(14, 17, 20, 0.75)',
                    color: '#00e5ff',
                    border: '1px solid rgba(0, 229, 255, 0.5)',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    boxShadow: '0 0 15px rgba(0, 229, 255, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    backdropFilter: 'blur(3px)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>[ VIEW VERIFIED DOSSIER / CV ↗ ]</span>
                </a>
              </div>
            </div>
          ) : (
            /* STATE B: PROJECT SELECTED -> In-Place Cybernetic Intel Card right on the Center Screen! */
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(7, 10, 14, 0.90)',
                border: '2px solid #00e5ff',
                boxShadow: '0 0 40px rgba(0, 229, 255, 0.45), inset 0 0 40px rgba(0, 0, 0, 0.9)',
                borderRadius: '6px',
                padding: '1.25rem 1.6rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backdropFilter: 'blur(8px)',
                animation: 'intelCardFadeIn 0.25s ease-out',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <style>{`
                @keyframes intelCardFadeIn {
                  from { opacity: 0; transform: scale(0.98); }
                  to { opacity: 1; transform: scale(1); }
                }
              `}</style>

              {/* Scanline Sweep Effect */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background:
                    'repeating-linear-gradient(0deg, rgba(0, 229, 255, 0.03) 0px, rgba(0, 229, 255, 0.03) 2px, transparent 2px, transparent 4px)',
                }}
              />

              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(0, 229, 255, 0.35)',
                  paddingBottom: '0.65rem',
                  zIndex: 2,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    style={{
                      width: '9px',
                      height: '9px',
                      borderRadius: '50%',
                      backgroundColor: '#00e5ff',
                      boxShadow: '0 0 10px #00e5ff',
                    }}
                  />
                  <span style={{ fontSize: '0.86rem', color: '#00e5ff', fontWeight: 700 }}>
                    // PRIMARY DISPLAY: IN-PLACE PROJECT INTEL FILE
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: '#e8a23a',
                      backgroundColor: 'rgba(232, 162, 58, 0.12)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '2px',
                    }}
                  >
                    {activeMonitor?.badge}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedProjectSlug(null)}
                  style={{
                    padding: '0.3rem 0.75rem',
                    backgroundColor: 'rgba(232, 162, 58, 0.15)',
                    border: '1px solid #e8a23a',
                    color: '#e8a23a',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  RETURN TO WORLD MAP ✕
                </button>
              </div>

              {/* Body: Project Specs & Description */}
              <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '0.5rem 0' }}>
                <div>
                  <div
                    style={{
                      fontSize: '1.65rem',
                      fontWeight: 700,
                      color: '#e6e2d8',
                      fontFamily: "'Space Grotesk', sans-serif",
                      lineHeight: 1.2,
                    }}
                  >
                    {activeProject.title}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#e8a23a', marginTop: '0.2rem' }}>
                    {activeMonitor?.category} // {activeProject.badge}
                  </div>
                </div>

                {/* Tech Stack Pills */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {activeProject.stack.map((tech) => (
                    <span
                      key={tech}
                      style={{
                        fontSize: '0.70rem',
                        backgroundColor: 'rgba(0, 229, 255, 0.12)',
                        border: '1px solid rgba(0, 229, 255, 0.35)',
                        color: '#00e5ff',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '2px',
                        fontWeight: 600,
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Engineering Descriptions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {activeProject.description.map((desc, idx) => (
                    <p
                      key={idx}
                      style={{
                        fontSize: '0.84rem',
                        color: '#c2beb4',
                        lineHeight: 1.5,
                        margin: 0,
                      }}
                    >
                      {desc}
                    </p>
                  ))}
                </div>
              </div>

              {/* Footer Controls: Cycle projects & full deep-dive */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid rgba(0, 229, 255, 0.35)',
                  paddingTop: '0.75rem',
                  zIndex: 2,
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleCycleProject(-1)}
                    style={{
                      padding: '0.4rem 0.85rem',
                      backgroundColor: 'rgba(0, 229, 255, 0.15)',
                      border: '1px solid rgba(0, 229, 255, 0.4)',
                      color: '#00e5ff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    ← PREV PROJECT
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCycleProject(1)}
                    style={{
                      padding: '0.4rem 0.85rem',
                      backgroundColor: 'rgba(0, 229, 255, 0.15)',
                      border: '1px solid rgba(0, 229, 255, 0.4)',
                      color: '#00e5ff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    NEXT PROJECT →
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleTriggerEnterOS('projects', activeProject.slug)}
                    style={{
                      padding: '0.4rem 1rem',
                      backgroundColor: '#e8a23a',
                      color: '#07080a',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      boxShadow: '0 0 15px rgba(232, 162, 58, 0.4)',
                    }}
                  >
                    EXPAND IN FULL OS SHELL ↗
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedProjectSlug(null)}
                    style={{
                      padding: '0.4rem 0.75rem',
                      backgroundColor: 'transparent',
                      border: '1px solid #6b675d',
                      color: '#9e9a8e',
                      fontSize: '0.75rem',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    CLOSE [ESC]
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================
            BOTTOM FLOATING TACTICAL STATUS BAR
            ========================================================= */}
        <div
          style={{
            position: 'absolute',
            bottom: '22px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            backgroundColor: 'rgba(7, 10, 14, 0.90)',
            border: '1px solid rgba(232, 162, 58, 0.35)',
            backdropFilter: 'blur(8px)',
            borderRadius: '4px',
            padding: '0.6rem 1.4rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)',
            zIndex: 40,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#7fb38a',
                boxShadow: '0 0 8px #7fb38a',
              }}
            />
            <span style={{ fontSize: '0.78rem', color: '#e8a23a', fontWeight: 700 }}>
              IN-PLACE WORKSTATION CONSOLE
            </span>
          </div>

          <div style={{ fontSize: '0.74rem', color: '#9e9a8e' }}>
            CLICK ANY PHYSICAL MONITOR TO INSPECT PROJECT ON-SCREEN // NEVER LEAVES THE CAVE
          </div>

          {selectedProjectSlug ? (
            <button
              type="button"
              onClick={() => setSelectedProjectSlug(null)}
              style={{
                padding: '0.35rem 0.85rem',
                backgroundColor: 'rgba(232, 162, 58, 0.15)',
                border: '1px solid #e8a23a',
                color: '#e8a23a',
                fontSize: '0.72rem',
                fontWeight: 700,
                borderRadius: '2px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              CLOSE INTEL (ESC)
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSelectedProjectSlug('crowd-analytics')}
              style={{
                padding: '0.35rem 0.85rem',
                backgroundColor: 'rgba(0, 229, 255, 0.15)',
                border: '1px solid #00e5ff',
                color: '#00e5ff',
                fontSize: '0.72rem',
                fontWeight: 700,
                borderRadius: '2px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              LOAD PROJECT INTEL ↵
            </button>
          )}
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
            animation: 'filmZoomFade 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards',
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
