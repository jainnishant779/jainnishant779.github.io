import React, { useEffect, useRef, useState } from 'react';
import { useFrameLoader } from './useFrameLoader';
import { ScreenPreview } from './ScreenPreview';
import { getRawScrollProgress, lerp } from '../lib/scrollProgress';
import { useStore } from '../state/store';
import { prefersReducedMotion } from '../lib/reducedMotion';

import type { OSModuleId } from '../os/OSShell';

interface FilmPlayerProps {
  onOpenOS: (module?: OSModuleId, slug?: string) => void;
}

export const FilmPlayer: React.FC<FilmPlayerProps> = ({ onOpenOS }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { manifest, ready, loadProgress, getFrame, totalFrames, isMobile } = useFrameLoader();

  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const animFrameIdRef = useRef<number | null>(null);
  const lastDrawnFrameRef = useRef<number>(-1);

  const setStoreProgress = useStore((state) => state.setProgress);

  // Native window scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const raw = getRawScrollProgress();
      targetProgressRef.current = raw;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation and cover-fit render loop
  useEffect(() => {
    if (!ready || totalFrames === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const targetP = targetProgressRef.current;
      const reducedMotion = prefersReducedMotion();

      // Lerp damping (snap if reduced motion)
      if (reducedMotion) {
        currentProgressRef.current = targetP;
      } else {
        const diff = targetP - currentProgressRef.current;
        if (Math.abs(diff) < 0.0005) {
          currentProgressRef.current = targetP;
        } else {
          currentProgressRef.current = lerp(currentProgressRef.current, targetP, 0.15);
        }
      }

      const p = currentProgressRef.current;
      setStoreProgress(p);

      const targetFrame = Math.max(
        0,
        Math.min(totalFrames - 1, Math.round(p * (totalFrames - 1)))
      );

      // Render frame if changed or canvas resized
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const displayW = window.innerWidth;
      const displayH = window.innerHeight;
      const neededW = Math.round(displayW * dpr);
      const neededH = Math.round(displayH * dpr);

      const needsResize = canvas.width !== neededW || canvas.height !== neededH;
      if (needsResize) {
        canvas.width = neededW;
        canvas.height = neededH;
      }

      if (targetFrame !== lastDrawnFrameRef.current || needsResize) {
        const frameImg = getFrame(targetFrame);
        if (frameImg) {
          const imgW = (frameImg as HTMLImageElement).naturalWidth || (frameImg as ImageBitmap).width;
          const imgH = (frameImg as HTMLImageElement).naturalHeight || (frameImg as ImageBitmap).height;

          if (imgW && imgH) {
            const scale = Math.max(canvas.width / imgW, canvas.height / imgH);
            const drawW = imgW * scale;
            const drawH = imgH * scale;
            const dx = (canvas.width - drawW) / 2;
            const dy = (canvas.height - drawH) / 2;

            ctx.drawImage(frameImg, dx, dy, drawW, drawH);
            lastDrawnFrameRef.current = targetFrame;
            setCurrentFrameIndex(targetFrame);
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [ready, totalFrames, getFrame, setStoreProgress]);

  // Terminal screen preview visibility threshold (active from 80% facility depth onward)
  const isTerminalVisible = Boolean(
    manifest &&
    (currentFrameIndex >= totalFrames - 40 || currentProgressRef.current >= 0.80)
  );

  const nativeDims = manifest
    ? isMobile
      ? manifest.mobile
      : manifest.desktop
    : { width: 1600, height: 900 };

  return (
    <div className="film-player-container" style={{ position: 'relative' }}>
      {/* 700vh Native Scroll Track */}
      <div
        className="scroll-track"
        style={{
          height: '700vh',
          width: '100%',
          pointerEvents: 'none',
          position: 'relative',
        }}
      />

      {/* Fixed Fullscreen Canvas */}
      <canvas
        ref={canvasRef}
        className="film-canvas"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 10,
          backgroundColor: '#07080a',
          objectFit: 'cover',
        }}
      />

      {/* Loading HUD Banner during stage 1 download */}
      {!ready && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#07080a',
            zIndex: 50,
            fontFamily: "'JetBrains Mono', monospace",
            color: '#e6e2d8',
          }}
        >
          <div
            style={{
              fontSize: '0.85rem',
              color: '#e8a23a',
              letterSpacing: '0.1em',
              marginBottom: '1rem',
            }}
          >
            // INITIALIZING OPTICAL RECON FEED
          </div>
          <div
            style={{
              width: '260px',
              height: '4px',
              backgroundColor: '#151a1f',
              borderRadius: '2px',
              overflow: 'hidden',
              marginBottom: '0.75rem',
            }}
          >
            <div
              style={{
                width: `${Math.round(loadProgress * 100)}%`,
                height: '100%',
                backgroundColor: '#e8a23a',
                transition: 'width 0.2s ease',
              }}
            />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9e9a8e' }}>
            {Math.round(loadProgress * 100)}% COMPLETE
          </div>
        </div>
      )}

      {/* Matrix3D Fitted Screen Preview on Final Frame */}
      {manifest && (
        <ScreenPreview
          visible={isTerminalVisible}
          rawQuad={manifest.screenQuad}
          nativeWidth={nativeDims.width}
          nativeHeight={nativeDims.height}
          onOpenOS={onOpenOS}
        />
      )}
    </div>
  );
};
