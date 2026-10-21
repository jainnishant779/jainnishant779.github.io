import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getQuadMatrix3d, getCoverQuadInViewport, type Quad } from './quad';
import type { ScreenQuads } from './useFrameLoader';
import { sound } from '../lib/sound';
import { cn } from '@/lib/utils';
import type { OSModuleId } from '../os/OSShell';
import { ScreenFrame, useScreenBoot } from './screens/ScreenFrame';
import { MainScreen } from './screens/MainScreen';
import { TerminalScreen } from './screens/TerminalScreen';
import { ChannelsScreen } from './screens/ChannelsScreen';
import { DESK_PROJECTS } from './screens/deskProjects';

// Fallback monitor quads in 1600x900 frame coordinates, used until public/film/screens.json has loaded.
const LEFT_MONITOR_QUAD: Quad = [[74, 465], [484, 465], [484, 730], [74, 730]];
const CENTER_MONITOR_QUAD: Quad = [[492, 312], [1108, 312], [1108, 746], [492, 746]];
const RIGHT_MONITOR_QUAD: Quad = [[1116, 465], [1526, 465], [1526, 730], [1116, 730]];

/** Width in CSS px at which each panel is laid out before being warped onto its monitor. */
const CENTER_DESIGN_W = 700;
const SIDE_DESIGN_W = 480;

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

const isTyping = (target: EventTarget | null) => {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
};

const ScreenPreviewInner: React.FC<ScreenPreviewProps> = ({ visible, rawQuad, screens, nativeWidth, nativeHeight, onOpenOS }) => {
  const [viewport, setViewport] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 1600,
    h: typeof window !== 'undefined' ? window.innerHeight : 900,
  });
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  // The three monitors power on one after another the first time the camera arrives.
  const centerBoot = useScreenBoot(visible, 0, 1100);
  const leftBoot = useScreenBoot(visible, 250, 1000);
  const rightBoot = useScreenBoot(visible, 450, 1000);

  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Monitor quads in frame pixels. Each panel's design size follows its monitor's real aspect ratio, so text is not stretched.
  const leftQuad = screens?.left ?? LEFT_MONITOR_QUAD;
  const centerQuad: Quad = screens?.center ?? (rawQuad && rawQuad.length === 4 && rawQuad[0][0] > 0 ? rawQuad : CENTER_MONITOR_QUAD);
  const rightQuad = screens?.right ?? RIGHT_MONITOR_QUAD;

  const layout = useMemo(() => {
    const build = (quad: Quad, base: number) => {
      const size = designSize(quad, base);
      return { size, transform: getQuadMatrix3d(size.w, size.h, getCoverQuadInViewport(quad, nativeWidth, nativeHeight, viewport.w, viewport.h)) };
    };
    return { left: build(leftQuad, SIDE_DESIGN_W), center: build(centerQuad, CENTER_DESIGN_W), right: build(rightQuad, SIDE_DESIGN_W) };
  }, [leftQuad, centerQuad, rightQuad, nativeWidth, nativeHeight, viewport]);

  const selectProject = useCallback((slug: string | null) => setActiveSlug(slug), []);

  /** Same project again closes the dossier; used by the desk strip and the keyboard shortcuts. */
  const toggleProject = useCallback((slug: string) => {
    sound.playAccessBeep();
    setActiveSlug((prev) => (prev === slug ? null : slug));
  }, []);

  const openFromTerminal = useCallback((slug: string) => {
    sound.playAccessBeep();
    setActiveSlug(slug);
  }, []);

  const cycleProject = useCallback((direction: number) => {
    sound.playAccessBeep();
    const slugs = DESK_PROJECTS.map((s) => s.slug);
    setActiveSlug((current) => {
      if (!current) return slugs[0];
      return slugs[(slugs.indexOf(current) + direction + slugs.length) % slugs.length];
    });
  }, []);

  // Open the OS (FilmPlayer animates the camera zoom into the monitor, then mounts the overlay)
  const launchOS = useCallback(
    (module?: OSModuleId, slug?: string) => {
      sound.initContext();
      sound.playBootHum();
      onOpenOS(module, slug);
    },
    [onOpenOS],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!visible || isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape') {
        if (activeSlug) {
          e.preventDefault();
          setActiveSlug(null);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        cycleProject(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        cycleProject(-1);
      } else if (e.key === 'Enter' && !activeSlug) {
        e.preventDefault();
        launchOS('identity');
      } else if (/^[1-9]$/.test(e.key)) {
        const target = DESK_PROJECTS.find((s) => s.keyNum === e.key);
        if (target) {
          e.preventDefault();
          toggleProject(target.slug);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [visible, activeSlug, cycleProject, launchOS, toggleProject]);

  // Always mounted (no mount hitch when the camera arrives); hidden with visibility so it costs no paint while scrolling.
  return (
    <div
      className={cn(
        'film-screen-quad-container fixed inset-0 z-35 select-none font-mono transition-opacity duration-[400ms] ease-out',
        visible ? 'pointer-events-auto visible opacity-100' : 'pointer-events-none invisible opacity-0',
      )}
    >
      <ScreenFrame
        className="workstation-left-screen"
        width={layout.left.size.w}
        height={layout.left.size.h}
        transform={layout.left.transform}
        stage={leftBoot}
      >
        <TerminalScreen active={leftBoot === 'on'} onOpenProject={openFromTerminal} />
      </ScreenFrame>

      <ScreenFrame
        className="workstation-center-screen"
        tone="main"
        width={layout.center.size.w}
        height={layout.center.size.h}
        transform={layout.center.transform}
        stage={centerBoot}
      >
        <MainScreen activeSlug={activeSlug} onSelectProject={selectProject} onCycle={cycleProject} onOpenOS={launchOS} />
      </ScreenFrame>

      <ScreenFrame
        className="workstation-right-screen"
        width={layout.right.size.w}
        height={layout.right.size.h}
        transform={layout.right.transform}
        stage={rightBoot}
      >
        <ChannelsScreen activeSlug={activeSlug} onSelectProject={toggleProject} />
      </ScreenFrame>

      {/* Desk console strip: keyboard 1-5 shortcuts as buttons */}
      <div
        className="film-screen-hud absolute bottom-[clamp(2.1rem,3.8vh,2.8rem)] left-1/2 z-40 flex max-w-[96vw] -translate-x-1/2 flex-col items-center gap-1 rounded-ctl border border-line-strong bg-bg-0/95 px-3 py-1.5 shadow-panel"
      >
        <div className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.12em] text-screen">
          <span className="size-1.5 rounded-full bg-screen shadow-[0_0_6px_var(--screen)]" aria-hidden />
          TRIPLE-DISPLAY WORKSTATION // CLICK ANY SCREEN OR PROJECT BUTTON
        </div>
        <div className="flex max-w-full items-center justify-center gap-1 overflow-x-auto [scrollbar-width:none]">
          {DESK_PROJECTS.map((s) => (
            <button
              key={s.slug}
              type="button"
              onClick={() => toggleProject(s.slug)}
              className={cn(
                'cursor-pointer whitespace-nowrap rounded-chip border px-2 py-1 text-[0.62rem] font-bold transition-colors duration-[120ms]',
                activeSlug === s.slug
                  ? 'border-screen bg-screen/25 text-screen'
                  : 'border-screen/25 bg-screen/5 text-text-1 hover:border-screen/60',
              )}
            >
              [{s.keyNum}] {s.shortTitle}
            </button>
          ))}
          {activeSlug && (
            <button
              type="button"
              onClick={() => setActiveSlug(null)}
              className="cursor-pointer whitespace-nowrap rounded-chip border border-accent bg-accent-soft px-2 py-1 text-[0.62rem] font-bold text-accent"
            >
              CLOSE [ESC]
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Memoised: FilmPlayer re-renders rarely now, but the screens are heavy and their props are stable.
export const ScreenPreview = React.memo(ScreenPreviewInner);
