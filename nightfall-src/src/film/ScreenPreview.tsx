import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getQuadMatrix3d, getCoverQuadInViewport, type Quad } from './quad';
import type { ScreenQuads } from './useFrameLoader';
import { sound } from '../lib/sound';
import { projects } from '../content/projects';
import { experiences } from '../content/experience';
import { achievements, certifications } from '../content/achievements';
import { profile } from '../content/profile';
import { skillGroups } from '../content/skills';
import { getCVUrl } from '../lib/assets';
import { EdgeDeskDiagram } from '../os/diagrams/EdgeDeskDiagram';
import { CrowdDiagram } from '../os/diagrams/CrowdDiagram';
import { PoultryHealthDiagram } from '../os/diagrams/PoultryHealthDiagram';
import { FacialAttendanceDiagram } from '../os/diagrams/FacialAttendanceDiagram';
import { OnDeviceAiDiagram } from '../os/diagrams/OnDeviceAiDiagram';
import type { OSModuleId } from '../os/OSShell';

interface ScreenDef {
  id: string;
  slug: string;
  module: OSModuleId;
  title: string;
  shortTitle: string;
  badge: string;
  tech: string[];
  keyNum: string;
}

// Order and short labels of the desk-console buttons. Titles, badges and stacks come from src/content/projects.ts.
const SCREEN_ORDER: { slug: string; shortTitle: string }[] = [
  { slug: 'poultry-health-ai', shortTitle: 'POULTRY HEALTH AI' },
  { slug: 'edgedesk', shortTitle: 'EDGEDESK REMOTE ACCESS' },
  { slug: 'facial-attendance', shortTitle: 'FACIAL RECOGNITION AI' },
  { slug: 'crowd-analytics', shortTitle: 'CROWD ANALYTICS & STAMPEDE' },
  { slug: 'on-device-ai', shortTitle: 'ON-DEVICE AI ASSISTANT' },
];

const SCREENS: ScreenDef[] = SCREEN_ORDER.flatMap(({ slug, shortTitle }, i) => {
  const p = projects.find((proj) => proj.slug === slug);
  if (!p) return [];
  const screen: ScreenDef = {
    id: p.slug,
    slug: p.slug,
    module: 'projects',
    title: p.title,
    shortTitle,
    badge: p.badge,
    tech: p.stack,
    keyNum: String(i + 1),
  };
  return [screen];
});

// Exact physical monitor quads in 1600x900 coordinate space for f_0239.webp workstation (bezel-to-bezel 100% coverage)
const LEFT_MONITOR_QUAD: Quad = [
  [74, 465],
  [484, 465],
  [484, 730],
  [74, 730],
];

const CENTER_MONITOR_QUAD: Quad = [
  [492, 312],
  [1108, 312],
  [1108, 746],
  [492, 746],
];

const RIGHT_MONITOR_QUAD: Quad = [
  [1116, 465],
  [1526, 465],
  [1526, 730],
  [1116, 730],
];

/** Width in CSS px at which each panel is laid out before being warped onto its monitor. */
const CENTER_DESIGN_W = 820;
const SIDE_DESIGN_W = 580;

/** Panel size for a monitor quad: the given width, with the height that matches the monitor's real aspect ratio. */
function designSize(quad: Quad, baseWidth: number): { w: number; h: number } {
  const len = (a: number[], b: number[]) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  const width = (len(quad[0], quad[1]) + len(quad[3], quad[2])) / 2;
  const height = (len(quad[0], quad[3]) + len(quad[1], quad[2])) / 2;
  return { w: baseWidth, h: Math.round(baseWidth * (height / width)) };
}

interface ScreenPreviewProps {
  visible: boolean;
  rawQuad: Quad;
  /** Calibrated monitor quads for the final frame (public/film/screens.json). Falls back to the built-in defaults. */
  screens?: ScreenQuads;
  nativeWidth: number;
  nativeHeight: number;
  /** Opens the OS. The zoom-into-the-monitor transition is owned by FilmPlayer. */
  onOpenOS: (module?: OSModuleId, slug?: string) => void;
}

const ScreenPreviewInner: React.FC<ScreenPreviewProps> = ({
  visible,
  rawQuad,
  screens,
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
  const [leftTab, setLeftTab] = useState<'focus' | 'stack' | 'network'>('focus');
  const [rightTab, setRightTab] = useState<'quick' | 'experience' | 'honors'>('quick');
  const [projectCategory, setProjectCategory] = useState<string>('All');

  const cvUrl = getCVUrl();
  const companyCount = new Set(experiences.map((e) => e.company)).size;

  // Window resize listener
  useEffect(() => {
    const handleResize = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Monitor quads in frame pixels. Each panel's design size follows its monitor's real aspect ratio, so text is not stretched.
  const leftQuad = screens?.left ?? LEFT_MONITOR_QUAD;
  const centerQuad: Quad =
    screens?.center ?? (rawQuad && rawQuad.length === 4 && rawQuad[0][0] > 0 ? rawQuad : CENTER_MONITOR_QUAD);
  const rightQuad = screens?.right ?? RIGHT_MONITOR_QUAD;

  const leftSize = useMemo(() => designSize(leftQuad, SIDE_DESIGN_W), [leftQuad]);
  const centerSize = useMemo(() => designSize(centerQuad, CENTER_DESIGN_W), [centerQuad]);
  const rightSize = useMemo(() => designSize(rightQuad, SIDE_DESIGN_W), [rightQuad]);

  const leftTransform = useMemo(
    () =>
      getQuadMatrix3d(
        leftSize.w,
        leftSize.h,
        getCoverQuadInViewport(leftQuad, nativeWidth, nativeHeight, viewport.w, viewport.h),
      ),
    [leftQuad, leftSize, nativeWidth, nativeHeight, viewport],
  );
  const centerTransform = useMemo(
    () =>
      getQuadMatrix3d(
        centerSize.w,
        centerSize.h,
        getCoverQuadInViewport(centerQuad, nativeWidth, nativeHeight, viewport.w, viewport.h),
      ),
    [centerQuad, centerSize, nativeWidth, nativeHeight, viewport],
  );
  const rightTransform = useMemo(
    () =>
      getQuadMatrix3d(
        rightSize.w,
        rightSize.h,
        getCoverQuadInViewport(rightQuad, nativeWidth, nativeHeight, viewport.w, viewport.h),
      ),
    [rightQuad, rightSize, nativeWidth, nativeHeight, viewport],
  );

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

  // Open the OS (FilmPlayer animates the camera zoom into the monitor, then mounts the overlay)
  const handleLaunchFullOS = useCallback(
    (module?: OSModuleId, slug?: string) => {
      sound.initContext();
      sound.playBootHum();
      onOpenOS(module, slug);
    },
    [onOpenOS]
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

  // Always mounted (no mount hitch when the camera arrives); hidden with visibility so it costs no paint while scrolling.
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
          pointerEvents: visible ? 'auto' : 'none',
          zIndex: 35,
          opacity: visible ? 1 : 0,
          visibility: visible ? 'visible' : 'hidden',
          transition: visible ? 'opacity 0.4s ease-out' : 'opacity 0.4s ease-out, visibility 0s linear 0.4s',
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
            width: leftSize.w,
            height: leftSize.h,
            transformOrigin: '0 0',
            transform: leftTransform,
            backgroundColor: '#070b12',
            border: '1.5px solid rgba(0, 229, 255, 0.45)',
            boxShadow: '0 0 25px rgba(0, 229, 255, 0.25), inset 0 0 35px rgba(0, 0, 0, 0.9)',
            borderRadius: '4px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            color: '#e2e8f0',
            pointerEvents: 'auto',
          }}
        >
          {/* CRT Diegetic Phosphor Scanline Overlay */}
          <div className="diegetic-screen-scanlines" aria-hidden="true" />

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
              ● MON-01 // PROJECTS & STACK
            </div>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              {(['focus', 'stack', 'network'] as const).map((tab) => (
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
            {leftTab === 'focus' && (
              <>
                <div style={{ fontSize: '0.62rem', color: '#64748b' }}>PROJECTS &amp; STATUS:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.66rem' }}>
                  {SCREENS.map((s) => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6rem', color: '#cbd5e1' }}>
                      <span>▸ {s.shortTitle}</span>
                      <span style={{ color: '#e8a23a', textAlign: 'right' }}>{s.badge}</span>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid rgba(0, 229, 255, 0.15)', paddingTop: '0.45rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem' }}>
                  <span style={{ color: '#64748b' }}>STATION: INDORE, MP, INDIA</span>
                  <span style={{ color: '#94a3b8' }}>SIMULATED DISPLAY</span>
                </div>
              </>
            )}

            {leftTab === 'stack' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                <div style={{ fontSize: '0.62rem', color: '#64748b' }}>SKILLS (FROM CV):</div>
                {skillGroups.slice(0, 3).map((g) => (
                  <div key={g.group}>
                    <div style={{ color: '#e8a23a', fontWeight: 700, fontSize: '0.66rem', marginBottom: '0.25rem' }}>{g.group}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {g.skills.map((skill) => (
                        <span key={skill} style={{ fontSize: '0.6rem', background: '#0e1726', border: '1px solid #1e293b', padding: '0.1rem 0.4rem', borderRadius: '2px', color: '#00e5ff' }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {leftTab === 'network' && (
              <div style={{ padding: '0.5rem', fontSize: '0.68rem', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ color: '#00e5ff', fontWeight: 700, marginBottom: '0.4rem' }}>EDGEDESK — SIMPLIFIED TOPOLOGY</div>
                <div style={{ background: '#070a0e', border: '1px solid #1e293b', padding: '0.5rem', borderRadius: '3px' }}>
                  [ Dashboard ] ↔ [ Custom WebSocket Broker · TLS/WSS ] ↔ [ Jetson Nano devices ]
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
            width: centerSize.w,
            height: centerSize.h,
            transformOrigin: '0 0',
            transform: centerTransform,
            backgroundColor: '#070b12',
            border: '2px solid rgba(232, 162, 58, 0.55)',
            boxShadow: '0 0 35px rgba(232, 162, 58, 0.35), inset 0 0 45px rgba(0, 0, 0, 0.9)',
            borderRadius: '5px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            color: '#e2e8f0',
            pointerEvents: 'auto',
          }}
        >
          {/* CRT Diegetic Phosphor Scanline Overlay */}
          <div className="diegetic-screen-scanlines" aria-hidden="true" />

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
                  {activeProject.slug === 'poultry-health-ai' && <PoultryHealthDiagram />}
                  {activeProject.slug === 'facial-attendance' && <FacialAttendanceDiagram />}
                  {activeProject.slug === 'on-device-ai' && <OnDeviceAiDiagram />}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <a
                    href="https://github.com/jainnishant779"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.72rem', color: '#e8a23a', textDecoration: 'none', border: '1px solid rgba(232, 162, 58, 0.4)', padding: '0.35rem 0.75rem', borderRadius: '3px' }}
                  >
                    GITHUB PROFILE ↗
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
                      <div style={{ fontSize: '1.1rem', color: '#e8a23a', fontWeight: 700 }}>2021–26</div>
                      <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>B.TECH + M.TECH · IOT</div>
                    </div>
                    <div style={{ background: '#090d14', border: '1px solid #1e293b', padding: '0.35rem 0.5rem', borderRadius: '3px' }}>
                      <div style={{ fontSize: '1.1rem', color: '#00e5ff', fontWeight: 700 }}>{companyCount}</div>
                      <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>COMPANIES</div>
                    </div>
                    <div style={{ background: '#090d14', border: '1px solid #1e293b', padding: '0.35rem 0.5rem', borderRadius: '3px' }}>
                      <div style={{ fontSize: '1.1rem', color: '#34d399', fontWeight: 700 }}>{projects.length}</div>
                      <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>PROJECTS</div>
                    </div>
                    <div style={{ background: '#090d14', border: '1px solid #1e293b', padding: '0.35rem 0.5rem', borderRadius: '3px' }}>
                      <div style={{ fontSize: '1.1rem', color: '#e8a23a', fontWeight: 700 }}>1</div>
                      <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>PATENT APP (NOT GRANTED)</div>
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
                    {['All', 'AI/ML', 'Computer Vision', 'Edge AI', 'Research'].map((cat) => (
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
                  07 // CONTACT
                </div>
                <a
                  href={`mailto:${profile.email}`}
                  style={{ background: '#e8a23a', color: '#070a0e', padding: '0.5rem 0.75rem', borderRadius: '3px', fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none', textAlign: 'center' }}
                >
                  ✉ {profile.email}
                </a>
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: '#0b1016', border: '1px solid #1e293b', color: '#cbd5e1', padding: '0.45rem 0.75rem', borderRadius: '3px', fontSize: '0.74rem', textDecoration: 'none' }}
                >
                  GitHub — github.com/jainnishant779 ↗
                </a>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: '#0b1016', border: '1px solid #1e293b', color: '#cbd5e1', padding: '0.45rem 0.75rem', borderRadius: '3px', fontSize: '0.74rem', textDecoration: 'none' }}
                >
                  LinkedIn — linkedin.com/in/nishujain02 ↗
                </a>
                <div style={{ fontSize: '0.66rem', color: '#64748b' }}>{profile.location}</div>
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
            width: rightSize.w,
            height: rightSize.h,
            transformOrigin: '0 0',
            transform: rightTransform,
            backgroundColor: '#070b12',
            border: '1.5px solid rgba(0, 229, 255, 0.45)',
            boxShadow: '0 0 25px rgba(0, 229, 255, 0.25), inset 0 0 35px rgba(0, 0, 0, 0.9)',
            borderRadius: '4px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            color: '#e2e8f0',
            pointerEvents: 'auto',
          }}
        >
          {/* CRT Diegetic Phosphor Scanline Overlay */}
          <div className="diegetic-screen-scanlines" aria-hidden="true" />

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
                  <a
                    href={`mailto:${profile.email}`}
                    style={{ background: '#0b1016', border: '1px solid #1e293b', color: '#cbd5e1', padding: '0.35rem 0.5rem', fontSize: '0.68rem', borderRadius: '3px', textDecoration: 'none', textAlign: 'center' }}
                  >
                    ✉ Email ↗
                  </a>
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
            bottom: 'clamp(2.1rem, 3.8vh, 2.8rem)',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.2rem',
            background: 'rgba(7, 11, 18, 0.96)',
            border: '1px solid rgba(0, 229, 255, 0.4)',
            padding: '0.22rem 0.65rem',
            borderRadius: '4px',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.9), 0 0 12px rgba(0, 229, 255, 0.15)',
            zIndex: 40,
            pointerEvents: 'auto',
            maxWidth: '96vw',
          }}
        >
          <div style={{ fontSize: '0.60rem', color: '#00e5ff', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#00e5ff', boxShadow: '0 0 6px #00e5ff' }} />
            TRIPLE-DISPLAY WORKSTATION // CLICK ANY SCREEN OR PROJECT BUTTON
          </div>

          <div
            style={{
              display: 'flex',
              gap: '0.3rem',
              flexWrap: 'nowrap',
              justifyContent: 'center',
              alignItems: 'center',
              maxWidth: '100%',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              padding: '0.05rem',
            }}
          >
            {SCREENS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectScreenInPlace(s)}
                style={{
                  padding: '0.2rem 0.45rem',
                  backgroundColor: selectedProjectSlug === s.slug ? 'rgba(0, 229, 255, 0.3)' : 'rgba(0, 229, 255, 0.08)',
                  border: selectedProjectSlug === s.slug ? '1px solid #00e5ff' : '1px solid rgba(0, 229, 255, 0.25)',
                  color: selectedProjectSlug === s.slug ? '#00e5ff' : '#cbd5e1',
                  fontSize: '0.60rem',
                  fontWeight: 700,
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                [{s.keyNum}] {s.shortTitle}
              </button>
            ))}

            {selectedProjectSlug && (
              <button
                type="button"
                onClick={() => setSelectedProjectSlug(null)}
                style={{
                  padding: '0.2rem 0.55rem',
                  backgroundColor: 'rgba(232, 162, 58, 0.18)',
                  border: '1px solid #e8a23a',
                  color: '#e8a23a',
                  fontSize: '0.60rem',
                  fontWeight: 700,
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                }}
              >
                CLOSE [ESC]
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Memoised: FilmPlayer re-renders rarely now, but the screens are heavy and their props are stable.
export const ScreenPreview = React.memo(ScreenPreviewInner);
