import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { HandIllustration } from './HandIllustration';
import { ContactOverlay } from './ContactOverlay';
import { useGsap, gsap } from '../useGsap';

interface Point {
  x: number;
  y: number;
}

export const HireMe: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const handRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [overlayOpen, setOverlayOpen] = useState(false);
  const [stringPaths, setStringPaths] = useState<string[]>([]);
  const swayPhase = useRef(0);
  const inView = useRef(false);
  const rafId = useRef<number | null>(null);

  // Motion 3D Tilt for glossy button
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 220 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springConfig);

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Measure and compute string coordinates between hand and button
  const computeAnchors = useCallback(() => {
    if (!buttonRef.current || !handRef.current || !svgRef.current) return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const btnRect = buttonRef.current.getBoundingClientRect();
    const handRect = handRef.current.getBoundingClientRect();

    if (svgRect.width === 0 || svgRect.height === 0) return;

    // Button anchors (5 connection points along the bottom/left edge of the button)
    const btnAnchors: Point[] = [
      { x: btnRect.left - svgRect.left + btnRect.width * 0.15, y: btnRect.top - svgRect.top + btnRect.height * 0.75 },
      { x: btnRect.left - svgRect.left + btnRect.width * 0.32, y: btnRect.top - svgRect.top + btnRect.height * 0.9 },
      { x: btnRect.left - svgRect.left + btnRect.width * 0.50, y: btnRect.top - svgRect.top + btnRect.height * 0.95 },
      { x: btnRect.left - svgRect.left + btnRect.width * 0.68, y: btnRect.top - svgRect.top + btnRect.height * 0.9 },
      { x: btnRect.left - svgRect.left + btnRect.width * 0.85, y: btnRect.top - svgRect.top + btnRect.height * 0.75 },
    ];

    // Fingertips inside Hand SVG (viewBox 0 0 320 360 scaled to handRect)
    const scaleX = handRect.width / 320;
    const scaleY = handRect.height / 360;
    const handLeft = handRect.left - svgRect.left;
    const handTop = handRect.top - svgRect.top;

    const fingerAnchors: Point[] = [
      { x: handLeft + 98 * scaleX, y: handTop + 65 * scaleY },   // Thumb
      { x: handLeft + 140 * scaleX, y: handTop + 22 * scaleY },  // Index
      { x: handLeft + 178 * scaleX, y: handTop + 16 * scaleY },  // Middle
      { x: handLeft + 214 * scaleX, y: handTop + 32 * scaleY },  // Ring
      { x: handLeft + 246 * scaleX, y: handTop + 56 * scaleY },  // Pinky
    ];

    // Build curved bezier string paths with subtle sway
    const paths = fingerAnchors.map((start, i) => {
      const end = btnAnchors[i];
      const midX = (start.x + end.x) * 0.5;
      const midY = (start.y + end.y) * 0.5;
      const swayOffset = Math.sin(swayPhase.current + i * 0.8) * 8;
      const ctrlX = midX + swayOffset - 15;
      const ctrlY = midY - 10 + swayOffset * 0.5;
      return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
    });

    setStringPaths(paths);
  }, []);

  // Update anchors on mount, resize, and scroll
  useEffect(() => {
    computeAnchors();
    window.addEventListener('resize', computeAnchors);
    window.addEventListener('scroll', computeAnchors, { passive: true });

    return () => {
      window.removeEventListener('resize', computeAnchors);
      window.removeEventListener('scroll', computeAnchors);
    };
  }, [computeAnchors]);

  // Gentle rAF sway loop when section is in viewport
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    let lastTime = performance.now();

    const loop = (now: number) => {
      if (!inView.current) {
        rafId.current = null;
        return;
      }

      const dt = (now - lastTime) / 1000;
      lastTime = now;
      swayPhase.current += dt * 1.8;

      computeAnchors();
      rafId.current = requestAnimationFrame(loop);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        inView.current = entries[0].isIntersecting;
        if (inView.current && !rafId.current) {
          lastTime = performance.now();
          rafId.current = requestAnimationFrame(loop);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      observer.disconnect();
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [computeAnchors]);

  // GSAP: Section entrance + string stroke dash + periodic hand tug
  useGsap(sectionRef, (_ctx, reduced) => {
    if (reduced) return;

    // Strings draw in on scroll
    gsap.fromTo(
      '.puppet-string',
      { strokeDasharray: 600, strokeDashoffset: 600 },
      {
        strokeDashoffset: 0,
        duration: 1.4,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
      }
    );

    // Periodic gentle hand tug
    const tugTl = gsap.timeline({ repeat: -1, repeatDelay: 3.2 });
    tugTl
      .to('.puppet-hand-wrap', {
        y: 6,
        x: -4,
        rotation: -2,
        duration: 0.35,
        ease: 'power2.inOut',
      })
      .to(
        '.puppet-btn-wrap',
        {
          y: 3,
          x: -2,
          duration: 0.35,
          ease: 'power2.inOut',
        },
        '<'
      )
      .to('.puppet-hand-wrap', {
        y: 0,
        x: 0,
        rotation: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.4)',
      })
      .to(
        '.puppet-btn-wrap',
        {
          y: 0,
          x: 0,
          duration: 0.7,
          ease: 'elastic.out(1, 0.4)',
        },
        '<'
      );
  });

  return (
    <section
      id="hire"
      ref={sectionRef}
      className="relative bg-[#EAE8E2] text-[#0d0d0d] py-24 sm:py-36 px-6 sm:px-12 lg:px-20 overflow-hidden select-none"
    >
      {/* SVG Canvas for Strings */}
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 w-full h-full z-20"
      >
        {stringPaths.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="#0d0d0d"
            strokeWidth="1.6"
            strokeDasharray="4 2"
            strokeOpacity="0.75"
            strokeLinecap="round"
            className="puppet-string"
          />
        ))}
      </svg>

      <div className="max-w-5xl mx-auto relative z-30 flex flex-col items-center text-center space-y-8">
        {/* Editorial Subheader */}
        <div className="font-mono text-xs tracking-[0.28em] text-[#0d0d0d]/70 uppercase">
          // 06 · INITIATE PROTOCOL
        </div>

        {/* Big Editorial Headline */}
        <h2 className="font-anton text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tight text-[#0d0d0d] max-w-3xl leading-[0.94]">
          READY TO BUILD SOMETHING RELIABLE?
        </h2>

        <p className="font-serif italic text-xl sm:text-2xl text-[#0d0d0d]/80 max-w-xl">
          "Hardware-optimized inference, computer vision, and robust full-stack edge systems."
        </p>

        {/* Interactive Puppet String Button & Hand Cluster */}
        <div className="relative pt-8 pb-16 w-full max-w-lg flex flex-col items-center min-h-[380px] justify-between">
          {/* Top: Glossy Black Pill Button */}
          <div className="puppet-btn-wrap relative z-30">
            <motion.button
              ref={buttonRef}
              type="button"
              onClick={() => setOverlayOpen(true)}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              className="relative px-8 sm:px-12 py-4 sm:py-5 rounded-full text-sm sm:text-base font-mono font-bold tracking-[0.2em] text-[#ece6d8] uppercase cursor-pointer shadow-[0_16px_36px_rgba(13,13,13,0.35)] overflow-hidden transition-shadow"
            >
              {/* Button Layered Jet-Black Glossy Background */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-b from-[#24221f] via-[#12110f] to-[#050505] rounded-full border border-white/20"
              />

              {/* Inner Gloss Rim Highlight */}
              <div
                aria-hidden="true"
                className="absolute inset-[1px] rounded-full border-t border-white/30 pointer-events-none"
              />

              {/* Shimmer Sweep Accent */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f2c230]/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"
              />

              {/* Button Text */}
              <span className="relative z-10 flex items-center gap-3 drop-shadow-sm">
                <span>LET'S COLLABORATE</span>
                <span className="text-[#f2c230]" aria-hidden="true">→</span>
              </span>
            </motion.button>
          </div>

          {/* Bottom-Left: Detailed Hand Pulling the Strings */}
          <div className="puppet-hand-wrap w-56 sm:w-64 h-64 sm:h-72 self-start ml-4 sm:ml-8 mt-12 relative z-20">
            <div ref={handRef} className="w-full h-full">
              <HandIllustration className="w-full h-full drop-shadow-md" />
            </div>
          </div>
        </div>

        {/* Small Instruction Footnote */}
        <div className="font-mono text-xs text-[#0d0d0d]/60">
          CLICK BUTTON TO OPEN TRANSMISSION DOSSIER · DIRECT INBOX DISPATCH
        </div>
      </div>

      {/* Accessible Contact Dialog Overlay */}
      <ContactOverlay open={overlayOpen} onOpenChange={setOverlayOpen} triggerRef={buttonRef} />
    </section>
  );
};
