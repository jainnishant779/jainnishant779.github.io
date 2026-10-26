import React, { useEffect, useRef } from 'react';

export interface FlashlightProps {
  /** The base background / unlit layer (dimmed composition) */
  base: React.ReactNode;
  /** The lit layer that is revealed under the torch beam */
  lit: React.ReactNode;
  /** Radius of the torch beam in pixels (default: 260) */
  radius?: number;
  /** Whether to render an ambient warm halo glow behind the mask (default: true) */
  glow?: boolean;
  glowColor?: string;
  className?: string;
}

/**
 * Reusable editorial torch reveal component.
 * Two stacked layers. The lit layer uses a radial-gradient mask that tracks pointer/touch.
 * A single rAF lerp loop writes directly to CSS variables (--x, --y) with zero React re-renders.
 * Automatically halts when out of viewport.
 * Falls back to a static wide beam on reduced motion, touch-only, or low-power hardware.
 */
export const Flashlight: React.FC<FlashlightProps> = ({
  base,
  lit,
  radius = 280,
  glow = true,
  glowColor = 'rgba(242, 194, 48, 0.16)',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetPos = useRef({ x: 0, y: 0 });
  const currPos = useRef({ x: 0, y: 0 });
  const isHovered = useRef(false);
  const rafId = useRef<number | null>(null);
  const inView = useRef(false);
  const isStaticMode = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Detect reduced motion, coarse pointer, or low-core hardware
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const lowCores = typeof navigator !== 'undefined' && navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false;

    if (reducedMotion || (coarsePointer && lowCores)) {
      isStaticMode.current = true;
      el.style.setProperty('--x', '50%');
      el.style.setProperty('--y', '45%');
      el.style.setProperty('--r', `${radius * 2}px`);
      return;
    }

    // Initialize position to center
    const rect = el.getBoundingClientRect();
    const startX = rect.width > 0 ? rect.width * 0.5 : 400;
    const startY = rect.height > 0 ? rect.height * 0.45 : 300;
    currPos.current = { x: startX, y: startY };
    targetPos.current = { x: startX, y: startY };
    el.style.setProperty('--x', `${startX}px`);
    el.style.setProperty('--y', `${startY}px`);
    el.style.setProperty('--r', `${radius}px`);

    let lastTime = performance.now();

    const loop = (now: number) => {
      if (!inView.current) {
        rafId.current = null;
        return;
      }

      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const currentRect = el.getBoundingClientRect();
      const w = currentRect.width || 800;
      const h = currentRect.height || 600;

      // Idle scripted drift when pointer is inactive
      if (!isHovered.current) {
        const timeSec = now / 1000;
        targetPos.current = {
          x: w * 0.5 + Math.sin(timeSec * 0.9) * (w * 0.22),
          y: h * 0.45 + Math.cos(timeSec * 0.7) * (h * 0.18),
        };
      }

      // Smooth lerp easing
      const lerpFactor = Math.min(1, dt * 8);
      currPos.current.x += (targetPos.current.x - currPos.current.x) * lerpFactor;
      currPos.current.y += (targetPos.current.y - currPos.current.y) * lerpFactor;

      el.style.setProperty('--x', `${currPos.current.x.toFixed(1)}px`);
      el.style.setProperty('--y', `${currPos.current.y.toFixed(1)}px`);

      rafId.current = requestAnimationFrame(loop);
    };

    // IntersectionObserver so loop runs ONLY when in viewport
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        inView.current = entry.isIntersecting;
        if (inView.current && !rafId.current) {
          lastTime = performance.now();
          rafId.current = requestAnimationFrame(loop);
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [radius]);

  const updatePointer = (clientX: number, clientY: number) => {
    if (isStaticMode.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    targetPos.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
    isHovered.current = true;
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden select-none ${className}`}
      style={{
        ['--r' as string]: `${radius}px`,
        ['--x' as string]: '50%',
        ['--y' as string]: '45%',
      }}
      onPointerMove={(e) => updatePointer(e.clientX, e.clientY)}
      onPointerEnter={() => { isHovered.current = true; }}
      onPointerLeave={() => { isHovered.current = false; }}
      onTouchStart={(e) => {
        if (e.touches[0]) updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchMove={(e) => {
        if (e.touches[0]) updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }}
    >
      {/* Layer 1: Dimmed Base Composition */}
      <div className="w-full h-full pointer-events-auto">
        {base}
      </div>

      {/* Layer 2: Ambient Torch Halo Glow */}
      {glow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle calc(var(--r) * 1.35) at var(--x) var(--y), ${glowColor} 0%, rgba(242, 194, 48, 0.05) 50%, transparent 75%)`,
          }}
        />
      )}

      {/* Layer 3: High-Contrast Lit Reveal Layer with Radial Mask */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
        style={{
          maskImage: 'radial-gradient(circle var(--r) at var(--x) var(--y), #000 0%, #000 35%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(circle var(--r) at var(--x) var(--y), #000 0%, #000 35%, transparent 100%)',
        }}
      >
        {lit}
      </div>
    </div>
  );
};
