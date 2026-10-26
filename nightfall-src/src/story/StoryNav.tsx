import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { getCVUrl } from '@/lib/assets';
import { STORY_SECTIONS } from './config';

export const StoryNav: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const cvUrl = getCVUrl();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the intersecting section with highest intersection ratio
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          setActiveSection(visible[0].target.id);
        }
      },
      {
        threshold: [0.15, 0.5, 0.8],
        rootMargin: '-80px 0px -40% 0px',
      }
    );

    STORY_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-3.5 backdrop-blur-md bg-[#0b0a09]/85 border-b border-[#ece6d8]/10 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Branding & Volume indicator */}
        <a
          href="#hero"
          onClick={scrollTo('hero')}
          className="flex items-center gap-2.5 text-[#ece6d8] hover:text-[#f2c230] transition-colors group"
        >
          <span className="font-anton tracking-wider text-base sm:text-lg">NISHANT JAIN</span>
          <span className="text-[#ece6d8]/30 font-mono text-xs">/</span>
          <span className="hidden md:inline font-mono text-[11px] tracking-[0.18em] text-[#ece6d8]/60 uppercase">
            STORY — VOL. 01
          </span>
        </a>

        {/* Center: Section Links with Motion layoutId underline */}
        <nav className="hidden lg:flex items-center gap-1 sm:gap-2" aria-label="Story Sections">
          {STORY_SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                onClick={scrollTo(sec.id)}
                className={`relative px-3 py-1.5 font-mono text-xs tracking-wider transition-colors ${
                  isActive ? 'text-[#ece6d8] font-semibold' : 'text-[#ece6d8]/55 hover:text-[#ece6d8]'
                }`}
              >
                <span>{sec.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="story-nav-active"
                    className="absolute left-2 right-2 bottom-0 h-[2px] bg-[#f2c230]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 font-mono text-xs">
          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded border border-[#ece6d8]/20 text-[#ece6d8] hover:border-[#f2c230] hover:text-[#f2c230] transition-all"
            title="Download official curriculum vitae"
          >
            CV ↗
          </a>

          <a
            href="/nightfall/"
            className="px-3.5 py-1.5 rounded bg-[#f2c230] text-[#0b0a09] font-bold tracking-wider hover:bg-[#ece6d8] transition-all shadow-[0_0_15px_rgba(242,194,48,0.3)] flex items-center gap-1.5"
            title="Enter 3D Subterranean Batcave / Film Experience"
          >
            <span>ENTER CAVE</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </header>
  );
};
