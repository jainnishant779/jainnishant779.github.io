import React, { useRef } from 'react';
import { experiences } from '@/content/experience';
import { achievements, certifications } from '@/content/achievements';
import { useGsap, gsap } from '../useGsap';

export const Record: React.FC = () => {
  const recordRef = useRef<HTMLDivElement>(null);

  useGsap(recordRef, (_ctx, reduced) => {
    if (reduced) return;

    // Timeline spine scrubbed draw
    gsap.fromTo(
      '.timeline-spine-draw',
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        transformOrigin: 'top center',
        scrollTrigger: {
          trigger: '.timeline-container',
          start: 'top 75%',
          end: 'bottom 60%',
          scrub: true,
        },
      }
    );
  });

  return (
    <section
      id="record"
      ref={recordRef}
      className="relative bg-[#0e0d0b] text-[#ece6d8] py-20 sm:py-28 px-6 sm:px-12 lg:px-20 border-t border-[#ece6d8]/10"
    >
      <div className="max-w-6xl mx-auto space-y-16 sm:space-y-20">
        {/* Section Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b border-[#ece6d8]/10">
          <div>
            <span className="font-mono text-xs tracking-[0.22em] text-[#f2c230] uppercase block">
              // 05 · CHRONICLE OF RECORD
            </span>
            <h2 className="font-anton text-4xl sm:text-6xl uppercase tracking-tight text-white mt-1">
              ENGINEERING RECORD
            </h2>
          </div>
          <div className="font-mono text-xs text-[#ece6d8]/60 text-right">
            <span>EXPERIENCE, RECOGNITIONS &amp; CERTIFICATIONS</span>
          </div>
        </div>

        {/* Part 1: Experience Timeline */}
        <div className="timeline-container relative pl-6 sm:pl-10 space-y-12">
          {/* Scrubbed Spine Line */}
          <div
            aria-hidden="true"
            className="timeline-spine-draw absolute left-0 sm:left-2 top-2 bottom-4 w-[2px] bg-gradient-to-b from-[#f2c230] via-[#ece6d8]/40 to-[#ece6d8]/10"
          />

          {experiences.map((exp) => (
            <div key={`${exp.company}-${exp.role}`} className="relative group">
              {/* Timeline Indicator Node */}
              <div
                aria-hidden="true"
                className="absolute -left-[30px] sm:-left-[38px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#0b0a09] border-2 border-[#f2c230] group-hover:scale-125 transition-transform"
              />

              <div className="space-y-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-white">
                    {exp.role}
                  </h3>
                  <span className="font-mono text-xs text-[#f2c230] font-semibold">
                    {exp.period}
                  </span>
                </div>

                <div className="font-mono text-xs text-[#ece6d8]/70">
                  <span className="text-white font-medium">{exp.company}</span> · {exp.location}
                </div>

                <ul className="mt-3 space-y-2 font-body text-xs sm:text-sm text-[#ece6d8]/80 leading-relaxed list-none">
                  {exp.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2">
                      <span className="text-[#f2c230] font-mono text-xs select-none">›</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Part 2: Honors & Achievements Grid */}
        <div className="space-y-6 pt-6 border-t border-[#ece6d8]/10">
          <div className="flex items-center gap-3 font-mono text-xs tracking-widest text-[#f2c230] uppercase">
            <span>★ HONORS &amp; DISTINCTIONS</span>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {achievements.map((ach, idx) => {
              const isWinner = ach.title.toLowerCase().includes('winner');
              const isPatent = ach.title.toLowerCase().includes('patent');
              return (
                <div
                  key={idx}
                  className={`p-5 rounded border ${
                    isWinner
                      ? 'border-[#f2c230] bg-[#f2c230]/10 shadow-[0_0_20px_rgba(242,194,48,0.15)]'
                      : isPatent
                      ? 'border-[#e2482f]/60 bg-[#e2482f]/5'
                      : 'border-[#ece6d8]/15 bg-[#141310]'
                  }`}
                >
                  <span
                    className={`font-mono text-[10px] tracking-widest uppercase block mb-1 font-bold ${
                      isWinner ? 'text-[#f2c230]' : isPatent ? 'text-[#e2482f]' : 'text-[#5a7dff]'
                    }`}
                  >
                    {isWinner ? 'COMPETITION WINNER' : isPatent ? 'INTELLECTUAL PROPERTY' : 'FINALIST'}
                  </span>
                  <h4 className="font-display font-bold text-base text-white">
                    {ach.title}
                  </h4>
                  {ach.detail && (
                    <p className="font-mono text-xs text-[#ece6d8]/70 mt-1">
                      {isPatent ? 'Patent application filed — not granted' : ach.detail}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Part 3: Professional Certifications */}
        <div className="space-y-4 pt-6 border-t border-[#ece6d8]/10">
          <div className="font-mono text-xs tracking-widest text-[#ece6d8]/60 uppercase">
            TECHNICAL CERTIFICATIONS
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            {certifications.map((cert, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded bg-[#12110f] border border-[#ece6d8]/10 flex flex-col justify-between"
              >
                <span className="font-display font-medium text-xs sm:text-sm text-[#ece6d8]">
                  {cert.title}
                </span>
                <span className="font-mono text-[11px] text-[#f2c230] mt-1.5 block">
                  {cert.issuer}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
