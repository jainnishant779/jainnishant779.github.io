import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { sound } from '@/lib/sound';
import { getCVUrl } from '@/lib/assets';
import { profile, education } from '@/content/profile';
import { projects } from '@/content/projects';
import { experiences } from '@/content/experience';
import { achievements } from '@/content/achievements';
import { skillGroups } from '@/content/skills';
import { getFlow } from '@/content/diagrams';
import { FlowDiagram } from '@/components/kit/FlowDiagram';
import { HyperText } from '@/components/ui/hyper-text';
import { WordRotate } from '@/components/ui/word-rotate';
import { Marquee } from '@/components/ui/marquee';
import { MagicCard } from '@/components/ui/magic-card';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import type { OSModuleId } from '@/os/OSShell';
import { DESK_PROJECTS } from './deskProjects';

type Tab = 'home' | 'projects' | 'architecture' | 'contact';
const TABS: Tab[] = ['home', 'projects', 'architecture', 'contact'];
const CATEGORIES = ['All', 'AI/ML', 'Computer Vision', 'Edge AI', 'Research'];
const ROLES = profile.title.split(' · ');
const ALL_SKILLS = skillGroups.flatMap((g) => g.skills);

export interface MainScreenProps {
  activeSlug: string | null;
  onSelectProject: (slug: string | null) => void;
  onCycle: (direction: number) => void;
  onOpenOS: (module?: OSModuleId) => void;
}

const stat = (value: string | number, label: string) => (
  <div className="rounded-ctl border border-line-strong bg-bg-1/80 px-2.5 py-1.5" key={label}>
    <div className="font-display text-[1.05rem] font-bold leading-none text-accent">{value}</div>
    <div className="mt-1 text-[0.58rem] uppercase tracking-[0.1em] text-text-2">{label}</div>
  </div>
);

/** The centre monitor: about, project cards, architecture flows, contact, and the in-place project dossier. */
export function MainScreen({ activeSlug, onSelectProject, onCycle, onOpenOS }: MainScreenProps) {
  const reduced = useReducedMotion();
  const [tab, setTab] = useState<Tab>('home');
  const [category, setCategory] = useState('All');
  const [flowSlug, setFlowSlug] = useState(DESK_PROJECTS[0]?.slug ?? 'edgedesk');
  const cvUrl = getCVUrl();
  const companyCount = useMemo(() => new Set(experiences.map((e) => e.company)).size, []);
  const visibleProjects = category === 'All' ? projects : projects.filter((p) => p.category === category);
  const active = activeSlug ? projects.find((p) => p.slug === activeSlug) : null;
  const activeFlow = active ? getFlow(active.slug) : undefined;
  const view = active ? `dossier-${active.slug}` : tab;

  const go = (next: Tab) => {
    sound.playUiClick();
    onSelectProject(null);
    setTab(next);
  };

  const enter = reduced ? undefined : { opacity: 0, y: 8 };

  return (
    <div className="flex h-full min-h-0 flex-col" data-testid="main-screen">
      <div className="flex items-center gap-1.5 border-b border-accent/30 bg-bg-1/70 px-3 py-1.5">
        <span className="mr-1 flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-accent">
          <span className="size-1.5 animate-pulse rounded-full bg-accent" aria-hidden />
          MON-02
        </span>
        {TABS.map((t) => {
          const on = t === tab && !active;
          return (
            <button
              key={t}
              type="button"
              onClick={() => go(t)}
              className={cn(
                'cursor-pointer rounded-chip border px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.08em] transition-colors duration-[120ms]',
                on ? 'border-accent bg-accent text-bg-0' : 'border-line-strong text-text-2 hover:border-accent/50 hover:text-text-1',
              )}
            >
              {t === 'home' ? 'about' : t}
            </button>
          );
        })}
        <ShimmerButton
          type="button"
          className="workstation-access-btn ml-auto cursor-pointer px-2.5 py-1 text-[0.6rem] font-bold tracking-[0.06em] text-accent"
          borderRadius="6px"
          background="var(--bg-0)"
          shimmerDuration="2.6s"
          onClick={() => onOpenOS('home')}
          title="Expand full screen terminal"
        >
          ACCESS COMPUTER WORKSTATION
        </ShimmerButton>
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            initial={enter}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: reduced ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="px-4 py-3"
          >
            {active ? (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-accent">COMMAND WORKSTATION INTEL DOSSIER</div>
                    <h2 className="mt-0.5 font-display text-[1.1rem] font-semibold leading-tight text-text-1">{active.title}</h2>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onCycle(1)}
                      className="cursor-pointer rounded-chip bg-accent px-2.5 py-1 text-[0.64rem] font-bold text-bg-0 hover:brightness-110"
                    >
                      NEXT PROJECT →
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectProject(null)}
                      className="cursor-pointer rounded-chip border border-line-strong px-2 py-1 text-[0.64rem] text-text-2 hover:text-text-1"
                    >
                      CLOSE [ESC]
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {active.stack.map((s) => (
                    <span key={s} className="rounded-chip border border-screen/30 bg-screen/5 px-1.5 py-0.5 text-[0.62rem] text-screen">
                      {s}
                    </span>
                  ))}
                </div>

                <p className="text-[0.7rem] leading-snug text-text-2">{active.description[0]}</p>

                {activeFlow && <FlowDiagram flow={activeFlow} compact />}

                <div className="flex items-center justify-between">
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-chip border border-accent/40 px-2 py-1 text-[0.64rem] text-accent no-underline hover:bg-accent-soft"
                  >
                    GITHUB PROFILE ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => onSelectProject(null)}
                    className="cursor-pointer text-[0.64rem] text-text-2 hover:text-text-1"
                  >
                    ← RETURN TO OVERVIEW
                  </button>
                </div>
              </div>
            ) : tab === 'home' ? (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-start gap-4">
                  <img
                    src="/nightfall/images/profile/nishant_avatar.jpg"
                    alt={profile.name}
                    className="size-[104px] shrink-0 rounded-card border-2 border-accent object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <HyperText as="h1" className="font-display text-[1.6rem] font-bold uppercase leading-none text-text-1" duration={900}>
                      {profile.name}
                    </HyperText>
                    <div className="mt-1.5 h-4 text-[0.74rem] font-bold uppercase tracking-[0.06em] text-accent">
                      <WordRotate words={ROLES} duration={2200} />
                    </div>
                    <p className="mt-1 text-[0.72rem] italic text-ok">“{profile.tagline}”</p>
                    <p className="mt-1.5 text-[0.7rem] leading-snug text-text-2">{profile.summary}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ShimmerButton
                    type="button"
                    borderRadius="6px"
                    background="var(--accent)"
                    shimmerColor="#fff"
                    className="cursor-pointer px-3 py-1.5 text-[0.7rem] font-bold text-bg-0"
                    onClick={() => go('projects')}
                  >
                    EXPLORE PROJECTS →
                  </ShimmerButton>
                  <a
                    href={cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-ctl border border-accent px-3 py-1.5 text-[0.7rem] font-bold text-accent no-underline hover:bg-accent-soft"
                  >
                    VIEW CV (PDF) ↗
                  </a>
                </div>

                <div className="grid grid-cols-4 gap-2 border-t border-line-strong pt-2.5">
                  {stat(education.period,'B.Tech + M.Tech · IoT')}
                  {stat(companyCount, 'Companies')}
                  {stat(projects.length, 'Projects')}
                  {stat(achievements.filter((a) => /patent/i.test(a.title)).length, 'Patent app (not granted)')}
                </div>

                <Marquee className="[--duration:38s] [--gap:0.5rem] p-0" pauseOnHover repeat={2} aria-hidden>
                  {ALL_SKILLS.map((s) => (
                    <span key={s} className="rounded-chip border border-line-strong bg-bg-2 px-2 py-0.5 text-[0.62rem] text-text-2">
                      {s}
                    </span>
                  ))}
                </Marquee>
              </div>
            ) : tab === 'projects' ? (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-accent">02 // PROJECT ARCHIVES</div>
                  <div className="flex gap-1">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        className={cn(
                          'cursor-pointer rounded-chip border px-1.5 py-0.5 text-[0.6rem] font-bold',
                          category === c ? 'border-accent bg-accent text-bg-0' : 'border-line-strong text-text-2 hover:text-text-1',
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {visibleProjects.map((p) => (
                    <MagicCard key={p.slug} className="cursor-pointer rounded-card" gradientSize={160} gradientColor="rgba(232,162,58,0.16)">
                      <button
                        type="button"
                        onClick={() => {
                          sound.playAccessBeep();
                          onSelectProject(p.slug);
                        }}
                        className="block w-full cursor-pointer p-2.5 text-left"
                      >
                        <div className="text-[0.62rem] font-bold uppercase tracking-[0.08em] text-accent">{p.badge}</div>
                        <div className="my-1 font-display text-[0.82rem] font-semibold leading-tight text-text-1">{p.title}</div>
                        <div className="text-[0.62rem] leading-snug text-text-3">{p.stack.join(' · ')}</div>
                      </button>
                    </MagicCard>
                  ))}
                </div>
              </div>
            ) : tab === 'architecture' ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-screen">08 // SYSTEMS ARCHITECTURE SCHEMATICS</div>
                  <div className="flex gap-1">
                    {DESK_PROJECTS.map((d) => (
                      <button
                        key={d.slug}
                        type="button"
                        onClick={() => setFlowSlug(d.slug)}
                        aria-label={d.title}
                        className={cn(
                          'size-5 cursor-pointer rounded-chip border text-[0.6rem] font-bold',
                          flowSlug === d.slug ? 'border-screen bg-screen/20 text-screen' : 'border-line-strong text-text-2',
                        )}
                      >
                        {d.keyNum}
                      </button>
                    ))}
                  </div>
                </div>
                {getFlow(flowSlug) && <FlowDiagram key={flowSlug} flow={getFlow(flowSlug)!} compact />}
              </div>
            ) : (
              <div className="flex max-w-[520px] flex-col gap-2">
                <div className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-accent">07 // CONTACT</div>
                <a
                  href={`mailto:${profile.email}`}
                  className="rounded-ctl bg-accent px-3 py-2 text-center text-[0.78rem] font-bold text-bg-0 no-underline hover:brightness-110"
                >
                  ✉ {profile.email}
                </a>
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-ctl border border-line-strong bg-bg-1 px-3 py-1.5 text-[0.72rem] text-text-1 no-underline hover:border-accent/50"
                >
                  GitHub — github.com/jainnishant779 ↗
                </a>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-ctl border border-line-strong bg-bg-1 px-3 py-1.5 text-[0.72rem] text-text-1 no-underline hover:border-accent/50"
                >
                  LinkedIn — linkedin.com/in/nishujain02 ↗
                </a>
                <div className="text-[0.66rem] text-text-3">{profile.location}</div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
