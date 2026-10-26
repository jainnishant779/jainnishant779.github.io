import React from 'react';
import { profile, education } from '@/content/profile';

export const About: React.FC = () => {
  return (
    <section
      id="about"
      className="relative bg-[#0e0d0b] text-[#ece6d8] py-20 sm:py-28 px-6 sm:px-12 lg:px-20 border-t border-[#ece6d8]/10"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Index Header */}
        <div className="flex items-center gap-4 mb-12 sm:mb-16 pb-4 border-b border-[#ece6d8]/10 font-mono text-xs text-[#ece6d8]/60 uppercase tracking-[0.2em]">
          <span className="text-[#f2c230] font-bold">// 03 · BIOGRAPHICAL DOSSIER</span>
          <span className="text-[#ece6d8]/30">|</span>
          <span>BACKGROUND &amp; ACADEMICS</span>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Summary & Pull Quote */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <h2 className="font-anton text-4xl sm:text-6xl uppercase tracking-tight text-white leading-tight">
              ENGINEERING FOR CONSTRAINED COMPUTE
            </h2>

            {/* Pull Quote */}
            <blockquote className="border-l-2 border-[#f2c230] pl-6 py-2 font-serif italic text-2xl sm:text-3xl text-white leading-relaxed">
              "{profile.tagline}"
            </blockquote>

            {/* Profile Summary Paragraph */}
            <div className="font-body text-base sm:text-lg leading-relaxed text-[#ece6d8]/85 space-y-4">
              <p>
                {profile.summary}
              </p>
              <p className="font-mono text-xs sm:text-sm text-[#ece6d8]/65 leading-normal">
                Based in {profile.location}. Specialized in porting and accelerating deep learning models (YOLOv8, FaceNet, INT8 quantization) for deployment on embedded Linux hardware and edge clusters.
              </p>
            </div>
          </div>

          {/* Right Column: Academic Credentials & Coursework */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded bg-[#141310] border border-[#ece6d8]/15 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#ece6d8]/10 font-mono text-xs text-[#f2c230] uppercase tracking-wider">
                <span>ACADEMIC FOUNDATION</span>
                <span>{education.period}</span>
              </div>

              <div>
                <h3 className="font-display font-bold text-xl text-white">
                  {education.degree}
                </h3>
                <p className="font-mono text-xs text-[#ece6d8]/75 mt-1">
                  {education.institution} · {education.location}
                </p>
              </div>

              {education.coursework && education.coursework.length > 0 && (
                <div className="pt-2">
                  <span className="font-mono text-[10px] tracking-widest text-[#ece6d8]/50 uppercase block mb-2">
                    CORE TECHNICAL COURSEWORK
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {education.coursework.map((course) => (
                      <span
                        key={course}
                        className="px-2 py-1 rounded bg-[#0b0a09] border border-[#ece6d8]/15 font-mono text-xs text-[#ece6d8]"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Archival Note */}
            <div className="p-4 rounded border border-dashed border-[#ece6d8]/20 font-mono text-xs text-[#ece6d8]/60 flex items-start gap-3">
              <span className="text-[#f2c230] text-sm leading-none">ℹ</span>
              <p>
                All project implementations and performance claims are grounded in documented CV milestones and production deployments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
