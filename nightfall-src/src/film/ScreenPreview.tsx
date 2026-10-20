import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getQuadMatrix3d, getCoverQuadInViewport, type Quad } from './quad';
import { prefersReducedMotion } from '../lib/reducedMotion';
import { sound } from '../lib/sound';
import { projects } from '../content/projects';
import { experiences } from '../content/experience';
import { achievements, certifications } from '../content/achievements';
import { profile } from '../content/profile';
import { getCVUrl } from '../lib/assets';
import { useStore } from '../state/store';
import { EdgeDeskDiagram } from '../os/diagrams/EdgeDeskDiagram';
import { CrowdDiagram } from '../os/diagrams/CrowdDiagram';
import { LoRaDiagram } from '../os/diagrams/LoRaDiagram';
import type { OSModuleId } from '../os/OSShell';

interface ScreenDef {
  id: string;
  slug: string;
  module: OSModuleId;
  title: string;
  shortTitle: string;
  badge: string;
  metrics: string;
  tech: string[];
  keyNum: string;
}

const SCREENS: ScreenDef[] = [
  {
    id: 'poultry-health-ai',
    slug: 'poultry-health-ai',
    module: 'projects',
    title: 'AI-Powered Poultry Health Monitoring',
    shortTitle: 'POULTRY HEALTH AI',
    badge: 'CLIENT PROJECT',
    metrics: '98.4% ANOMALY SCORE · JETSON NANO',
    tech: ['Python', 'YOLO', 'OpenCV', 'Edge AI'],
    keyNum: '1',
  },
  {
    id: 'edgedesk',
    slug: 'edgedesk',
    module: 'projects',
    title: 'EdgeDesk: Secure Multi-Device Remote Access Platform',
    shortTitle: 'EDGEDESK REMOTE ACCESS',
    badge: 'PATENT APPLICATION FILED',
    metrics: '12 JETSON NODES · WSS / TLS 1.3',
    tech: ['WebSocket', 'VNC', 'Jetson Nano', 'TLS 1.3'],
    keyNum: '2',
  },
  {
    id: 'facial-attendance',
    slug: 'facial-attendance',
    module: 'projects',
    title: 'AI Facial Recognition Attendance System',
    shortTitle: 'FACIAL RECOGNITION AI',
    badge: 'PILOT DEPLOYMENT',
    metrics: '99.2% ACCURACY · AWS EC2',
    tech: ['Python', 'Flask', 'dlib', 'AWS EC2'],
    keyNum: '3',
  },
  {
    id: 'crowd-analytics',
    slug: 'crowd-analytics',
    module: 'projects',
    title: 'Real-Time Crowd Analytics & Stampede Detection',
    shortTitle: 'CROWD ANALYTICS & STAMPEDE',
    badge: 'MAHAKUMBH FINALIST',
    metrics: 'SUB-50MS LATENCY · YOLOv8 + CUDA',
    tech: ['YOLOv8', 'ByteTrack', 'CUDA', 'OpenCV'],
    keyNum: '4',
  },
  {
    id: 'on-device-ai',
    slug: 'on-device-ai',
    module: 'projects',
    title: 'On-Device AI Assistant (Offline Speech & Local LLM)',
    shortTitle: 'ON-DEVICE AI ASSISTANT',
    badge: 'PERSONAL R&D',
    metrics: 'WHISPER + LLAMA.CPP GGUF 4-BIT',
    tech: ['Android', 'Whisper', 'llama.cpp', 'sherpa-onnx'],
    keyNum: '5',
  },
  {
    id: 'lora-traffic-mesh',
    slug: 'lora-traffic-mesh',
    module: 'projects',
    title: 'Adaptive LoRa Traffic Intersection Mesh',
    shortTitle: 'LORA TRAFFIC MESH',
    badge: 'HARDWARE PROTOTYPE',
    metrics: 'SUB-GHZ MESH · ESP32 + FREERTOS',
    tech: ['ESP32', 'LoRaWAN', 'FreeRTOS', 'C++'],
    keyNum: '6',
  },
];

// Exact physical monitor quads in 1600x900 coordinate space for f_0239.webp workstation
const LEFT_MONITOR_QUAD: Quad = [
  [198, 520],
  [505, 520],
  [505, 696],
  [198, 696],
];

const CENTER_MONITOR_QUAD: Quad = [
  [523, 355],
  [1075, 355],
  [1075, 730],
  [523, 730],
];

const RIGHT_MONITOR_QUAD: Quad = [
  [1095, 520],
  [1402, 520],
  [1402, 696],
  [1095, 696],
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

  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string | null>(null);
  const [centerTab, setCenterTab] = useState<'home' | 'projects' | 'architecture' | 'contact'>('home');
  const [leftTab, setLeftTab] = useState<'telemetry' | 'hardware' | 'network'>('telemetry');
  const [rightTab, setRightTab] = useState<'quick' | 'experience' | 'honors'>('quick');
  const [projectCategory, setProjectCategory] = useState<string>('All');
  const [isZooming, setIsZooming] = useState(false);
  const [tickerTick, setTickerTick] = useState(0);

  const cvUrl = getCVUrl();

  // Subtle live telemetry pulse
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setTickerTick((t) => (t + 1) % 100);
    }, 2000);
    return () => clearInterval(interval);
  }, [visible]);

  // Window resize listener
  useEffect(() => {
    const handleResize = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const gpuLoad = 23 + (tickerTick % 4);
  const cpuLoad = 14 + ((tickerTick * 2) % 5);
  const memLoad = 38 + (tickerTick % 2);
  const tempVal = 52 + ((tickerTick % 3) - 1);

  // Compute CSS matrix3d for LEFT MONITOR (src: 600 x 380)
  const leftTransform = useMemo(() => {
    const quadInViewport = getCoverQuadInViewport(
      LEFT_MONITOR_QUAD,
      nativeWidth,
      nativeHeight,
      viewport.w,
      viewport.h
    );
    return getQuadMatrix3d(600, 380, quadInViewport);
  }, [nativeWidth, nativeHeight, viewport]);

  // Compute CSS matrix3d for CENTER MONITOR (src: 900 x 600)
  const centerTransform = useMemo(() => {
    const quadToUse: Quad =
      rawQuad && rawQuad.length === 4 && rawQuad[0][0] > 0
        ? rawQuad
        : CENTER_MONITOR_QUAD;
    const quadInViewport = getCoverQuadInViewport(
      quadToUse,
      nativeWidth,
      nativeHeight,
      viewport.w,
      viewport.h
    );
    return getQuadMatrix3d(900, 600, quadInViewport);
  }, [rawQuad, nativeWidth, nativeHeight, viewport]);

  // Compute CSS matrix3d for RIGHT MONITOR (src: 600 x 380)
  const rightTransform = useMemo(() => {
    const quadInViewport = getCoverQuadInViewport(
      RIGHT_MONITOR_QUAD,
      nativeWidth,
      nativeHeight,
      viewport.w,
      viewport.h
    );
    return getQuadMatrix3d(600, 380, quadInViewport);
  }, [nativeWidth, nativeHeight, viewport]);

  // Active project data for in-place dossier
  const activeProject = useMemo(() => {
    if (!selectedProjectSlug) return null;
    return projects.find((p) => p.slug === selectedProjectSlug) || null;
  }, [selectedProjectSlug]);

  const filteredProjects = useMemo(() => {
    if (projectCategory === 'All') return projects;
    return projects.filter((p) => p.category === projectCategory);
  }, [projectCategory]);

  // Cycle to next / prev project
  const handleCycleProject = useCallback((direction: number) => {
    sound.playAccessBeep();
    const slugs = SCREENS.map((s) => s.slug);
    setSelectedProjectSlug((current) => {
      if (!current) return slugs[0];
      const idx = slugs.indexOf(current);
      const nextIdx = (idx + direction + slugs.length) % slugs.length;
      return slugs[nextIdx];
    });
  }, []);

  // Select project in-place on center screen
  const handleSelectScreenInPlace = useCallback((screen: ScreenDef) => {
    sound.playAccessBeep();
    setSelectedProjectSlug((prev) => (prev === screen.slug ? null : screen.slug));
  }, []);

  // Open standalone OS overlay with zoom
  const handleLaunchFullOS = useCallback(
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
      }, 700);
    },
    [isZooming, onOpenOS]
  );

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!visible) return;
      if (e.key === 'Escape') {
        if (selectedProjectSlug) {
          e.preventDefault();
          setSelectedProjectSlug(null);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleCycleProject(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleCycleProject(-1);
      } else if (e.key === 'Enter' && !selectedProjectSlug) {
        e.preventDefault();
        handleLaunchFullOS('identity');
      } else if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        const targetScreen = SCREENS.find((s) => s.keyNum === e.key);
        if (targetScreen) {
          e.preventDefault();
          handleSelectScreenInPlace(targetScreen);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, selectedProjectSlug, handleCycleProject, handleLaunchFullOS, handleSelectScreenInPlace]);

  if (!visible && !isZooming) return null;

  return (
    <>
      {/* =========================================================================
       * TRIPLE-MONITOR INTERACTIVE WORKSTATION CONTAINER
       * Operable directly with mouse across all 3 monitors in the subterranean cave
       * ========================================================================= */}
      <div
        className="film-screen-quad-container"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: visible && !isZooming ? 'auto' : 'none',
          zIndex: 35,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.4s ease-out',
          userSelect: 'none',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {/* =======================================================================
         * 1. LEFT MONITOR (TELEMETRY & HARDWARE LAB)
         * ======================================================================= */}
        <div
          className="workstation-left-screen"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 600,
            height: 380,
            transformOrigin: '0 0',
            transform: leftTransform,
            backgroundColor: 'rgba(5, 10, 16, 0.94)',
            border: '1.5px solid rgba(0, 229, 255, 0.4)',
            boxShadow: '0 0 25px rgba(0, 229, 255, 0.25), inset 0 0 35px rgba(0, 0, 0, 0.8)',
            borderRadius: '4px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            color: '#e2e8f0',
            pointerEvents: 'auto',
          }}
        >
          {/* Top Title & Sub-tabs */}
          <div
            style={{
              padding: '0.45rem 0.75rem',
              background: 'rgba(9, 14, 22, 0.98)',
              borderBottom: '1px solid rgba(0, 229, 255, 0.25)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: '0.68rem', color: '#00e5ff', fontWeight: 700, letterSpacing: '0.04em' }}>
              ● MON-01 // TELEMETRY & HARDWARE
            </div>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              {(['telemetry', 'hardware', 'network'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    sound.playUiClick();
                    setLeftTab(tab);
                  }}
                  style={{
                    fontSize: '0.62rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '2px',
                    border: `1px solid ${leftTab === tab ? '#00e5ff' : '#1e293b'}`,
                    backgroundColor: leftTab === tab ? 'rgba(0, 229, 255, 0.2)' : 'transparent',
                    color: leftTab === tab ? '#00e5ff' : '#64748b',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Left Screen Body */}
          <div style={{ flex: 1, padding: '0.65rem 0.85rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {leftTab === 'telemetry' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', textAlign: 'center' }}>
                  <div style={{ background: 'rgba(11, 16, 24, 0.8)', border: '1px solid #1e293b', borderRadius: '3px', padding: '0.35rem' }}>
                    <div style={{ fontSize: '1rem', color: '#00e5ff', fontWeight: 700 }}>{gpuLoad}%</div>
                    <div style={{ fontSize: '0.58rem', color: '#64748b' }}>GPU CUDA</div>
                  </div>
                  <div style={{ background: 'rgba(11, 16, 24, 0.8)', border: '1px solid #1e293b', borderRadius: '3px', padding: '0.35rem' }}>
                    <div style={{ fontSize: '1rem', color: '#00e5ff', fontWeight: 700 }}>{cpuLoad}%</div>
                    <div style={{ fontSize: '0.58rem', color: '#64748b' }}>CPU ARM</div>
                  </div>
                  <div style={{ background: 'rgba(11, 16, 24, 0.8)', border: '1px solid #1e293b', borderRadius: '3px', padding: '0.35rem' }}>
                    <div style={{ fontSize: '1rem', color: '#e8a23a', fontWeight: 700 }}>{memLoad}%</div>
                    <div style={{ fontSize: '0.58rem', color: '#64748b' }}>RAM 8GB</div>
                  </div>
                  <div style={{ background: 'rgba(11, 16, 24, 0.8)', border: '1px solid #1e293b', borderRadius: '3px', padding: '0.35rem' }}>
                    <div style={{ fontSize: '1rem', color: '#34d399', fontWeight: 700 }}>{tempVal}°C</div>
                    <div style={{ fontSize: '0.58rem', color: '#64748b' }}>THERMAL</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(0, 229, 255, 0.15)', paddingTop: '0.45rem' }}>
                  <div style={{ fontSize: '0.62rem', color: '#64748b', marginBottom: '0.3rem' }}>ACTIVE INFERENCE PIPELINES:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.68rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                      <span>▸ EdgeDesk Fleet Daemon</span>
                      <span style={{ color: '#00e5ff' }}>TLS 1.3 / OK</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                      <span>▸ Crowd YOLOv8 Tracking</span>
                      <span style={{ color: '#34d399' }}>41.8 ms / CUDA</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                      <span>▸ Poultry Anomaly Detection</span>
                      <span style={{ color: '#e8a23a' }}>30 FPS RTSP</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                      <span>▸ On-Device Whisper & LLM</span>
                      <span style={{ color: '#00e5ff' }}>GGUF 4-Bit</span>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(0, 229, 255, 0.15)', paddingTop: '0.45rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem' }}>
                  <span style={{ color: '#64748b' }}>STATION: INDORE, MP, INDIA</span>
                  <span style={{ color: '#34d399' }}>● SYSTEM ONLINE</span>
                </div>
              </>
            )}

            {leftTab === 'hardware' && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ width: '130px', height: '100px', borderRadius: '3px', overflow: 'hidden', border: '1px solid #334155', flexShrink: 0 }}>
                  <img src="/nightfall/images/projects/jetson_hardware.jpg" alt="Jetson" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, fontSize: '0.68rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <div style={{ color: '#e8a23a', fontWeight: 700 }}>NVIDIA JETSON COMPUTE</div>
                  <div style={{ color: '#94a3b8' }}>• 6-Core ARM Cortex-A78AE</div>
                  <div style={{ color: '#94a3b8' }}>• 1024-Core NVIDIA Ampere GPU</div>
                  <div style={{ color: '#94a3b8' }}>• Ubuntu Linux (L4T) Runtime</div>
                  <div style={{ color: '#34d399' }}>• Watchdog Systemd Daemons</div>
                </div>
              </div>
            )}

            {leftTab === 'network' && (
              <div style={{ padding: '0.5rem', fontSize: '0.68rem', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ color: '#00e5ff', fontWeight: 700, marginBottom: '0.4rem' }}>ENCRYPTED EDGE TOPOLOGY</div>
                <div style={{ background: '#070a0e', border: '1px solid #1e293b', padding: '0.5rem', borderRadius: '3px' }}>
                  [ Client Web Browser ] ↔ [ TLS 1.3 WebSocket Broker ] ↔ [ Fleet NVIDIA Jetson Nano Nodes ]
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =======================================================================
         * 2. CENTER MONITOR (MASTER NJ-OS COMMAND CENTER)
         * Matches Image 3 & Image 1: Main screen operable by mouse!
         * ======================================================================= */}
        <div
          className="workstation-center-screen"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 900,
            height: 600,
            transformOrigin: '0 0',
            transform: centerTransform,
            backgroundColor: 'rgba(5, 9, 14, 0.96)',
            border: '2px solid rgba(232, 162, 58, 0.55)',
            boxShadow: '0 0 35px rgba(232, 162, 58, 0.35), inset 0 0 45px rgba(0, 0, 0, 0.85)',
            borderRadius: '5px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            color: '#e2e8f0',
            pointerEvents: 'auto',
          }}
        >
          {/* Top Bar with Monogram & Master Nav */}
          <div
            style={{
              padding: '0.55rem 1rem',
              background: 'rgba(10, 15, 22, 0.98)',
              borderBottom: '1px solid rgba(232, 162, 58, 0.35)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '3px',
                  border: '1.5px solid #e8a23a',
                  color: '#e8a23a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                }}
              >
                N
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>
                NJ-OS // COMMAND CENTER
              </span>
            </div>

            {/* In-Screen Navigation Tabs */}
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {(['home', 'projects', 'architecture', 'contact'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    sound.playUiClick();
                    setSelectedProjectSlug(null);
                    setCenterTab(tab);
                  }}
                  style={{
                    fontSize: '0.68rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '3px',
                    border: `1px solid ${centerTab === tab && !selectedProjectSlug ? '#e8a23a' : '#1e293b'}`,
                    backgroundColor: centerTab === tab && !selectedProjectSlug ? '#e8a23a' : 'rgba(15, 23, 42, 0.7)',
                    color: centerTab === tab && !selectedProjectSlug ? '#070a0e' : '#cbd5e1',
                    cursor: 'pointer',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  {tab === 'home' ? 'ABOUT' : tab}
                </button>
              ))}

              <button
                type="button"
                className="workstation-access-btn"
                onClick={() => handleLaunchFullOS('home')}
                style={{
                  fontSize: '0.68rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '3px',
                  border: '1px solid #00e5ff',
                  backgroundColor: 'rgba(0, 229, 255, 0.15)',
                  color: '#00e5ff',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
                title="Expand full screen terminal"
              >
                ACCESS COMPUTER WORKSTATION
              </button>
            </div>
          </div>

          {/* Center Screen Main Body */}
          <div style={{ flex: 1, padding: '1.1rem 1.4rem', overflowY: 'auto' }}>
            {/* If In-Place Project Intel Dossier is selected */}
            {selectedProjectSlug && activeProject ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#e8a23a', fontWeight: 700 }}>
                      COMMAND WORKSTATION INTEL DOSSIER
                    </div>
                    <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', margin: '0.2rem 0' }}>
                      {activeProject.title}
                    </h2>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => handleCycleProject(1)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        background: '#e8a23a',
                        color: '#070a0e',
                        border: 'none',
                        borderRadius: '3px',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                      }}
                    >
                      NEXT PROJECT →
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedProjectSlug(null)}
                      style={{
                        padding: '0.35rem 0.65rem',
                        background: 'transparent',
                        border: '1px solid #334155',
                        color: '#94a3b8',
                        borderRadius: '3px',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                      }}
                    >
                      CLOSE [ESC]
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {activeProject.stack.map((s) => (
                    <span key={s} style={{ fontSize: '0.66rem', background: '#0e1726', border: '1px solid #1e293b', padding: '0.15rem 0.5rem', borderRadius: '2px', color: '#00e5ff' }}>
                      {s}
                    </span>
                  ))}
                </div>

                <div style={{ background: '#090d14', border: '1px solid #1e293b', borderRadius: '4px', padding: '0.85rem' }}>
                  {activeProject.slug === 'edgedesk' && <EdgeDeskDiagram />}
                  {activeProject.slug === 'crowd-analytics' && <CrowdDiagram />}
                  {activeProject.slug === 'lora-traffic-mesh' && <LoRaDiagram />}
                  {activeProject.slug !== 'edgedesk' && activeProject.slug !== 'crowd-analytics' && activeProject.slug !== 'lora-traffic-mesh' && (
                    <div style={{ fontSize: '0.76rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                      {activeProject.description.map((d, i) => (
                        <p key={i} style={{ marginBottom: '0.4rem' }}>▸ {d}</p>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <a
                    href="https://github.com/jainnishant779"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.72rem', color: '#e8a23a', textDecoration: 'none', border: '1px solid rgba(232, 162, 58, 0.4)', padding: '0.35rem 0.75rem', borderRadius: '3px' }}
                  >
                    VIEW CODE (GITHUB) ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedProjectSlug(null)}
                    style={{ fontSize: '0.72rem', color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    ← RETURN TO OVERVIEW
                  </button>
                </div>
              </div>
            ) : centerTab === 'home' ? (
              /* HOME / ABOUT VIEW */
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <div style={{ width: '130px', height: '130px', borderRadius: '5px', overflow: 'hidden', border: '2px solid #e8a23a', flexShrink: 0, background: '#090d14' }}>
                  <img src="/nightfall/images/profile/nishant_avatar.jpg" alt="Nishant Jain" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h1 style={{ fontSize: '1.7rem', color: '#f8fafc', margin: 0, fontWeight: 700 }}>
                    NISHANT JAIN
                  </h1>
                  <div style={{ fontSize: '0.82rem', color: '#e8a23a', fontWeight: 700, marginTop: '0.2rem' }}>
                    AI/ML ENGINEER // COMPUTER VISION • EDGE AI • IOT
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#34d399', marginTop: '0.35rem' }}>
                    "{profile.tagline}"
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.5, marginTop: '0.45rem' }}>
                    {profile.summary}
                  </p>

                  <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.85rem' }}>
                    <button
                      type="button"
                      onClick={() => setCenterTab('projects')}
                      style={{ background: '#e8a23a', color: '#070a0e', border: 'none', padding: '0.45rem 1rem', borderRadius: '3px', fontWeight: 700, fontSize: '0.74rem', cursor: 'pointer' }}
                    >
                      EXPLORE PROJECTS →
                    </button>
                    <a
                      href={cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ border: '1px solid #e8a23a', color: '#e8a23a', padding: '0.45rem 0.9rem', borderRadius: '3px', fontSize: '0.74rem', textDecoration: 'none' }}
                    >
                      VIEW CV (PDF) ↗
                    </a>
                  </div>

                  {/* 4 Metrics Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid #1e293b', paddingTop: '0.75rem' }}>
                    <div style={{ background: '#090d14', border: '1px solid #1e293b', padding: '0.35rem 0.5rem', borderRadius: '3px' }}>
                      <div style={{ fontSize: '1.1rem', color: '#e8a23a', fontWeight: 700 }}>4+</div>
                      <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>YEARS EXP</div>
                    </div>
                    <div style={{ background: '#090d14', border: '1px solid #1e293b', padding: '0.35rem 0.5rem', borderRadius: '3px' }}>
                      <div style={{ fontSize: '1.1rem', color: '#00e5ff', fontWeight: 700 }}>10+</div>
                      <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>PROJECTS</div>
                    </div>
                    <div style={{ background: '#090d14', border: '1px solid #1e293b', padding: '0.35rem 0.5rem', borderRadius: '3px' }}>
                      <div style={{ fontSize: '1.1rem', color: '#34d399', fontWeight: 700 }}>3</div>
                      <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>DOMAINS: AI·CV·EDGE</div>
                    </div>
                    <div style={{ background: '#090d14', border: '1px solid #1e293b', padding: '0.35rem 0.5rem', borderRadius: '3px' }}>
                      <div style={{ fontSize: '1.1rem', color: '#e8a23a', fontWeight: 700 }}>1</div>
                      <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>PATENT APP</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : centerTab === 'projects' ? (
              /* PROJECTS GRID VIEW */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#e8a23a', fontWeight: 700 }}>02 // PROJECT ARCHIVES</div>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    {['All', 'AI/ML', 'Computer Vision', 'Edge AI', 'IoT'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setProjectCategory(cat)}
                        style={{
                          fontSize: '0.62rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '2px',
                          border: `1px solid ${projectCategory === cat ? '#e8a23a' : '#232a35'}`,
                          backgroundColor: projectCategory === cat ? '#e8a23a' : '#0b1016',
                          color: projectCategory === cat ? '#070a0e' : '#94a3b8',
                          cursor: 'pointer',
                          fontWeight: 700,
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
                  {filteredProjects.map((p) => (
                    <div
                      key={p.slug}
                      onClick={() => handleSelectScreenInPlace({
                        id: p.slug,
                        slug: p.slug,
                        module: 'projects',
                        title: p.title,
                        shortTitle: p.title.split(':')[0],
                        badge: p.badge,
                        metrics: p.stack.slice(0, 3).join(' · '),
                        tech: p.stack,
                        keyNum: '1',
                      })}
                      style={{
                        background: 'rgba(14, 20, 28, 0.9)',
                        border: '1px solid #1e293b',
                        borderRadius: '4px',
                        padding: '0.65rem',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = '#00e5ff')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = '#1e293b')}
                    >
                      <div style={{ fontSize: '0.64rem', color: '#e8a23a', fontWeight: 700 }}>{p.badge}</div>
                      <div style={{ fontSize: '0.8rem', color: '#f8fafc', fontWeight: 700, margin: '0.2rem 0' }}>{p.title}</div>
                      <div style={{ fontSize: '0.62rem', color: '#64748b' }}>{p.stack.join(' · ')}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : centerTab === 'architecture' ? (
              /* SYSTEMS LAB VIEW */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.74rem', color: '#00e5ff', fontWeight: 700 }}>
                  08 // SYSTEMS ARCHITECTURE SCHEMATICS
                </div>
                <EdgeDeskDiagram />
              </div>
            ) : (
              /* CONTACT TRANSMISSION VIEW */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxWidth: '520px' }}>
                <div style={{ fontSize: '0.74rem', color: '#e8a23a', fontWeight: 700 }}>
                  07 // TRANSMISSION PROTOCOL
                </div>
                <input
                  type="text"
                  placeholder="CALLSIGN / NAME"
                  style={{ background: '#0b1016', border: '1px solid #1e293b', color: '#f8fafc', padding: '0.45rem', fontSize: '0.72rem', borderRadius: '3px' }}
                />
                <input
                  type="email"
                  placeholder="COMM FREQ / EMAIL"
                  style={{ background: '#0b1016', border: '1px solid #1e293b', color: '#f8fafc', padding: '0.45rem', fontSize: '0.72rem', borderRadius: '3px' }}
                />
                <textarea
                  rows={3}
                  placeholder="TRANSMISSION MESSAGE"
                  style={{ background: '#0b1016', border: '1px solid #1e293b', color: '#f8fafc', padding: '0.45rem', fontSize: '0.72rem', borderRadius: '3px', resize: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => sound.playAccessBeep()}
                  style={{ background: '#e8a23a', color: '#070a0e', border: 'none', padding: '0.45rem', borderRadius: '3px', fontWeight: 700, fontSize: '0.74rem', cursor: 'pointer' }}
                >
                  TRANSMIT MESSAGE ↵
                </button>
              </div>
            )}
          </div>
        </div>

        {/* =======================================================================
         * 3. RIGHT MONITOR (QUICK ACCESS & EXPERIENCE JOURNEY)
         * ======================================================================= */}
        <div
          className="workstation-right-screen"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 600,
            height: 380,
            transformOrigin: '0 0',
            transform: rightTransform,
            backgroundColor: 'rgba(5, 10, 16, 0.94)',
            border: '1.5px solid rgba(0, 229, 255, 0.4)',
            boxShadow: '0 0 25px rgba(0, 229, 255, 0.25), inset 0 0 35px rgba(0, 0, 0, 0.8)',
            borderRadius: '4px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            color: '#e2e8f0',
            pointerEvents: 'auto',
          }}
        >
          {/* Top Title & Sub-tabs */}
          <div
            style={{
              padding: '0.45rem 0.75rem',
              background: 'rgba(9, 14, 22, 0.98)',
              borderBottom: '1px solid rgba(0, 229, 255, 0.25)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: '0.68rem', color: '#00e5ff', fontWeight: 700, letterSpacing: '0.04em' }}>
              ● MON-03 // CHANNELS & HISTORY
            </div>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              {(['quick', 'experience', 'honors'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    sound.playUiClick();
                    setRightTab(tab);
                  }}
                  style={{
                    fontSize: '0.62rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '2px',
                    border: `1px solid ${rightTab === tab ? '#00e5ff' : '#1e293b'}`,
                    backgroundColor: rightTab === tab ? 'rgba(0, 229, 255, 0.2)' : 'transparent',
                    color: rightTab === tab ? '#00e5ff' : '#64748b',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Right Screen Body */}
          <div style={{ flex: 1, padding: '0.65rem 0.85rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {rightTab === 'quick' && (
              <>
                <div style={{ fontSize: '0.64rem', color: '#64748b' }}>DIRECT ACCESS CHANNELS:</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
                  <a
                    href={cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ background: '#0b1016', border: '1px solid #1e293b', color: '#e8a23a', padding: '0.35rem 0.5rem', fontSize: '0.68rem', borderRadius: '3px', textDecoration: 'none', textAlign: 'center', fontWeight: 700 }}
                  >
                    📄 CV (PDF) ↗
                  </a>
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ background: '#0b1016', border: '1px solid #1e293b', color: '#cbd5e1', padding: '0.35rem 0.5rem', fontSize: '0.68rem', borderRadius: '3px', textDecoration: 'none', textAlign: 'center' }}
                  >
                    🐙 GitHub ↗
                  </a>
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ background: '#0b1016', border: '1px solid #1e293b', color: '#cbd5e1', padding: '0.35rem 0.5rem', fontSize: '0.68rem', borderRadius: '3px', textDecoration: 'none', textAlign: 'center' }}
                  >
                    💼 LinkedIn ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playAccessBeep();
                      useStore.getState().setMode('suit-inspect');
                    }}
                    style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', color: '#34d399', padding: '0.35rem 0.5rem', fontSize: '0.68rem', borderRadius: '3px', cursor: 'pointer', textAlign: 'center', fontWeight: 700 }}
                  >
                    🛡️ Suit Vault [3D]
                  </button>
                </div>

                <div style={{ borderTop: '1px solid rgba(0, 229, 255, 0.15)', paddingTop: '0.45rem' }}>
                  <div style={{ fontSize: '0.62rem', color: '#64748b', marginBottom: '0.3rem' }}>CLICK TO LOAD INTO CENTER SCREEN:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {SCREENS.slice(0, 4).map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectScreenInPlace(s)}
                        style={{
                          background: selectedProjectSlug === s.slug ? 'rgba(0, 229, 255, 0.2)' : 'transparent',
                          border: `1px solid ${selectedProjectSlug === s.slug ? '#00e5ff' : '#1e293b'}`,
                          color: selectedProjectSlug === s.slug ? '#00e5ff' : '#cbd5e1',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '2px',
                          fontSize: '0.64rem',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>FILE 0{s.keyNum} // {s.shortTitle}</span>
                        <span style={{ color: '#e8a23a' }}>LOAD ↵</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {rightTab === 'experience' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.66rem' }}>
                {experiences.map((exp, idx) => (
                  <div key={idx} style={{ borderLeft: '2px solid #00e5ff', paddingLeft: '0.5rem' }}>
                    <div style={{ color: '#f8fafc', fontWeight: 700 }}>{exp.role}</div>
                    <div style={{ color: '#e8a23a' }}>{exp.company} // {exp.period}</div>
                  </div>
                ))}
              </div>
            )}

            {rightTab === 'honors' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.66rem' }}>
                <div style={{ color: '#00e5ff', fontWeight: 700, fontSize: '0.62rem', letterSpacing: '0.05em' }}>HONORS & AWARDS</div>
                {achievements.map((a, idx) => (
                  <div key={idx} style={{ background: '#0b1016', border: '1px solid #1e293b', padding: '0.35rem 0.5rem', borderRadius: '3px' }}>
                    <div style={{ color: '#e8a23a', fontWeight: 700 }}>{a.title}</div>
                    {a.detail && <div style={{ color: '#94a3b8' }}>{a.detail}</div>}
                  </div>
                ))}
                <div style={{ color: '#00e5ff', fontWeight: 700, fontSize: '0.62rem', letterSpacing: '0.05em', marginTop: '0.2rem' }}>CREDENTIALS</div>
                {certifications.map((c, idx) => (
                  <div key={idx} style={{ background: '#0b1016', border: '1px solid #1e293b', padding: '0.35rem 0.5rem', borderRadius: '3px' }}>
                    <div style={{ color: '#f8fafc', fontWeight: 700 }}>{c.title}</div>
                    <div style={{ color: '#7fb38a' }}>{c.issuer}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* =======================================================================
         * 4. DESK CONSOLE CONTROL STRIP (PHYSICAL DESK LEVEL)
         * Keeps full compatibility with test selectors: [1] POULTRY HEALTH AI, etc.
         * ======================================================================= */}
        <div
          className="film-screen-hud"
          style={{
            position: 'absolute',
            bottom: '1.2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(9, 14, 22, 0.95)',
            border: '1px solid rgba(0, 229, 255, 0.4)',
            padding: '0.55rem 1.1rem',
            borderRadius: '5px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(0, 229, 255, 0.1)',
            zIndex: 40,
            pointerEvents: 'auto',
          }}
        >
          <div style={{ fontSize: '0.64rem', color: '#00e5ff', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00e5ff', boxShadow: '0 0 6px #00e5ff' }} />
            TRIPLE-DISPLAY COMPUTER ACTIVE // MOUSE INPUT ENGAGED // CAVERN COMMUNICATING
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {SCREENS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectScreenInPlace(s)}
                style={{
                  padding: '0.25rem 0.55rem',
                  backgroundColor: selectedProjectSlug === s.slug ? 'rgba(0, 229, 255, 0.3)' : 'rgba(0, 229, 255, 0.08)',
                  border: selectedProjectSlug === s.slug ? '1px solid #00e5ff' : '1px solid rgba(0, 229, 255, 0.25)',
                  color: selectedProjectSlug === s.slug ? '#00e5ff' : '#cbd5e1',
                  fontSize: '0.64rem',
                  fontWeight: 700,
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s ease',
                }}
              >
                [{s.keyNum}] {s.shortTitle}
              </button>
            ))}

            <button
              type="button"
              onClick={() => {
                sound.playAccessBeep();
                useStore.getState().setMode('suit-inspect');
              }}
              style={{
                padding: '0.25rem 0.65rem',
                backgroundColor: 'rgba(127, 179, 138, 0.15)',
                border: '1px solid #7fb38a',
                color: '#7fb38a',
                fontSize: '0.64rem',
                fontWeight: 700,
                borderRadius: '2px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
              title="Inspect 3D Warden Exoskeleton Suit Chamber"
            >
              🛡️ SUIT VAULT [3D]
            </button>

            {selectedProjectSlug && (
              <button
                type="button"
                onClick={() => setSelectedProjectSlug(null)}
                style={{
                  padding: '0.25rem 0.65rem',
                  backgroundColor: 'rgba(232, 162, 58, 0.18)',
                  border: '1px solid #e8a23a',
                  color: '#e8a23a',
                  fontSize: '0.64rem',
                  fontWeight: 700,
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                CLOSE [ESC]
              </button>
            )}
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
            animation: 'filmZoomFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
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
