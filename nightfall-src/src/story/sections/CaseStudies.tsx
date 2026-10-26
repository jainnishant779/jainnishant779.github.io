import React, { useRef } from 'react';
import { DESK_PROJECTS } from '@/film/screens/deskProjects';
import { projects } from '@/content/projects';
import { getFlow } from '@/content/diagrams';
import { FlowDiagram } from '@/components/kit/FlowDiagram';
import { getProjectImageUrl } from '@/lib/assets';
import { useGsap, gsap } from '../useGsap';

export const CaseStudies: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Match the desk console order
  const orderedProjects = DESK_PROJECTS.map((dp) => {
    const full = projects.find((p) => p.slug === dp.slug);
    return {
      ...dp,
      description: full?.description || [],
    };
  });

  useGsap(sectionRef, (_ctx, reduced) => {
    if (reduced || window.innerWidth < 1024) return;

    const panels = gsap.utils.toArray<HTMLElement>('.case-panel');
    if (panels.length <= 1) return;

    gsap.to(panels, {
      xPercent: -100 * (panels.length - 1),
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        pin: true,
        scrub: 1,
        // Calculate scroll distance based on panel count
        end: () => `+=${window.innerWidth * (panels.length - 0.75)}`,
        invalidateOnRefresh: true,
      },
    });
  });

  return (
    <section
      id="work"
      ref={sectionRef}
      className="relative bg-[#0b0a09] text-[#ece6d8] border-t border-[#ece6d8]/10 overflow-hidden"
    >
      {/* Editorial Section Header */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 pt-16 pb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[#ece6d8]/10">
        <div>
          <span className="font-mono text-xs tracking-[0.22em] text-[#f2c230] uppercase block">
            // 02 · ARCHIVAL DOSSIER
          </span>
          <h2 className="font-anton text-4xl sm:text-6xl tracking-tight uppercase mt-1">
            SELECTED CASE STUDIES
          </h2>
        </div>
        <div className="font-mono text-xs text-[#ece6d8]/60 max-w-sm text-right">
          <span>5 PRODUCTION SYSTEMS &amp; SYSTEM ARCHITECTURES</span>
          <div className="hidden lg:block text-[#f2c230] mt-1">SCROLL HORIZONTALLY TO INSPECT →</div>
        </div>
      </div>

      {/* Horizontal Slider Track (Desktop) / Vertical Stack (Mobile) */}
      <div
        ref={trackRef}
        className="flex flex-col lg:flex-row lg:w-[500vw] lg:h-screen lg:flex-nowrap"
      >
        {orderedProjects.map((p, idx) => {
          const flow = getFlow(p.slug);
          const imgSrc = getProjectImageUrl(p.slug);
          const numStr = String(idx + 1).padStart(2, '0');

          return (
            <div
              key={p.slug}
              className="case-panel w-full lg:w-[100vw] lg:h-screen flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 lg:py-8 border-b lg:border-b-0 lg:border-r border-[#ece6d8]/10 shrink-0"
            >
              <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                {/* Left: Editorial Details */}
                <div className="lg:col-span-5 space-y-4 sm:space-y-5">
                  <div className="flex items-center gap-3">
                    <span className="font-anton text-5xl sm:text-6xl text-[#f2c230] tracking-tight">
                      {numStr}
                    </span>
                    <div className="h-px flex-1 bg-[#ece6d8]/20" />
                    <span className="px-2.5 py-1 rounded bg-[#ece6d8]/10 border border-[#ece6d8]/20 font-mono text-[10px] tracking-widest text-[#ece6d8] uppercase">
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-2xl sm:text-3xl text-white leading-tight">
                    {p.title}
                  </h3>

                  {/* Problem & Solution from CV descriptions */}
                  <div className="space-y-3 font-mono text-xs leading-relaxed text-[#ece6d8]/80 border-l-2 border-[#f2c230]/50 pl-3.5">
                    {p.description.slice(0, 2).map((desc, dIdx) => (
                      <p key={dIdx}>{desc}</p>
                    ))}
                  </div>

                  {/* Stack Typeset */}
                  <div>
                    <span className="font-mono text-[10px] tracking-widest text-[#ece6d8]/50 uppercase block mb-1.5">
                      TECHNOLOGY STACK
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {p.stack.map((item) => (
                        <span
                          key={item}
                          className="px-2 py-0.5 rounded bg-[#12110f] border border-[#ece6d8]/15 font-mono text-[11px] text-[#ece6d8]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Links / Provenance */}
                  <div className="pt-2 flex items-center gap-4 font-mono text-xs">
                    {p.slug === 'edgedesk' ? (
                      <span className="text-[#f2c230] flex items-center gap-1.5">
                        <span>🔒</span>
                        <span>Source private — patent application filed</span>
                      </span>
                    ) : (
                      <a
                        href="https://github.com/jainnishant779"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#f2c230] hover:text-white underline underline-offset-4 transition-colors"
                      >
                        GitHub profile ↗
                      </a>
                    )}
                  </div>
                </div>

                {/* Right: Architecture Flow Diagram + Illustrative Image Inset */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  <div className="p-4 sm:p-6 rounded bg-[#100f0d] border border-[#ece6d8]/15 shadow-2xl">
                    <div className="flex items-center justify-between pb-3 border-b border-[#ece6d8]/10 mb-4 font-mono text-[10px] text-[#ece6d8]/60 uppercase tracking-widest">
                      <span>SYSTEM ARCHITECTURE DIAGRAM</span>
                      <span className="text-[#f2c230]">INTERACTIVE NODES</span>
                    </div>

                    {flow ? (
                      <FlowDiagram flow={flow} variant="editorial" compact={window.innerWidth < 640} />
                    ) : (
                      <div className="h-40 flex items-center justify-center font-mono text-xs text-[#ece6d8]/40">
                        Architecture spec in CV
                      </div>
                    )}
                  </div>

                  {/* Small captioned illustrative image inset */}
                  <div className="flex items-center gap-4 p-2.5 rounded bg-[#12110f] border border-[#ece6d8]/10">
                    <img
                      src={imgSrc}
                      alt={p.title}
                      className="w-16 h-12 object-cover rounded border border-[#ece6d8]/20 shrink-0"
                    />
                    <div className="font-mono text-[10px] leading-tight text-[#ece6d8]/60">
                      <span className="text-[#ece6d8] font-semibold block">ILLUSTRATIVE ARTWORK</span>
                      <span>Representative pipeline visual for {p.shortTitle}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
