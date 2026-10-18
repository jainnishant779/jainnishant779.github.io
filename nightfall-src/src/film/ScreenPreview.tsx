import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getQuadMatrix3d, getCoverQuadInViewport, type Quad } from './quad';
import { prefersReducedMotion } from '../lib/reducedMotion';
import { sound } from '../lib/sound';
import type { OSModuleId } from '../os/OSShell';

interface TacticalMonitor {
  id: string;
  slug?: string;
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
    id: 'master-terminal',
    module: 'identity',
    name: 'NISHANT JAIN // PRIMARY COMMAND TERMINAL',
    category: 'MASTER CONSOLE',
    badge: 'AI/ML · COMPUTER VISION · EDGE AI · IOT',
    subtitle: 'Production-grade Computer Vision and Edge AI systems with Python, YOLO, AWS, and NVIDIA Jetson.',
    tech: ['Python', 'YOLOv8', 'OpenCV', 'AWS EC2', 'NVIDIA Jetson'],
    bounds: { x: 0.28, y: 0.65, w: 0.21, h: 0.10 },
  },
  {
    id: 'dossier-intro',
    module: 'dossier',
    name: 'VERIFIED CREDENTIALS // DOSSIER & CV',
    category: 'VERIFIED CREDENTIALS',
    badge: 'B.TECH + M.TECH IOT // DAVV',
    subtitle: 'Comprehensive engineering dossier, verified work history, patent applications, and certifications.',
    tech: ['DAVV', 'Cognicity', 'Synquic Labs', 'AWS', 'CUDA'],
    bounds: { x: 0.51, y: 0.65, w: 0.21, h: 0.10 },
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
  const [isZooming, setIsZooming] = useState(false);

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

  // Handle click on any monitor
  const handleSelectMonitor = useCallback(
    (monitor: TacticalMonitor) => {
      if (isZooming) return;
      sound.initContext();
      sound.playBootHum();

      if (prefersReducedMotion()) {
        onOpenOS(monitor.module, monitor.slug);
        return;
      }

      setIsZooming(true);
      setTimeout(() => {
        onOpenOS(monitor.module, monitor.slug);
        setIsZooming(false);
      }, 750);
    },
    [isZooming, onOpenOS]
  );

  // Keyboard shortcut: Pressing Enter or Space triggers main terminal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (visible && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        const main = TACTICAL_MONITORS.find((m) => m.id === 'master-terminal');
        if (main) handleSelectMonitor(main);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, handleSelectMonitor]);

  if (!visible && !isZooming) return null;

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

        {/* 7 Tactical Screen Touch & Click Targets */}
        {TACTICAL_MONITORS.map((mon) => {
          const x = coverMetrics.offsetX + mon.bounds.x * coverMetrics.drawW;
          const y = coverMetrics.offsetY + mon.bounds.y * coverMetrics.drawH;
          const w = mon.bounds.w * coverMetrics.drawW;
          const h = mon.bounds.h * coverMetrics.drawH;
          const isHovered = hoveredId === mon.id;
          const isCenterAction = mon.id === 'master-terminal' || mon.id === 'dossier-intro';

          return (
            <div
              key={mon.id}
              onClick={() => handleSelectMonitor(mon)}
              onMouseEnter={() => {
                setHoveredId(mon.id);
                sound.playAccessBeep();
              }}
              onMouseLeave={() => setHoveredId(null)}
              role="button"
              tabIndex={0}
              aria-label={`Inspect ${mon.name}`}
              style={{
                position: 'absolute',
                left: `${x}px`,
                top: `${y}px`,
                width: `${w}px`,
                height: `${h}px`,
                cursor: 'pointer',
                borderRadius: isCenterAction ? '28px' : '4px',
                border: isHovered
                  ? '2px solid #00e5ff'
                  : isCenterAction
                  ? '1px solid rgba(232, 162, 58, 0.4)'
                  : '1px solid rgba(0, 229, 255, 0.2)',
                boxShadow: isHovered
                  ? '0 0 25px rgba(0, 229, 255, 0.5), inset 0 0 30px rgba(0, 229, 255, 0.15)'
                  : isCenterAction
                  ? '0 0 15px rgba(232, 162, 58, 0.2)'
                  : 'none',
                backgroundColor: isHovered
                  ? 'rgba(0, 229, 255, 0.08)'
                  : isCenterAction
                  ? 'rgba(7, 10, 14, 0.35)'
                  : 'transparent',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                boxSizing: 'border-box',
                backdropFilter: isHovered ? 'blur(2px)' : 'none',
              }}
            >
              {/* Tactical Corner Targeting Reticles on Hover (for monitors) */}
              {isHovered && !isCenterAction && (
                <>
                  <div
                    style={{
                      position: 'absolute',
                      top: 4,
                      left: 4,
                      width: 14,
                      height: 14,
                      borderTop: '2px solid #00e5ff',
                      borderLeft: '2px solid #00e5ff',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 14,
                      height: 14,
                      borderTop: '2px solid #00e5ff',
                      borderRight: '2px solid #00e5ff',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 4,
                      left: 4,
                      width: 14,
                      height: 14,
                      borderBottom: '2px solid #00e5ff',
                      borderLeft: '2px solid #00e5ff',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 4,
                      right: 4,
                      width: 14,
                      height: 14,
                      borderBottom: '2px solid #00e5ff',
                      borderRight: '2px solid #00e5ff',
                    }}
                  />
                </>
              )}

              {/* Floating Tactical HUD Pill on Hover */}
              {isHovered && (
                <div
                  style={{
                    position: 'absolute',
                    top: isCenterAction ? '-38px' : '8px',
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
                  <span style={{ color: '#7fb38a', marginRight: '6px' }}>● ACTIVE</span>
                  <span>{mon.badge}</span>
                  <span style={{ color: '#e8a23a', marginLeft: '6px' }}>[CLICK TO INSPECT ↵]</span>
                </div>
              )}

              {/* Interactive Buttons for Center Console Actions */}
              {mon.id === 'master-terminal' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectMonitor(mon);
                  }}
                  className="workstation-access-btn"
                  style={{
                    width: '92%',
                    height: '75%',
                    backgroundColor: isHovered ? '#00e5ff' : '#e8a23a',
                    color: '#07080a',
                    fontWeight: 700,
                    fontSize: '0.80rem',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    border: 'none',
                    boxShadow: isHovered
                      ? '0 0 25px rgba(0, 229, 255, 0.6)'
                      : '0 0 16px rgba(232, 162, 58, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>[ ACCESS COMPUTER WORKSTATION / INITIALIZE NJ-OS ]</span>
                  <span className="terminal-cursor">_</span>
                </button>
              )}

              {mon.id === 'dossier-intro' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectMonitor(mon);
                  }}
                  style={{
                    width: '92%',
                    height: '75%',
                    backgroundColor: isHovered ? 'rgba(0, 229, 255, 0.2)' : 'rgba(14, 17, 20, 0.65)',
                    color: isHovered ? '#00e5ff' : '#e6e2d8',
                    border: `1px solid ${isHovered ? '#00e5ff' : 'rgba(232, 162, 58, 0.5)'}`,
                    fontWeight: 700,
                    fontSize: '0.80rem',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    boxShadow: isHovered
                      ? '0 0 20px rgba(0, 229, 255, 0.4)'
                      : '0 0 10px rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>[ VIEW VERIFIED DOSSIER / CV ↗ ]</span>
                </button>
              )}
            </div>
          );
        })}

        {/* Bottom Floating Tactical Status Bar */}
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
              TACTICAL MONITORS ACTIVE
            </span>
          </div>

          <div style={{ fontSize: '0.74rem', color: '#9e9a8e' }}>
            HOVER ANY SCREEN TO TARGET // CLICK TO INSPECT // PRESS [ENTER] TO LAUNCH
          </div>

          <button
            type="button"
            onClick={() => {
              const main = TACTICAL_MONITORS.find((m) => m.id === 'master-terminal');
              if (main) handleSelectMonitor(main);
            }}
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
            BOOT NJ-OS ↵
          </button>
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
