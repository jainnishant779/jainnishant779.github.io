import React, { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Link } from 'react-router-dom';
import { useStore } from '../state/store';
import { isWebGL2Available } from '../lib/webgl';
import { TIER_CONFIGS, getInitialTier } from '../lib/quality';
import { Experience } from '../experience/Experience';
import { HudOverlay } from '../ui/HudOverlay';
import { OSShell } from '../os/OSShell';
import { getCVUrl } from '../lib/assets';
import { getRawScrollProgress } from '../lib/scrollProgress';
import { prefersReducedMotion } from '../lib/reducedMotion';
import { sound } from '../lib/sound';

export const HomePage: React.FC = () => {
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [fadeScreen, setFadeScreen] = useState<boolean>(false);
  const tier = useStore((state) => state.tier);
  const setTier = useStore((state) => state.setTier);
  const osOpen = useStore((state) => state.osOpen);
  const setOsOpen = useStore((state) => state.setOsOpen);

  // Initialize hardware capabilities
  useEffect(() => {
    const supported = isWebGL2Available();
    setWebglSupported(supported);
    if (supported) {
      setTier(getInitialTier());
    }
  }, [setTier]);

  // Native scroll listener: updates progress state immediately on window scroll
  useEffect(() => {
    const handleScroll = () => {
      const raw = getRawScrollProgress();
      useStore.getState().setProgress(raw);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial sync
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle keyboard shortcuts (E to open OS when near computer)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'e' || e.key === 'E') {
        const state = useStore.getState();
        if (state.progress >= 0.85 && !state.osOpen) {
          setOsOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setOsOpen]);

  // Access the facility handler (Phase 3)
  const handleAccessFacility = useCallback(() => {
    if (useStore.getState().audioEnabled) {
      sound.initContext();
    }
    const doc = document.documentElement;
    const scrollHeight = Math.max(doc.scrollHeight, document.body.scrollHeight) - window.innerHeight;

    if (prefersReducedMotion()) {
      setFadeScreen(true);
      setTimeout(() => {
        window.scrollTo({
          top: scrollHeight * 0.45,
          behavior: 'auto',
        });
        setTimeout(() => {
          setFadeScreen(false);
        }, 150);
      }, 150);
    } else {
      window.scrollTo({
        top: scrollHeight * 0.31,
        behavior: 'smooth',
      });
    }
  }, []);

  // Skip intro smooth scroll
  const handleSkipIntro = useCallback(() => {
    const doc = document.documentElement;
    const scrollHeight = Math.max(doc.scrollHeight, document.body.scrollHeight) - window.innerHeight;
    if (prefersReducedMotion()) {
      window.scrollTo({
        top: scrollHeight * 0.45,
        behavior: 'auto',
      });
    } else {
      window.scrollTo({
        top: scrollHeight * 0.45,
        behavior: 'smooth',
      });
    }
  }, []);

  const tierConfig = TIER_CONFIGS[tier];
  const cvUrl = getCVUrl();

  // WebGL Unsupported Fallback Screen
  if (!webglSupported) {
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
          WebGL2 acceleration is not supported on your current browser or hardware
          configuration. The full engineering portfolio is accessible through the 2D
          Command Center.
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
      {/* 900vh Native Window Scroll Track */}
      <div
        className="scroll-track"
        style={{
          height: '900vh',
          width: '100%',
          pointerEvents: 'none',
          position: 'relative',
        }}
      />

      {/* Fixed Fullscreen 3D Canvas */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 10,
        }}
      >
        <Canvas
          camera={{
            position: [0, 1.6, 18],
            fov: 60,
            near: 0.1,
            far: 200,
          }}
          dpr={tierConfig.dpr}
          shadows={tierConfig.shadows}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
          }}
        >
          <Experience />
        </Canvas>
      </div>

      {/* Heads-Up Display Overlay */}
      <HudOverlay
        onOpenOS={() => setOsOpen(true)}
        onSkipIntro={handleSkipIntro}
        onAccessFacility={handleAccessFacility}
      />

      {/* Reduced-motion transition fade overlay */}
      {fadeScreen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#07080a',
            zIndex: 100,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Interactive OS Command Center Overlay */}
      {osOpen && (
        <OSShell mode="overlay" onClose={() => setOsOpen(false)} />
      )}
    </div>
  );
};
