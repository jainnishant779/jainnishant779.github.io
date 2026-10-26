import React from 'react';
import { profile } from '@/content/profile';
import { getCVUrl } from '@/lib/assets';

export const StoryFooter: React.FC = () => {
  const cvUrl = getCVUrl();

  return (
    <footer className="relative bg-[#070605] text-[#ece6d8] py-16 sm:py-20 px-6 sm:px-12 lg:px-20 border-t border-[#ece6d8]/10">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-[#ece6d8]/10">
          <div>
            <span className="font-anton text-4xl sm:text-6xl uppercase tracking-tight block text-white">
              NISHANT JAIN
            </span>
            <span className="font-mono text-xs sm:text-sm text-[#ece6d8]/60 mt-1 block">
              {profile.title} · {profile.location}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-mono text-xs">
            <a
              href="https://github.com/jainnishant779"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ece6d8]/70 hover:text-[#f2c230] transition-colors"
            >
              GitHub ↗
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ece6d8]/70 hover:text-[#f2c230] transition-colors"
            >
              LinkedIn ↗
            </a>
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ece6d8]/70 hover:text-[#f2c230] transition-colors"
            >
              Curriculum Vitae ↗
            </a>
            <a
              href={`mailto:${profile.email}`}
              className="text-[#ece6d8]/70 hover:text-[#f2c230] transition-colors"
            >
              Email ↗
            </a>
            <a
              href="/nightfall/"
              className="px-3.5 py-1.5 rounded bg-[#f2c230] text-[#0b0a09] font-bold tracking-wider hover:bg-white transition-colors"
            >
              ENTER CAVE ↗
            </a>
          </div>
        </div>

        {/* Bottom Colophon */}
        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-[#ece6d8]/40">
          <div>
            <span>© {new Date().getFullYear()} NISHANT JAIN · ALL RIGHTS RESERVED</span>
          </div>
          <div className="flex items-center gap-3">
            <span>EDITORIAL EDITION · VOL. 01</span>
            <span>|</span>
            <span>TYPESET IN ANTON &amp; INSTRUMENT SERIF</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
