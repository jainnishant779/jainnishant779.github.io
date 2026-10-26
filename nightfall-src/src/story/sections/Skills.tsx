import React, { useState } from 'react';
import { skillGroups } from '@/content/skills';
import { projects } from '@/content/projects';

export const Skills: React.FC = () => {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  // Derive which projects use the hovered skill
  const matchingProjects = hoveredSkill
    ? projects.filter((p) =>
        p.stack.some(
          (s) =>
            s.toLowerCase().includes(hoveredSkill.toLowerCase()) ||
            hoveredSkill.toLowerCase().includes(s.toLowerCase())
        )
      )
    : [];

  return (
    <section
      id="skills"
      className="relative bg-[#0b0a09] text-[#ece6d8] py-20 sm:py-28 px-6 sm:px-12 lg:px-20 border-t border-[#ece6d8]/10"
    >
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Index Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b border-[#ece6d8]/10">
          <div>
            <span className="font-mono text-xs tracking-[0.22em] text-[#f2c230] uppercase block">
              // 04 · CAPABILITIES MATRIX
            </span>
            <h2 className="font-anton text-4xl sm:text-6xl uppercase tracking-tight text-white mt-1">
              TECHNICAL REPERTOIRE
            </h2>
          </div>
          <div className="font-mono text-xs text-[#ece6d8]/60 text-right max-w-xs">
            <span>HOVER ANY CAPABILITY TO TRACE CORRESPONDING CASE STUDY DEPLOYMENTS</span>
          </div>
        </div>

        {/* Dynamic Project Tracer Banner */}
        <div className="min-h-[44px] flex items-center gap-3 p-3 rounded bg-[#12110f] border border-[#ece6d8]/15 font-mono text-xs transition-colors">
          <span className="text-[#f2c230] font-bold">PROVENANCE TRACER:</span>
          {hoveredSkill ? (
            matchingProjects.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-white font-semibold">[{hoveredSkill}] deployed in:</span>
                {matchingProjects.map((mp) => (
                  <span
                    key={mp.slug}
                    className="px-2 py-0.5 rounded bg-[#f2c230]/15 text-[#f2c230] border border-[#f2c230]/30 font-medium"
                  >
                    {mp.title.split(':')[0]}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[#ece6d8]/60">
                [{hoveredSkill}] — Core domain tool utilized across production pipeline
              </span>
            )
          ) : (
            <span className="text-[#ece6d8]/40">
              Hover over any item in the index below to map to active projects
            </span>
          )}
        </div>

        {/* Numbered Skill Groups Index with Thin Rules */}
        <div className="divide-y divide-[#ece6d8]/10 border-y border-[#ece6d8]/10">
          {skillGroups.map((group, idx) => {
            const numStr = String(idx + 1).padStart(2, '0');
            return (
              <div
                key={group.group}
                className="py-6 sm:py-8 grid lg:grid-cols-12 gap-4 lg:gap-8 items-start group hover:bg-[#12110f]/50 transition-colors px-2 rounded-sm"
              >
                {/* Column 1: Number & Group Name */}
                <div className="lg:col-span-4 flex items-baseline gap-4">
                  <span className="font-mono text-xs text-[#f2c230] font-semibold">
                    {numStr}
                  </span>
                  <div>
                    <h3 className="font-display font-semibold text-lg sm:text-xl text-white group-hover:text-[#f2c230] transition-colors">
                      {group.group}
                    </h3>
                    {group.note && (
                      <span className="font-mono text-[11px] text-[#ece6d8]/50 block mt-0.5">
                        ({group.note})
                      </span>
                    )}
                  </div>
                </div>

                {/* Column 2: Typeset Skill Tags */}
                <div className="lg:col-span-8 flex flex-wrap gap-2 pt-1 sm:pt-0">
                  {group.skills.map((skill) => {
                    const isHovered = hoveredSkill === skill;
                    return (
                      <button
                        key={skill}
                        type="button"
                        onMouseEnter={() => setHoveredSkill(skill)}
                        onMouseLeave={() => setHoveredSkill(null)}
                        onFocus={() => setHoveredSkill(skill)}
                        onBlur={() => setHoveredSkill(null)}
                        className={`px-3 py-1.5 rounded text-xs font-mono transition-all duration-150 cursor-pointer ${
                          isHovered
                            ? 'bg-[#f2c230] text-[#0b0a09] font-bold shadow-[0_0_12px_rgba(242,194,48,0.4)] scale-105'
                            : 'bg-[#141310] border border-[#ece6d8]/15 text-[#ece6d8]/85 hover:border-[#ece6d8]/40 hover:text-white'
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
