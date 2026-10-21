import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFrameLoader } from './useFrameLoader';
import { ScreenPreview } from './ScreenPreview';
import { getCoverQuadInViewport } from './quad';
import { getRawScrollProgress } from '../lib/scrollProgress';
import { useStore } from '../state/store';
import { prefersReducedMotion } from '../lib/reducedMotion';

import type { OSModuleId } from '../os/OSShell';

interface FilmPlayerProps {
  onOpenOS: (module?: OSModuleId, slug?: string) => void;
}

/** Blend steps between two source frames; 12 sub-steps make a 12 fps film read as continuous motion. */
const BLEND_STEPS = 12;
/** Camera zoom into the monitor before the OS opens. */
const ZOOM_MS = 800;

type Drawable = ImageBitmap | HTMLImageElement;

function drawCover(ctx: CanvasRenderingContext2D, img: Drawable, cw: number, ch: number, alpha: number): boolean {
  const iw = (img as HTMLImageElement).naturalWidth || (img as ImageBitmap).width;
  const ih = (img as HTMLImageElement).naturalHeight || (img as ImageBitmap).height;
  if (!iw || !ih) return false;
  const scale = Math.max(cw / iw, ch / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  ctx.globalAlpha = 1;
  return true;
}

export const FilmPlayer: React.FC<FilmPlayerProps> = ({ onOpenOS }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { manifest, ready, loadProgress, getFrame, getFrameExact, prefetch, totalFrames, isMobile } = useFrameLoader();

  const [terminalVisible, setTerminalVisible] = useState(false);
  const [zoom, setZoom] = useState<{ tx: number; ty: number; s: number } | null>(null);
  const targetProgressRef = useRef(0);
  const setStoreProgress = useStore((state) => state.setProgress);
  const setGateEnd = useStore((state) => state.setGateEnd);
  const osOpen = useStore((state) => state.osOpen);

  const nativeDims = manifest ? (isMobile ? manifest.mobile : manifest.desktop) : { width: 1600, height: 900 };
  const nativeW = nativeDims.width;
  const hold = manifest?.holdEnd ?? 0;

  // Where the gate finishes opening, as a scroll progress (used by "ACCESS THE FACILITY" and the HUD hints)
  useEffect(() => {
    if (!manifest || manifest.count < 2) return;
    const gate = manifest.segments?.[0];
    if (gate) setGateEnd(Math.min(0.9, (gate.end / (manifest.count - 1)) * (1 - hold)));
  }, [manifest, hold, setGateEnd]);

  // Scroll position -> target progress (the render loop eases toward it)
  useEffect(() => {
    const handleScroll = () => {
      targetProgressRef.current = getRawScrollProgress();
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Render loop. No React state changes per frame: only the canvas is touched, and React is told about
  // the few things that actually change the UI (store progress in 1% steps, terminal visibility).
  useEffect(() => {
    if (!ready || totalFrames === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = mq.matches;
    const onMotionChange = () => {
      reduced = mq.matches;
    };
    mq.addEventListener('change', onMotionChange);

    let running = true;
    let raf = 0;
    let last = performance.now();
    let current = targetProgressRef.current;
    let lastStoreStep = -1;
    let lastVisible = false;
    let lastPrefetchBase = -1;
    let drawn = { base: -1, bucket: -1 };

    const render = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // Frame-rate independent easing. Lenis already smooths the wheel, so the extra easing here stays light.
      const target = targetProgressRef.current;
      if (reduced) {
        current = target;
      } else {
        const k = (window as unknown as { __lenis?: unknown }).__lenis ? 26 : 12;
        current += (target - current) * (1 - Math.exp(-k * dt));
        if (Math.abs(target - current) < 0.00004) current = target;
      }

      const step = Math.round(current * 100);
      if (step !== lastStoreStep) {
        lastStoreStep = step;
        setStoreProgress(step / 100);
      }

      // The last `hold` of the scroll keeps the final frame still, so the live OS panels stay aligned on it.
      const filmProgress = hold > 0 ? Math.min(1, current / (1 - hold)) : current;
      const position = filmProgress * (totalFrames - 1);
      const base = Math.min(totalFrames - 1, Math.max(0, Math.floor(position)));
      const frac = reduced || base >= totalFrames - 1 ? 0 : position - base;
      const bucket = Math.round(frac * BLEND_STEPS);

      if (base !== lastPrefetchBase) {
        prefetch(base, lastPrefetchBase < 0 ? 1 : base - lastPrefetchBase);
        lastPrefetchBase = base;
      }

      // The panels are placed on the final frame, so they only appear once that exact frame is on the canvas
      // (a fast jump to the end can otherwise show them over a half-decoded earlier frame).
      const visible = hold > 0 ? current >= 1 - hold - 0.001 && drawn.base === totalFrames - 1 : base >= totalFrames - 40 || current >= 0.8;
      if (visible !== lastVisible) {
        lastVisible = visible;
        setTerminalVisible(visible);
      }

      // The source is at most nativeW wide, so a larger backing store would only cost fill-rate. dpr is ignored on purpose.
      const scale = Math.min(1, nativeW / window.innerWidth);
      const cw = Math.max(1, Math.round(window.innerWidth * scale));
      const ch = Math.max(1, Math.round(window.innerHeight * scale));
      const resized = canvas.width !== cw || canvas.height !== ch;
      if (resized) {
        canvas.width = cw;
        canvas.height = ch;
      }

      if (resized || base !== drawn.base || bucket !== drawn.bucket) {
        const exact = getFrameExact(base);
        const a = exact ?? getFrame(base);
        if (a) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'medium';
          drawCover(ctx, a, cw, ch, 1);
          let complete = !!exact;
          if (bucket > 0) {
            const b = getFrameExact(base + 1);
            if (b) drawCover(ctx, b, cw, ch, bucket / BLEND_STEPS);
            else complete = false;
          }
          // Not complete (frame still decoding): leave state stale so the next tick retries.
          drawn = complete ? { base, bucket } : { base: -1, bucket: -1 };
        }
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      mq.removeEventListener('change', onMotionChange);
    };
  }, [ready, totalFrames, nativeW, hold, getFrame, getFrameExact, prefetch, setStoreProgress]);

  // Zoom the camera into the central monitor, then open the OS once the move is nearly done.
  const zoomTimer = useRef<number | undefined>(undefined);
  const handleOpenOS = useCallback(
    (module?: OSModuleId, slug?: string) => {
      if (!manifest || prefersReducedMotion()) {
        onOpenOS(module, slug);
        return;
      }
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const center = manifest.screens?.center ?? manifest.screenQuad;
      const quad = getCoverQuadInViewport(center, manifest.desktop.width, manifest.desktop.height, vw, vh);
      const xs = quad.map((p) => p[0]);
      const ys = quad.map((p) => p[1]);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      const s = Math.min(3.4, Math.min((vw * 0.92) / (maxX - minX), (vh * 0.9) / (maxY - minY)));
      setZoom({ s, tx: vw / 2 - ((minX + maxX) / 2) * s, ty: vh / 2 - ((minY + maxY) / 2) * s });
      window.clearTimeout(zoomTimer.current);
      zoomTimer.current = window.setTimeout(() => onOpenOS(module, slug), ZOOM_MS - 60);
    },
    [manifest, onOpenOS],
  );

  // When the OS closes, zoom back out of the monitor.
  const opened = useRef(false);
  useEffect(() => {
    if (osOpen) {
      opened.current = true;
    } else if (opened.current) {
      opened.current = false;
      setZoom(null);
    }
  }, [osOpen]);
  useEffect(() => () => window.clearTimeout(zoomTimer.current), []);

  return (
    <div className="film-player-container" style={{ position: 'relative' }}>
      {/* 700vh native scroll track */}
      <div
        className="scroll-track"
        style={{ height: '700vh', width: '100%', pointerEvents: 'none', position: 'relative' }}
      />

      {/* Stage: the canvas and the on-monitor screens move together when the camera zooms into the monitor */}
      <div
        className="film-stage"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10,
          transformOrigin: '0 0',
          transform: zoom ? `translate3d(${zoom.tx}px, ${zoom.ty}px, 0) scale(${zoom.s})` : 'none',
          transition: `transform ${ZOOM_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`,
          willChange: zoom ? 'transform' : 'auto',
        }}
      >
        <canvas
          ref={canvasRef}
          className="film-canvas"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            backgroundColor: '#07080a',
          }}
        />

        {manifest && (
          <ScreenPreview
            visible={terminalVisible}
            rawQuad={manifest.screenQuad}
            screens={manifest.screens}
            // The monitor quads are measured on the 1600x900 desktop frames; the mobile frames have the same aspect ratio,
            // so cover-fit geometry must use the desktop size or the panels drift off their monitors on phones.
            nativeWidth={manifest.desktop.width}
            nativeHeight={manifest.desktop.height}
            onOpenOS={handleOpenOS}
          />
        )}
      </div>

      {/* Loading banner until the poster and the final frame are decoded */}
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
          <div style={{ fontSize: '0.85rem', color: '#e8a23a', letterSpacing: '0.1em', marginBottom: '1rem' }}>
            // LOADING THE CAVE
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
          <div style={{ fontSize: '0.75rem', color: '#9e9a8e' }}>{Math.round(loadProgress * 100)}%</div>
        </div>
      )}
    </div>
  );
};
