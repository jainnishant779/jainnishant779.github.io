import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Lenis from 'lenis';
import { useStore } from '../state/store';
import { FilmPlayer } from '../film/FilmPlayer';
import { HudOverlay } from '../ui/HudOverlay';
import { OSShell, type OSModuleId } from '../os/OSShell';
import { prefersReducedMotion } from '../lib/reducedMotion';
import { sound } from '../lib/sound';
import { getCVUrl } from '../lib/assets';

export const HomePage: React.FC = () => {
  const [engineSupported, setEngineSupported] = useState<boolean>(true);
  const [fadeScreen, setFadeScreen] = useState<boolean>(false);
  const [osModule, setOsModule] = useState<OSModuleId>('identity');
  const [osSlug, setOsSlug] = useState<string | undefined>(undefined);
  const osOpen = useStore((state) => state.osOpen);
  const setOsOpen = useStore((state) => state.setOsOpen);
  const audioEnabled = useStore((state) => state.audioEnabled);
  const cvUrl = getCVUrl();

  // Hardware capability check
  useEffect(() => {
    try {
      const c = document.createElement('canvas');
      const ctx = c.getContext('2d');
      if (!ctx) {
        setEngineSupported(false);
      }
    } catch {
      setEngineSupported(false);
    }

    // Scroll restoration & direct deep-link query parameter handling (?view=os)
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'os') {
      setOsOpen(true);
    } else {
      window.scrollTo(0, 0);
    }
  }, [setOsOpen]);

  // Lenis Smooth Scroll Engine (matching roccia.in luxury momentum physics)
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false,
    });

    (window as any).__lenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      delete (window as any).__lenis;
    };
  }, []);

  // Keyboard shortcut: Escape closes the OS overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && useStore.getState().osOpen) {
        setOsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setOsOpen]);

  // Ambient sound lifecycle
  useEffect(() => {
    if (audioEnabled) {
      sound.startAmbience();
    } else {
      sound.stopAmbience();
    }
    return () => {
      sound.stopAmbience();
    };
  }, [audioEnabled]);

  // Open NJ-OS handler with optional module and project slug
  const handleOpenOS = useCallback((module: OSModuleId = 'identity', slug?: string) => {
    if (useStore.getState().audioEnabled) {
      sound.playBootHum();
    }
    setOsModule(module);
    setOsSlug(slug);
    setOsOpen(true);
  }, [setOsOpen]);

  // Access facility handler: unlatches the massive blast door and scrolls to threshold (0.20)
  const handleAccessFacility = useCallback(() => {
    sound.initContext();
    sound.playAccessBeep();
    setTimeout(() => sound.playMechanicalClunk(), 120);
    setTimeout(() => sound.playPneumaticHiss(), 380);
    useStore.getState().setAudioEnabled(true);

    const doc = document.documentElement;
    const scrollHeight = Math.max(doc.scrollHeight, document.body.scrollHeight) - window.innerHeight;

    if (prefersReducedMotion()) {
      setFadeScreen(true);
      setTimeout(() => {
        window.scrollTo({
          top: scrollHeight * 0.20,
          behavior: 'auto',
        });
        setTimeout(() => {
          setFadeScreen(false);
        }, 150);
      }, 150);
    } else {
      const lenis = (window as any).__lenis;
      if (lenis) {
        lenis.scrollTo(scrollHeight * 0.20, { duration: 2.2 });
      } else {
        window.scrollTo({
          top: scrollHeight * 0.20,
          behavior: 'smooth',
        });
      }
    }
  }, []);

  // Skip to terminal workstation handler
  const handleSkipIntro = useCallback(() => {
    const doc = document.documentElement;
    const scrollHeight = Math.max(doc.scrollHeight, document.body.scrollHeight) - window.innerHeight;
    if (prefersReducedMotion()) {
      window.scrollTo({
        top: scrollHeight * 0.96,
        behavior: 'auto',
      });
    } else {
      const lenis = (window as any).__lenis;
      if (lenis) {
        lenis.scrollTo(scrollHeight * 0.96, { duration: 1.8 });
      } else {
        window.scrollTo({
          top: scrollHeight * 0.96,
          behavior: 'smooth',
        });
      }
    }
  }, []);

  // Fallback screen for unsupported environments
  if (!engineSupported) {
    return (
      <div
        className="webgl-fallback-screen"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#07080a',
          color: '#e6e2d8',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.8rem',
            color: '#e8a23a',
            border: '1px solid rgba(232, 162, 58, 0.4)',
            padding: '0.35rem 0.85rem',
            borderRadius: '2px',
            marginBottom: '1rem',
          }}
        >
          // GRAPHICS HARDWARE NOTICE
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          3D ENGINE UNAVAILABLE
        </h1>
        <p
          style={{
            maxWidth: '520px',
            color: '#9e9a8e',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.95rem',
            lineHeight: '1.65',
            marginBottom: '2rem',
          }}
        >
          Hardware acceleration is not supported on your current browser or configuration.
          The complete engineering portfolio is accessible through the 2D Command Center.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            to="/os"
            style={{
              padding: '0.75rem 1.5rem',
              background: '#e8a23a',
              color: '#07080a',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              fontSize: '0.85rem',
              borderRadius: '3px',
              textDecoration: 'none',
            }}
          >
            ENTER NJ-OS COMMAND CENTER →
          </Link>

          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.75rem 1.5rem',
              background: '#12161c',
              border: '1px solid #2a3038',
              color: '#e8a23a',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.85rem',
              borderRadius: '3px',
              textDecoration: 'none',
            }}
          >
            DOWNLOAD CV (PDF) ↗
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="home-experience-wrapper" style={{ position: 'relative' }}>
      {/* Photorealistic Scroll Film Player & Perspective Screen Quad */}
      <FilmPlayer onOpenOS={handleOpenOS} />

      {/* Heads-Up Display Overlay */}
      <HudOverlay
        onOpenOS={handleOpenOS}
        onSkipIntro={handleSkipIntro}
        onAccessFacility={handleAccessFacility}
      />

      {/* Reduced-motion transition fade overlay */}
      {fadeScreen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#07080a',
            zIndex: 100,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Interactive OS Command Center Overlay */}
      {osOpen && (
        <OSShell
          mode="overlay"
          initialModule={osModule}
          initialSlug={osSlug}
          onClose={() => setOsOpen(false)}
        />
      )}
    </div>
  );
};
