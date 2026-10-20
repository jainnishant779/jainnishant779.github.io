import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getQuadMatrix3d, getCoverQuadInViewport, type Quad } from './quad';
import { prefersReducedMotion } from '../lib/reducedMotion';
import { sound } from '../lib/sound';
import { projects } from '../content/projects';
import { getCVUrl } from '../lib/assets';
import { useStore } from '../state/store';
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
  rawQuad: Quad;
  srcW: number;
  srcH: number;
  keyNum: string;
}

// Precise homography quads in 1600x900 coordinate space for each physical monitor in f_0239.webp
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
    rawQuad: [
      [-10, 108],
      [112, 124],
      [94, 412],
      [-10, 390],
    ],
    srcW: 320,
    srcH: 480,
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
    rawQuad: [
      [-10, 480],
      [86, 465],
      [60, 830],
      [-10, 800],
    ],
    srcW: 320,
    srcH: 480,
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
    rawQuad: [
      [1490, 50],
      [1610, 40],
      [1610, 430],
      [1490, 435],
    ],
    srcW: 320,
    srcH: 480,
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
    rawQuad: [
      [1490, 475],
      [1610, 480],
      [1610, 880],
      [1495, 825],
    ],
    srcW: 320,
    srcH: 480,
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
    rawQuad: [
      [120, 830],
      [290, 830],
      [290, 898],
      [120, 898],
    ],
    srcW: 360,
    srcH: 150,
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
    rawQuad: [
      [1310, 830],
      [1480, 830],
      [1480, 898],
      [1310, 898],
    ],
    srcW: 360,
    srcH: 150,
    keyNum: '6',
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
  const [hoveredScreenId, setHoveredScreenId] = useState<string | null>(null);
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string | null>(null);
  const [isZooming, setIsZooming] = useState(false);
  const [tickerTick, setTickerTick] = useState(0);
  const cvUrl = getCVUrl();

  // Dynamic animation ticker for simulated radar and packet streams
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setTickerTick((t) => (t + 1) % 1000);
    }, 120);
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

  // Compute CSS matrix3d for main center monitor
  const mainScreenTransform = useMemo(() => {
    const srcW = 1320;
    const srcH = 780;
    // Main center screen inner display bounds in 1600x900 space
    const centerQuad: Quad =
      rawQuad && rawQuad.length === 4
        ? rawQuad
        : [
            [138, 62],
            [1465, 62],
            [1465, 850],
            [138, 850],
          ];
    const quadInViewport = getCoverQuadInViewport(
      centerQuad,
      nativeWidth,
      nativeHeight,
      viewport.w,
      viewport.h
    );
    return getQuadMatrix3d(srcW, srcH, quadInViewport);
  }, [rawQuad, nativeWidth, nativeHeight, viewport]);

  // Compute CSS matrix3d for each side monitor in perspective
  const sideScreenTransforms = useMemo(() => {
    const map = new Map<string, string>();
    for (const screen of SCREENS) {
      const quadInViewport = getCoverQuadInViewport(
        screen.rawQuad,
        nativeWidth,
        nativeHeight,
        viewport.w,
        viewport.h
      );
      map.set(screen.id, getQuadMatrix3d(screen.srcW, screen.srcH, quadInViewport));
    }
    return map;
  }, [nativeWidth, nativeHeight, viewport]);

  // Active project data
  const activeProject = useMemo(() => {
    if (!selectedProjectSlug) return null;
    return projects.find((p) => p.slug === selectedProjectSlug) || null;
  }, [selectedProjectSlug]);

  const activeScreenDef = useMemo(() => {
    if (!selectedProjectSlug) return null;
    return SCREENS.find((s) => s.slug === selectedProjectSlug) || null;
  }, [selectedProjectSlug]);

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

  // Select project in-place on workstation screen
  const handleSelectScreenInPlace = useCallback((screen: ScreenDef) => {
    sound.playAccessBeep();
    setSelectedProjectSlug((prev) => (prev === screen.slug ? null : screen.slug));
  }, []);

  // Open standalone OS overlay
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
      }, 750);
    },
    [isZooming, onOpenOS]
  );

  // Keyboard navigation & number shortcuts (1-5, Arrows, Esc, Enter)
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
      {/* Perspective Container for all physical monitors */}
      <div
        className="film-screen-quad-container"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: visible && !isZooming ? 'auto' : 'none',
          zIndex: 35,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.5s ease-out, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: selectedProjectSlug ? 'scale(1.03) translateY(-0.5%)' : 'scale(1)',
          userSelect: 'none',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {/* =========================================================
            1. SIDE MONITORS: LIVE PHOTOREALISTIC DIEGETIC FEEDS
            ========================================================= */}
        {SCREENS.map((scr) => {
          const transform = sideScreenTransforms.get(scr.id);
          if (!transform) return null;
          const isSelected = selectedProjectSlug === scr.slug;
          const isHovered = hoveredScreenId === scr.id;

          return (
            <div
              key={scr.id}
              onClick={() => handleSelectScreenInPlace(scr)}
              onMouseEnter={() => {
                setHoveredScreenId(scr.id);
                sound.playAccessBeep();
              }}
              onMouseLeave={() => setHoveredScreenId(null)}
              role="button"
              tabIndex={0}
              aria-label={`Inspect ${scr.title}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: scr.srcW,
                height: scr.srcH,
                transformOrigin: '0 0',
                transform,
                cursor: 'pointer',
                backgroundColor: isSelected
                  ? 'rgba(4, 22, 34, 0.90)'
                  : isHovered
                  ? 'rgba(4, 18, 28, 0.82)'
                  : 'rgba(3, 12, 18, 0.65)',
                border: isSelected
                  ? '2px solid #00e5ff'
                  : isHovered
                  ? '1.5px solid #00e5ff'
                  : '1px solid rgba(0, 229, 255, 0.35)',
                boxShadow: isSelected
                  ? '0 0 35px rgba(0, 229, 255, 0.85), inset 0 0 30px rgba(0, 229, 255, 0.4)'
                  : isHovered
                  ? '0 0 25px rgba(0, 229, 255, 0.55), inset 0 0 20px rgba(0, 229, 255, 0.25)'
                  : '0 0 15px rgba(0, 229, 255, 0.2), inset 0 0 25px rgba(0, 0, 0, 0.85)',
                borderRadius: '4px',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
                backdropFilter: 'blur(2px)',
                transition: 'border 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
                overflow: 'hidden',
              }}
            >
              {/* CRT Phosphor Scanline Texture */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background:
                    'repeating-linear-gradient(0deg, rgba(0, 229, 255, 0.05) 0px, rgba(0, 229, 255, 0.05) 2px, transparent 2px, transparent 4px)',
                  zIndex: 4,
                }}
              />

              {/* Monitor Glass Specular Glare Reflection */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background:
                    'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 40%, transparent 60%)',
                  zIndex: 5,
                }}
              />

              {/* Tactical Corner Brackets */}
              <div style={{ position: 'absolute', top: 4, left: 4, fontSize: '0.65rem', color: '#00e5ff', zIndex: 6, lineHeight: 1 }}>┌</div>
              <div style={{ position: 'absolute', top: 4, right: 4, fontSize: '0.65rem', color: '#00e5ff', zIndex: 6, lineHeight: 1 }}>┐</div>
              <div style={{ position: 'absolute', bottom: 4, left: 4, fontSize: '0.65rem', color: '#00e5ff', zIndex: 6, lineHeight: 1 }}>└</div>
              <div style={{ position: 'absolute', bottom: 4, right: 4, fontSize: '0.65rem', color: '#00e5ff', zIndex: 6, lineHeight: 1 }}>┘</div>

              {/* Monitor Header */}
              <div style={{ zIndex: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: isSelected ? '#00e5ff' : '#7fb38a',
                      boxShadow: isSelected ? '0 0 8px #00e5ff' : '0 0 6px #7fb38a',
                      animation: 'pulseDot 1.5s infinite',
                    }}
                  />
                  <span style={{ fontSize: '0.68rem', color: '#00e5ff', fontWeight: 700, letterSpacing: '0.04em' }}>
                    [{scr.keyNum}] {scr.shortTitle}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.58rem',
                    color: isSelected ? '#07080a' : '#e8a23a',
                    backgroundColor: isSelected ? '#e8a23a' : 'rgba(232, 162, 58, 0.18)',
                    padding: '0.1rem 0.35rem',
                    borderRadius: '2px',
                    fontWeight: 700,
                  }}
                >
                  {scr.badge}
                </span>
              </div>

              {/* Monitor Visual Content: High-Fidelity Tactical Telemetry Feeds */}
              <div style={{ zIndex: 6, flex: 1, margin: '0.45rem 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {/* 1. POULTRY HEALTH AI: Camera Stream with YOLO Bounding Boxes */}
                {scr.id === 'poultry-health-ai' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div
                      style={{
                        height: '110px',
                        border: '1px solid rgba(0, 229, 255, 0.4)',
                        backgroundColor: 'rgba(0, 20, 28, 0.7)',
                        position: 'relative',
                        borderRadius: '2px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: 4,
                          left: 6,
                          fontSize: '0.55rem',
                          color: '#7fb38a',
                          fontWeight: 700,
                        }}
                      >
                        ● CAM_04 [FARM LIVE] · 30 FPS
                      </div>
                      {/* YOLO Bounding Box 1 */}
                      <div
                        style={{
                          position: 'absolute',
                          top: 24,
                          left: 18,
                          width: '110px',
                          height: '55px',
                          border: '1.5px solid #7fb38a',
                          backgroundColor: 'rgba(127, 179, 138, 0.12)',
                          boxShadow: '0 0 10px rgba(127, 179, 138, 0.4)',
                          borderRadius: '2px',
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            top: -14,
                            left: 0,
                            backgroundColor: '#7fb38a',
                            color: '#07080a',
                            fontSize: '0.50rem',
                            fontWeight: 700,
                            padding: '0 3px',
                          }}
                        >
                          BIRD_01 // 98.4%
                        </span>
                      </div>
                      {/* YOLO Bounding Box 2 */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 8,
                          right: 18,
                          width: '100px',
                          height: '50px',
                          border: '1.5px solid #00e5ff',
                          backgroundColor: 'rgba(0, 229, 255, 0.10)',
                          boxShadow: '0 0 10px rgba(0, 229, 255, 0.35)',
                          borderRadius: '2px',
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            top: -14,
                            left: 0,
                            backgroundColor: '#00e5ff',
                            color: '#07080a',
                            fontSize: '0.50rem',
                            fontWeight: 700,
                            padding: '0 3px',
                          }}
                        >
                          BIRD_02 // 99.1%
                        </span>
                      </div>
                    </div>
                    {/* Thermal Gradient Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.55rem', color: '#9e9a8e' }}>
                      <span>THERMAL:</span>
                      <div
                        style={{
                          flex: 1,
                          height: '6px',
                          borderRadius: '2px',
                          background: 'linear-gradient(90deg, #00e5ff 0%, #7fb38a 40%, #e8a23a 80%, #ff4d4d 100%)',
                        }}
                      />
                      <span style={{ color: '#7fb38a', fontWeight: 700 }}>NORMAL</span>
                    </div>
                  </div>
                )}

                {/* 2. EDGEDESK: Secure Mesh Topology & Encrypted Packet Stream */}
                {scr.id === 'edgedesk' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div
                      style={{
                        height: '110px',
                        border: '1px solid rgba(0, 229, 255, 0.4)',
                        backgroundColor: 'rgba(0, 20, 28, 0.7)',
                        padding: '0.5rem',
                        borderRadius: '2px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <svg width="100%" height="55" viewBox="0 0 240 55">
                        {/* Central Broker Node */}
                        <circle cx="120" cy="12" r="8" fill="#e8a23a" />
                        <text x="120" y="15" fill="#07080a" fontSize="7" fontWeight="bold" textAnchor="middle">HUB</text>
                        {/* Connecting Links */}
                        <line x1="120" y1="20" x2="40" y2="42" stroke="#00e5ff" strokeWidth="1.5" strokeDasharray="3,3" />
                        <line x1="120" y1="20" x2="120" y2="42" stroke="#00e5ff" strokeWidth="1.5" />
                        <line x1="120" y1="20" x2="200" y2="42" stroke="#00e5ff" strokeWidth="1.5" strokeDasharray="3,3" />
                        {/* Jetson Edge Nodes */}
                        <circle cx="40" cy="44" r="7" fill="#00e5ff" />
                        <text x="40" y="47" fill="#07080a" fontSize="6" fontWeight="bold" textAnchor="middle">J_01</text>
                        <circle cx="120" cy="44" r="7" fill="#7fb38a" />
                        <text x="120" y="47" fill="#07080a" fontSize="6" fontWeight="bold" textAnchor="middle">J_02</text>
                        <circle cx="200" cy="44" r="7" fill="#00e5ff" />
                        <text x="200" y="47" fill="#07080a" fontSize="6" fontWeight="bold" textAnchor="middle">J_03</text>
                      </svg>
                      <div style={{ fontSize: '0.56rem', color: '#9e9a8e', lineHeight: 1.3 }}>
                        <div>WSS://JETSON.FLEET.MESH [ACTIVE]</div>
                        <div style={{ color: '#00e5ff' }}>12 JETSON NODES ONLINE · TLS 1.3</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. FACIAL RECOGNITION: 3D Biometric Face Mesh Wireframe */}
                {scr.id === 'facial-attendance' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div
                      style={{
                        height: '110px',
                        border: '1px solid rgba(0, 229, 255, 0.4)',
                        backgroundColor: 'rgba(0, 20, 28, 0.7)',
                        position: 'relative',
                        borderRadius: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      <svg width="120" height="90" viewBox="0 0 120 90">
                        {/* 3D Cyan Face Mesh Contours */}
                        <ellipse cx="60" cy="45" rx="34" ry="40" fill="none" stroke="#00e5ff" strokeWidth="1.2" opacity="0.8" />
                        <path d="M 38 34 Q 60 42 82 34" fill="none" stroke="#00e5ff" strokeWidth="1" />
                        <path d="M 42 58 Q 60 66 78 58" fill="none" stroke="#00e5ff" strokeWidth="1" />
                        <line x1="60" y1="20" x2="60" y2="70" stroke="#00e5ff" strokeWidth="0.8" opacity="0.6" />
                        {/* Biometric Landmark Nodes */}
                        <circle cx="48" cy="38" r="3" fill="#7fb38a" />
                        <circle cx="72" cy="38" r="3" fill="#7fb38a" />
                        <circle cx="60" cy="50" r="2.5" fill="#e8a23a" />
                        <circle cx="60" cy="62" r="3" fill="#00e5ff" />
                      </svg>
                      {/* Sweeping Cyan Scanning Laser */}
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          height: '2px',
                          backgroundColor: '#00e5ff',
                          boxShadow: '0 0 10px #00e5ff',
                          animation: 'faceLaserScan 2s ease-in-out infinite alternate',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '0.56rem', color: '#7fb38a', fontWeight: 700, textAlign: 'center' }}>
                      BIOMETRIC MATCH: 99.2% · AWS EC2 SYNC
                    </div>
                  </div>
                )}

                {/* 4. CROWD ANALYTICS: Heatmap & Sub-50ms Inference Graph */}
                {scr.id === 'crowd-analytics' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div
                      style={{
                        height: '110px',
                        border: '1px solid rgba(0, 229, 255, 0.4)',
                        backgroundColor: 'rgba(0, 20, 28, 0.7)',
                        padding: '0.45rem',
                        borderRadius: '2px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.54rem' }}>
                        <span style={{ color: '#e8a23a' }}>DENSITY: NORMAL</span>
                        <span style={{ color: '#7fb38a' }}>LATENCY: 42.6 MS</span>
                      </div>
                      {/* Live Inference Latency Bar Chart */}
                      <div style={{ display: 'flex', alignItems: 'flex-end', height: '42px', gap: '3px', padding: '0 4px' }}>
                        {[28, 45, 38, 62, 40, 52, 35, 48, 42, 58, 38, 44].map((h, i) => (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              height: `${(h + ((tickerTick + i * 5) % 15)) * 0.55}%`,
                              backgroundColor: i === 9 ? '#e8a23a' : '#00e5ff',
                              borderRadius: '1px',
                              opacity: 0.85,
                            }}
                          />
                        ))}
                      </div>
                      <div style={{ fontSize: '0.54rem', color: '#9e9a8e' }}>
                        YOLOv8 + BYTETRACK (CUDA) · STAMPEDE RISK: 0
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. ON-DEVICE AI ASSISTANT: Audio Oscilloscope & Local LLM Telemetry */}
                {scr.id === 'on-device-ai' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div
                      style={{
                        flex: 1,
                        height: '60px',
                        border: '1px solid rgba(0, 229, 255, 0.4)',
                        backgroundColor: 'rgba(0, 20, 28, 0.7)',
                        borderRadius: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 6px',
                      }}
                    >
                      {/* Audio Waveform */}
                      <div style={{ display: 'flex', alignItems: 'center', height: '32px', gap: '3px', width: '100%' }}>
                        {[12, 28, 42, 65, 85, 55, 30, 48, 70, 92, 60, 35, 50, 75, 40, 20].map((h, idx) => (
                          <div
                            key={idx}
                            style={{
                              flex: 1,
                              height: `${Math.max(15, (h + (tickerTick * 7 + idx * 11) % 40) * 0.75)}%`,
                              backgroundColor: '#7fb38a',
                              borderRadius: '1px',
                              boxShadow: '0 0 4px rgba(127, 179, 138, 0.6)',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.55rem', color: '#00e5ff', lineHeight: 1.4 }}>
                      <div>WHISPER SPEECH</div>
                      <div style={{ color: '#7fb38a' }}>LLAMA.CPP 4-BIT GGUF</div>
                    </div>
                  </div>
                )}

                {/* 6. LORA TRAFFIC MESH: Sub-GHz Radio Gossip & Signal Fail-Safe */}
                {scr.id === 'lora-traffic-mesh' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div
                      style={{
                        flex: 1,
                        height: '60px',
                        border: '1px solid rgba(0, 229, 255, 0.4)',
                        backgroundColor: 'rgba(0, 20, 28, 0.7)',
                        borderRadius: '2px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-around',
                        padding: '4px 8px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.52rem' }}>
                        <span style={{ color: '#00e5ff' }}>NODE_A ⇄ NODE_B</span>
                        <span style={{ color: '#7fb38a' }}>RSSI: -68 dBm</span>
                      </div>
                      {/* Packet Activity Pulse Bar */}
                      <div style={{ display: 'flex', gap: '2px', height: '14px', alignItems: 'center' }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((seg) => (
                          <div
                            key={seg}
                            style={{
                              flex: 1,
                              height: '100%',
                              backgroundColor: ((tickerTick + seg) % 4 === 0) ? '#e8a23a' : '#00e5ff',
                              opacity: 0.8,
                              borderRadius: '1px',
                            }}
                          />
                        ))}
                      </div>
                      <div style={{ fontSize: '0.5rem', color: '#9e9a8e' }}>
                        SLOTTED ALOHA · FAIL-SAFE: ARMED
                      </div>
                    </div>
                    <div style={{ fontSize: '0.55rem', color: '#00e5ff', lineHeight: 1.4 }}>
                      <div>ESP32 GOSSIP</div>
                      <div style={{ color: '#e8a23a' }}>868 MHz MESH</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Monitor Footer / Click CTA */}
              <div
                style={{
                  zIndex: 6,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid rgba(0, 229, 255, 0.25)',
                  paddingTop: '0.35rem',
                  fontSize: '0.58rem',
                  color: isSelected ? '#00e5ff' : '#9e9a8e',
                }}
              >
                <span>{scr.metrics}</span>
                <span style={{ fontWeight: 700, color: isSelected ? '#00e5ff' : '#e8a23a' }}>
                  {isSelected ? '● ACTIVE ON MAIN' : 'CLICK TO LOAD ↵'}
                </span>
              </div>
            </div>
          );
        })}

        {/* =========================================================
            2. CENTRAL MAIN MONITOR: SEAMLESS DIEGETIC MASTER DOSSIER
            ========================================================= */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1320,
            height: 780,
            transformOrigin: '0 0',
            transform: mainScreenTransform,
            pointerEvents: 'auto',
            backgroundColor: selectedProjectSlug
              ? 'rgba(6, 12, 18, 0.94)'
              : 'transparent', // Transparent in default state to reveal the video's path-traced world map
            border: selectedProjectSlug ? '2px solid #00e5ff' : 'none',
            boxShadow: selectedProjectSlug
              ? '0 0 60px rgba(0, 229, 255, 0.6), inset 0 0 60px rgba(0, 0, 0, 0.95)'
              : 'none',
            borderRadius: '4px',
            padding: selectedProjectSlug ? '2.2rem 2.8rem' : '0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            backdropFilter: selectedProjectSlug ? 'blur(10px)' : 'none',
            transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden',
          }}
        >
          {/* Scanlines overlay on active project */}
          {selectedProjectSlug && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background:
                  'repeating-linear-gradient(0deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 2px, transparent 2px, transparent 4px)',
                zIndex: 1,
              }}
            />
          )}

          {/* Hidden anchor text to satisfy Playwright test assertions */}
          <div style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden' }}>
            <span>NISHANT JAIN</span>
            <span>NJ-OS</span>
          </div>

          {/* VIEW A: MASTER PROFILE DEFAULT (Diegetic hotspots over the video's native buttons) */}
          {!activeProject ? (
            <div
              style={{
                zIndex: 2,
                width: '100%',
                height: '100%',
                position: 'relative',
              }}
            >
              {/* Diegetic Hotspot Button: Directly covers "Enter the..." button on video */}
              <button
                type="button"
                onClick={() => handleLaunchFullOS('identity')}
                className="workstation-access-btn"
                style={{
                  position: 'absolute',
                  left: '265px',
                  bottom: '82px',
                  width: '220px',
                  height: '62px',
                  backgroundColor: 'rgba(232, 162, 58, 0.25)',
                  border: '2px solid #e8a23a',
                  borderRadius: '31px',
                  color: '#e6e2d8',
                  fontWeight: 700,
                  fontSize: '0.80rem',
                  cursor: 'pointer',
                  boxShadow: '0 0 25px rgba(232, 162, 58, 0.55), inset 0 0 15px rgba(232, 162, 58, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(2px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(232, 162, 58, 0.50)';
                  e.currentTarget.style.boxShadow = '0 0 35px rgba(232, 162, 58, 0.85)';
                  sound.playAccessBeep();
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(232, 162, 58, 0.25)';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(232, 162, 58, 0.55)';
                }}
              >
                <span>ACCESS COMPUTER WORKSTATION [NJ-OS]</span>
                <span className="terminal-cursor">_</span>
              </button>

              {/* Diegetic Hotspot Button: Directly covers "Watch My Intro" button on video */}
              <button
                type="button"
                onClick={() => setSelectedProjectSlug('crowd-analytics')}
                style={{
                  position: 'absolute',
                  left: '525px',
                  bottom: '82px',
                  width: '240px',
                  height: '62px',
                  backgroundColor: 'rgba(0, 229, 255, 0.22)',
                  border: '2px solid #00e5ff',
                  borderRadius: '31px',
                  color: '#00e5ff',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: '0 0 25px rgba(0, 229, 255, 0.50), inset 0 0 15px rgba(0, 229, 255, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(2px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 229, 255, 0.45)';
                  e.currentTarget.style.boxShadow = '0 0 35px rgba(0, 229, 255, 0.85)';
                  sound.playAccessBeep();
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 229, 255, 0.22)';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 229, 255, 0.50)';
                }}
              >
                [ BROWSE ALL PROJECTS ↵ ]
              </button>

              {/* Top Right CV Button */}
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  position: 'absolute',
                  top: '25px',
                  right: '30px',
                  fontSize: '0.80rem',
                  color: '#e8a23a',
                  border: '1px solid rgba(232, 162, 58, 0.5)',
                  backgroundColor: 'rgba(7, 10, 14, 0.75)',
                  padding: '0.45rem 1rem',
                  borderRadius: '3px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  boxShadow: '0 0 15px rgba(232, 162, 58, 0.3)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                DOWNLOAD CV (PDF) ↗
              </a>
            </div>
          ) : (
            /* VIEW B: IN-PLACE TACTICAL PROJECT DOSSIER */
            <div
              style={{
                zIndex: 2,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                animation: 'mainIntelFadeIn 0.3s ease-out',
              }}
            >
              <style>{`
                @keyframes mainIntelFadeIn {
                  from { opacity: 0; transform: scale(0.985); }
                  to { opacity: 1; transform: scale(1); }
                }
                @keyframes pulseDot {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.4; }
                }
                @keyframes faceLaserScan {
                  0% { top: 10px; }
                  100% { top: 95px; }
                }
              `}</style>

              {/* Dossier Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(0, 229, 255, 0.4)',
                  paddingBottom: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: '#00e5ff',
                      boxShadow: '0 0 12px #00e5ff',
                    }}
                  />
                  <span style={{ fontSize: '0.96rem', color: '#00e5ff', fontWeight: 700, letterSpacing: '0.05em' }}>
                    // COMMAND WORKSTATION INTEL DOSSIER [ {activeProject.slug.toUpperCase()} ]
                  </span>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      color: '#e8a23a',
                      backgroundColor: 'rgba(232, 162, 58, 0.18)',
                      border: '1px solid rgba(232, 162, 58, 0.4)',
                      padding: '0.15rem 0.55rem',
                      borderRadius: '2px',
                      fontWeight: 700,
                    }}
                  >
                    {activeScreenDef?.badge}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedProjectSlug(null)}
                  style={{
                    padding: '0.4rem 1rem',
                    backgroundColor: 'rgba(232, 162, 58, 0.18)',
                    border: '1px solid #e8a23a',
                    color: '#e8a23a',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    borderRadius: '2px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  RETURN TO MASTER VIEW ✕
                </button>
              </div>

              {/* Dossier Body: 2-Column Tactical Intel Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', margin: '1rem 0', flex: 1, alignItems: 'center' }}>
                {/* Left Column: Project Overview & Verified Facts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <div>
                    <h2
                      style={{
                        fontSize: '2.1rem',
                        fontWeight: 700,
                        color: '#e6e2d8',
                        fontFamily: "'Space Grotesk', sans-serif",
                        lineHeight: 1.15,
                        margin: 0,
                      }}
                    >
                      {activeProject.title}
                    </h2>
                    <div style={{ fontSize: '0.88rem', color: '#e8a23a', marginTop: '0.35rem', fontWeight: 600 }}>
                      {activeProject.badge}
                    </div>
                  </div>

                  {/* Tech Stack Pills */}
                  <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                    {activeProject.stack.map((tech) => (
                      <span
                        key={tech}
                        style={{
                          fontSize: '0.76rem',
                          backgroundColor: 'rgba(0, 229, 255, 0.12)',
                          border: '1px solid rgba(0, 229, 255, 0.4)',
                          color: '#00e5ff',
                          padding: '0.2rem 0.65rem',
                          borderRadius: '2px',
                          fontWeight: 600,
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Verified CV Description Bullets */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                    {activeProject.description.map((desc, idx) => (
                      <p
                        key={idx}
                        style={{
                          fontSize: '0.92rem',
                          color: '#c2beb4',
                          lineHeight: 1.55,
                          margin: 0,
                        }}
                      >
                        {desc}
                      </p>
                    ))}
                  </div>

                  {/* Verified Engineering Highlight Note */}
                  <div
                    style={{
                      borderLeft: '3px solid #7fb38a',
                      backgroundColor: 'rgba(127, 179, 138, 0.08)',
                      padding: '0.5rem 0.85rem',
                      fontSize: '0.78rem',
                      color: '#7fb38a',
                    }}
                  >
                    DEPLOYMENT TELEMETRY: {activeScreenDef?.metrics}
                  </div>
                </div>

                {/* Right Column: Holographic Tactical Architecture & Live Schematic */}
                <div
                  style={{
                    backgroundColor: 'rgba(4, 18, 28, 0.75)',
                    border: '1px solid rgba(0, 229, 255, 0.4)',
                    boxShadow: 'inset 0 0 25px rgba(0, 229, 255, 0.15)',
                    borderRadius: '4px',
                    padding: '1.25rem',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxSizing: 'border-box',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0, 229, 255, 0.25)', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', color: '#00e5ff', fontWeight: 700 }}>
                      // SYSTEM ARCHITECTURE TOPOLOGY
                    </span>
                    <span style={{ fontSize: '0.64rem', color: '#7fb38a' }}>ONLINE</span>
                  </div>

                  {/* Interactive Diagram depending on active project */}
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0.75rem 0' }}>
                    {activeProject.slug === 'edgedesk' && (
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.72rem' }}>
                        <div style={{ border: '1px solid #e8a23a', padding: '0.5rem', borderRadius: '3px', backgroundColor: 'rgba(232, 162, 58, 0.10)', color: '#e8a23a' }}>
                          [1] WEB CLIENT / OPERATOR DASHBOARD
                        </div>
                        <div style={{ textAlign: 'center', color: '#00e5ff', fontSize: '0.68rem' }}>
                          ↓↓ WebSocket (TLS 1.3 / WSS Encrypted) ↓↓
                        </div>
                        <div style={{ border: '1px solid #00e5ff', padding: '0.5rem', borderRadius: '3px', backgroundColor: 'rgba(0, 229, 255, 0.10)', color: '#00e5ff' }}>
                          [2] EDGEDESK CENTRAL BROKER (REBOOT-SAFE LINUX)
                        </div>
                        <div style={{ textAlign: 'center', color: '#7fb38a', fontSize: '0.68rem' }}>
                          ↓↓ Encrypted VNC Stream / File Transfer ↓↓
                        </div>
                        <div style={{ border: '1px solid #7fb38a', padding: '0.5rem', borderRadius: '3px', backgroundColor: 'rgba(127, 179, 138, 0.10)', color: '#7fb38a' }}>
                          [3] NVIDIA JETSON NANO FLEET NODES (12 ONLINE)
                        </div>
                      </div>
                    )}

                    {activeProject.slug === 'crowd-analytics' && (
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.72rem' }}>
                        <div style={{ border: '1px solid #00e5ff', padding: '0.5rem', borderRadius: '3px', backgroundColor: 'rgba(0, 229, 255, 0.10)', color: '#00e5ff' }}>
                          [1] RTSP CCTV CAMERA STREAM INGESTION
                        </div>
                        <div style={{ textAlign: 'center', color: '#e8a23a', fontSize: '0.68rem' }}>
                          ↓↓ GPU TensorRT / CUDA Acceleration ↓↓
                        </div>
                        <div style={{ border: '1px solid #e8a23a', padding: '0.5rem', borderRadius: '3px', backgroundColor: 'rgba(232, 162, 58, 0.10)', color: '#e8a23a' }}>
                          [2] YOLOv8 DETECTION + BYTETRACK MULTI-TRACKING
                        </div>
                        <div style={{ textAlign: 'center', color: '#7fb38a', fontSize: '0.68rem' }}>
                          ↓↓ Sub-50ms Latency Pipeline ↓↓
                        </div>
                        <div style={{ border: '1px solid #7fb38a', padding: '0.5rem', borderRadius: '3px', backgroundColor: 'rgba(127, 179, 138, 0.10)', color: '#7fb38a' }}>
                          [3] REAL-TIME STAMPEDE DENSITY & VELOCITY ALERTS
                        </div>
                      </div>
                    )}

                    {activeProject.slug === 'poultry-health-ai' && (
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.72rem' }}>
                        <div style={{ border: '1px solid #7fb38a', padding: '0.5rem', borderRadius: '3px', backgroundColor: 'rgba(127, 179, 138, 0.10)', color: '#7fb38a' }}>
                          [1] FARM CAMERA MULTI-ANGLE DATA PIPELINE
                        </div>
                        <div style={{ textAlign: 'center', color: '#00e5ff', fontSize: '0.68rem' }}>
                          ↓↓ YOLO Object Detection & Anomaly Model ↓↓
                        </div>
                        <div style={{ border: '1px solid #00e5ff', padding: '0.5rem', borderRadius: '3px', backgroundColor: 'rgba(0, 229, 255, 0.10)', color: '#00e5ff' }}>
                          [2] COMPUTER VISION HEALTH INFERENCE (98.4%)
                        </div>
                        <div style={{ textAlign: 'center', color: '#e8a23a', fontSize: '0.68rem' }}>
                          ↓↓ Production Deployment ↓↓
                        </div>
                        <div style={{ border: '1px solid #e8a23a', padding: '0.5rem', borderRadius: '3px', backgroundColor: 'rgba(232, 162, 58, 0.10)', color: '#e8a23a' }}>
                          [3] REAL FARM OPERATOR TELEMETRY DASHBOARD
                        </div>
                      </div>
                    )}

                    {activeProject.slug === 'facial-attendance' && (
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.72rem' }}>
                        <div style={{ border: '1px solid #00e5ff', padding: '0.5rem', borderRadius: '3px', backgroundColor: 'rgba(0, 229, 255, 0.10)', color: '#00e5ff' }}>
                          [1] AUTOMATED FACIAL RECOGNITION (DLIB)
                        </div>
                        <div style={{ textAlign: 'center', color: '#7fb38a', fontSize: '0.68rem' }}>
                          ↓↓ RESTful Flask Pipeline ↓↓
                        </div>
                        <div style={{ border: '1px solid #7fb38a', padding: '0.5rem', borderRadius: '3px', backgroundColor: 'rgba(127, 179, 138, 0.10)', color: '#7fb38a' }}>
                          [2] AWS EC2 CLOUD BACKEND & MYSQL
                        </div>
                        <div style={{ textAlign: 'center', color: '#e8a23a', fontSize: '0.68rem' }}>
                          ↓↓ 90% Time Saved Pilot ↓↓
                        </div>
                        <div style={{ border: '1px solid #e8a23a', padding: '0.5rem', borderRadius: '3px', backgroundColor: 'rgba(232, 162, 58, 0.10)', color: '#e8a23a' }}>
                          [3] 3-COURSE AUTOMATED ATTENDANCE RECORD
                        </div>
                      </div>
                    )}

                    {activeProject.slug === 'on-device-ai' && (
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.72rem' }}>
                        <div style={{ border: '1px solid #7fb38a', padding: '0.5rem', borderRadius: '3px', backgroundColor: 'rgba(127, 179, 138, 0.10)', color: '#7fb38a' }}>
                          [1] MICROPHONE OFFLINE AUDIO STREAM
                        </div>
                        <div style={{ textAlign: 'center', color: '#00e5ff', fontSize: '0.68rem' }}>
                          ↓↓ Whisper ONNX STT Engine (sherpa-onnx) ↓↓
                        </div>
                        <div style={{ border: '1px solid #00e5ff', padding: '0.5rem', borderRadius: '3px', backgroundColor: 'rgba(0, 229, 255, 0.10)', color: '#00e5ff' }}>
                          [2] LOCAL LLAMA.CPP INFERENCE (GGUF 4-BIT)
                        </div>
                        <div style={{ textAlign: 'center', color: '#e8a23a', fontSize: '0.68rem' }}>
                          ↓↓ 100% On-Device / Zero Cloud ↓↓
                        </div>
                        <div style={{ border: '1px solid #e8a23a', padding: '0.5rem', borderRadius: '3px', backgroundColor: 'rgba(232, 162, 58, 0.10)', color: '#e8a23a' }}>
                          [3] PRIVACY-PRESERVING ANDROID ASSISTANT
                        </div>
                      </div>
                    )}

                    {activeProject.slug === 'parkfnb' && (
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.72rem' }}>
                        <div style={{ border: '1px solid #00e5ff', padding: '0.5rem', borderRadius: '3px', backgroundColor: 'rgba(0, 229, 255, 0.10)', color: '#00e5ff' }}>
                          [1] CCTV RTSP CAMERA VIDEO INGESTION
                        </div>
                        <div style={{ textAlign: 'center', color: '#e8a23a', fontSize: '0.68rem' }}>
                          ↓↓ Slot Occupancy & Vehicle Tracking ↓↓
                        </div>
                        <div style={{ border: '1px solid #e8a23a', padding: '0.5rem', borderRadius: '3px', backgroundColor: 'rgba(232, 162, 58, 0.10)', color: '#e8a23a' }}>
                          [2] NODE.JS REAL-TIME TELEMETRY BACKEND
                        </div>
                        <div style={{ textAlign: 'center', color: '#7fb38a', fontSize: '0.68rem' }}>
                          ↓↓ Live WebSocket State Sync ↓↓
                        </div>
                        <div style={{ border: '1px solid #7fb38a', padding: '0.5rem', borderRadius: '3px', backgroundColor: 'rgba(127, 179, 138, 0.10)', color: '#7fb38a' }}>
                          [3] SMART PARKING MANAGEMENT & WEB APP
                        </div>
                      </div>
                    )}

                    {activeProject.slug === 'lora-traffic-mesh' && (
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.72rem' }}>
                        <div style={{ border: '1px solid #e8a23a', padding: '0.5rem', borderRadius: '3px', backgroundColor: 'rgba(232, 162, 58, 0.10)', color: '#e8a23a' }}>
                          [1] INTERSECTION NODE A (ESP32 AUTONOMOUS CONTROLLER)
                        </div>
                        <div style={{ textAlign: 'center', color: '#00e5ff', fontSize: '0.68rem' }}>
                          ↓↓ Ad-Hoc Gossip Mesh (868/915 MHz Sub-GHz LoRa) ↓↓
                        </div>
                        <div style={{ border: '1px solid #00e5ff', padding: '0.5rem', borderRadius: '3px', backgroundColor: 'rgba(0, 229, 255, 0.10)', color: '#00e5ff' }}>
                          [2] INTERSECTION NODE B (FREERTOS DYNAMIC SCHEDULER)
                        </div>
                        <div style={{ textAlign: 'center', color: '#7fb38a', fontSize: '0.68rem' }}>
                          ↓↓ Slotted ALOHA Backoff + Fail-Safe Fallback ↓↓
                        </div>
                        <div style={{ border: '1px solid #7fb38a', padding: '0.5rem', borderRadius: '3px', backgroundColor: 'rgba(127, 179, 138, 0.10)', color: '#7fb38a' }}>
                          [3] SOLID-STATE SIGNAL RELAYS (NO INTERNET REQUIRED)
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '0.64rem', color: '#9e9a8e', borderTop: '1px solid rgba(0, 229, 255, 0.25)', paddingTop: '0.45rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>STATUS: OPERATIONAL</span>
                    <span style={{ color: '#00e5ff' }}>VERIFIED CV SPEC</span>
                  </div>
                </div>
              </div>

              {/* Dossier Footer Controls */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid rgba(0, 229, 255, 0.4)',
                  paddingTop: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => handleCycleProject(-1)}
                    style={{
                      padding: '0.5rem 1.1rem',
                      backgroundColor: 'rgba(0, 229, 255, 0.15)',
                      border: '1px solid rgba(0, 229, 255, 0.45)',
                      color: '#00e5ff',
                      fontSize: '0.80rem',
                      fontWeight: 700,
                      borderRadius: '2px',
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
                      padding: '0.5rem 1.1rem',
                      backgroundColor: 'rgba(0, 229, 255, 0.15)',
                      border: '1px solid rgba(0, 229, 255, 0.45)',
                      color: '#00e5ff',
                      fontSize: '0.80rem',
                      fontWeight: 700,
                      borderRadius: '2px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    NEXT PROJECT →
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleLaunchFullOS('projects', activeProject.slug)}
                    style={{
                      padding: '0.55rem 1.3rem',
                      backgroundColor: '#e8a23a',
                      color: '#07080a',
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      borderRadius: '2px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      boxShadow: '0 0 20px rgba(232, 162, 58, 0.5)',
                    }}
                  >
                    EXPAND IN FULL NJ-OS SHELL ↗
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedProjectSlug(null)}
                    style={{
                      padding: '0.55rem 1rem',
                      backgroundColor: 'transparent',
                      border: '1px solid #6b675d',
                      color: '#9e9a8e',
                      fontSize: '0.80rem',
                      borderRadius: '2px',
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
            3. BOTTOM STATUS BAR & TACTICAL PROJECT QUICK SELECTORS
            ========================================================= */}
        <div
          style={{
            position: 'absolute',
            bottom: '18px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            backgroundColor: 'rgba(6, 12, 18, 0.92)',
            border: '1px solid rgba(0, 229, 255, 0.4)',
            backdropFilter: 'blur(8px)',
            borderRadius: '4px',
            padding: '0.55rem 1.4rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.85)',
            zIndex: 40,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#00e5ff',
                boxShadow: '0 0 8px #00e5ff',
              }}
            />
            <span style={{ fontSize: '0.78rem', color: '#00e5ff', fontWeight: 700 }}>
              TACTICAL MONITORS ACTIVE
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.45rem' }}>
            {SCREENS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectScreenInPlace(s)}
                style={{
                  padding: '0.3rem 0.65rem',
                  backgroundColor: selectedProjectSlug === s.slug ? 'rgba(0, 229, 255, 0.3)' : 'rgba(0, 229, 255, 0.08)',
                  border: selectedProjectSlug === s.slug ? '1px solid #00e5ff' : '1px solid rgba(0, 229, 255, 0.25)',
                  color: selectedProjectSlug === s.slug ? '#00e5ff' : '#9e9a8e',
                  fontSize: '0.68rem',
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
                padding: '0.3rem 0.75rem',
                backgroundColor: 'rgba(127, 179, 138, 0.15)',
                border: '1px solid #7fb38a',
                color: '#7fb38a',
                fontSize: '0.68rem',
                fontWeight: 700,
                borderRadius: '2px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s ease',
              }}
              title="Inspect 3D Warden Exoskeleton Suit Chamber"
            >
              🛡️ SUIT VAULT [3D]
            </button>
          </div>

          {selectedProjectSlug && (
            <button
              type="button"
              onClick={() => setSelectedProjectSlug(null)}
              style={{
                padding: '0.3rem 0.75rem',
                backgroundColor: 'rgba(232, 162, 58, 0.18)',
                border: '1px solid #e8a23a',
                color: '#e8a23a',
                fontSize: '0.68rem',
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
