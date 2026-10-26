import React, { useRef } from 'react';
import { profile, education } from '@/content/profile';
import { PORTRAIT_SRC } from '../config';
import { Flashlight } from '../Flashlight';
import { useGsap, gsap } from '../useGsap';

export const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useGsap(heroRef, (_ctx, reduced) => {
    if (reduced) return;

    // Timeline for hero entrance
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    // Stagger character / word reveals
    tl.from('.hero-reveal-line', {
      y: 60,
      opacity: 0,
      duration: 1.1,
      stagger: 0.12,
    })
      .from(
        '.hero-portrait-crop',
        {
          clipPath: 'inset(100% 0% 0% 0%)',
          duration: 1.3,
          ease: 'power3.inOut',
        },
        '-=0.8'
      )
      .from(
        '.hero-meta-item',
        {
          y: 20,
          opacity: 0,
          duration: 0.8,
          stagger: 0.08,
        },
        '-=0.6'
      );

    // Parallax portrait on scroll
    gsap.to('.hero-portrait-img', {
      yPercent: 18,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  /* Shared content layout used by both base and lit layers */
  const renderComposition = (isLit: boolean) => (
    <div className="relative min-h-screen w-full flex flex-col justify-between p-6 sm:p-12 lg:p-16 pt-24 sm:pt-28">
      {/* Top Metadata Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#ece6d8]/15 pb-4 font-mono text-[11px] tracking-[0.2em] text-[#ece6d8]/70 uppercase">
        <div className="flex items-center gap-3 hero-meta-item">
          <span className="w-2 h-2 rounded-full bg-[#f2c230] animate-pulse" />
          <span>PORTFOLIO — VOL. 01</span>
          <span className="text-[#ece6d8]/30">|</span>
          <span>{profile.location.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-4 hero-meta-item">
          <span>{profile.title}</span>
          <span className="text-[#ece6d8]/30">|</span>
          <span className="text-[#f2c230]">IDX 01</span>
        </div>
      </div>

      {/* Center Hero Grid: Giant Typography + Art-Directed Portrait */}
      <div className="my-auto py-8 lg:py-12 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Monolithic Typographic Stack */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          <div className="font-mono text-xs sm:text-sm tracking-[0.25em] text-[#f2c230] uppercase flex items-center gap-2 hero-reveal-line">
            <span>[ SYSTEM ARCHITECT &amp; EDGE AI ]</span>
          </div>

          <div className="overflow-hidden space-y-1">
            <h1 className="hero-reveal-line font-anton text-[4.8rem] sm:text-[7.2rem] lg:text-[8.8rem] leading-[0.88] tracking-tight uppercase select-none text-[#ece6d8]">
              NISHANT
            </h1>
            <h1
              className={`hero-reveal-line font-anton text-[4.8rem] sm:text-[7.2rem] lg:text-[8.8rem] leading-[0.88] tracking-tight uppercase select-none ${
                isLit
                  ? 'text-[#f2c230] drop-shadow-[0_0_35px_rgba(242,194,48,0.45)]'
                  : 'text-transparent'
              }`}
              style={{
                WebkitTextStroke: isLit ? 'none' : '1.5px rgba(236, 230, 216, 0.45)',
              }}
            >
              JAIN
            </h1>
          </div>

          {/* Tagline in Instrument Serif Italic */}
          <p
            className={`font-serif italic text-2xl sm:text-3xl lg:text-4xl leading-snug max-w-xl transition-colors ${
              isLit ? 'text-white' : 'text-[#ece6d8]/80'
            }`}
          >
            "{profile.tagline}"
          </p>

          <p className="font-mono text-xs sm:text-[13px] text-[#ece6d8]/60 max-w-lg leading-relaxed pt-2">
            Engineering production edge systems across computer vision, NVIDIA Jetson, and real-time distributed hardware.
          </p>
        </div>

        {/* Right Column: Tall Art-Directed Portrait Crop with Editorial Framing */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
          <div className="hero-portrait-crop relative w-64 sm:w-72 lg:w-80 h-[380px] sm:h-[460px] overflow-hidden rounded-sm border border-[#ece6d8]/20 bg-[#12110f]">
            <img
              src={PORTRAIT_SRC}
              alt="Nishant Jain"
              className={`hero-portrait-img w-full h-full object-cover transition-all duration-300 ${
                isLit
                  ? 'brightness-110 contrast-115 grayscale-0'
                  : 'brightness-70 contrast-125 grayscale opacity-70'
              }`}
            />

            {/* Vintage Editorial Corner Registration Marks */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#ece6d8]/40" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#ece6d8]/40" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#ece6d8]/40" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#ece6d8]/40" />

            {/* Caption badge */}
            <div className="absolute bottom-3 left-3 right-3 px-2.5 py-1.5 bg-[#0b0a09]/85 backdrop-blur-sm border border-[#ece6d8]/15 font-mono text-[10px] tracking-wider text-[#ece6d8]/75 flex justify-between">
              <span>FIG. 01 — PORTRAIT</span>
              <span className="text-[#f2c230]">LIVE</span>
            </div>
          </div>

          {/* Editorial Hairline Callouts (Revealed prominently in Lit Layer) */}
          {isLit && (
            <>
              {/* Callout 1: Top Right */}
              <div className="absolute -top-4 -right-2 sm:-right-8 bg-[#0b0a09]/90 border border-[#f2c230] p-2.5 rounded shadow-[0_0_20px_rgba(242,194,48,0.3)] font-mono text-[11px] text-[#ece6d8] max-w-[210px] animate-in fade-in zoom-in-95 duration-200">
                <span className="text-[#f2c230] font-bold block">// SPECIALIZATION</span>
                <span>AI/ML &amp; IoT Engineer</span>
              </div>

              {/* Callout 2: Mid Left */}
              <div className="absolute top-1/2 -left-4 sm:-left-12 -translate-y-1/2 bg-[#0b0a09]/90 border border-[#ece6d8]/50 p-2.5 rounded shadow-xl font-mono text-[11px] text-[#ece6d8] max-w-[200px] animate-in fade-in zoom-in-95 duration-200">
                <span className="text-[#5a7dff] font-bold block">// HARDWARE FLEET</span>
                <span>Edge AI · NVIDIA Jetson</span>
              </div>

              {/* Callout 3: Bottom Right */}
              <div className="absolute -bottom-6 -right-2 sm:-right-6 bg-[#0b0a09]/90 border border-[#e2482f] p-2.5 rounded shadow-[0_0_20px_rgba(226,72,47,0.3)] font-mono text-[11px] text-[#ece6d8] max-w-[220px] animate-in fade-in zoom-in-95 duration-200">
                <span className="text-[#e2482f] font-bold block">// INTELLECTUAL PROPERTY</span>
                <span>Patent applicant — not granted</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Editorial Caption Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#ece6d8]/15 pt-4 font-mono text-xs text-[#ece6d8]/60">
        <div className="flex items-center gap-2">
          <span className="text-[#f2c230]">★</span>
          <span>{education.degree} · {education.institution} ({education.period})</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline">EXPLORE WORK BELOW</span>
          <span className="animate-bounce">↓</span>
        </div>
      </div>
    </div>
  );

  return (
    <section id="hero" ref={heroRef} className="relative min-h-screen bg-[#0b0a09] text-[#ece6d8]">
      <Flashlight
        base={renderComposition(false)}
        lit={renderComposition(true)}
        radius={290}
        glow={true}
        glowColor="rgba(242, 194, 48, 0.18)"
        className="min-h-screen"
      />
    </section>
  );
};
