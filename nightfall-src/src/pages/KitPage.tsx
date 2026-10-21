import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { profile } from '@/content/profile';
import { projects } from '@/content/projects';
import { experiences } from '@/content/experience';
import { getCVUrl } from '@/lib/assets';
import { Panel } from '@/components/kit/Panel';
import { Badge, type BadgeTone } from '@/components/kit/Badge';
import { Kbd } from '@/components/kit/Kbd';
import { SectionHeader } from '@/components/kit/SectionHeader';
import { MagneticButton } from '@/components/kit/MagneticButton';
import { DynamicIsland } from '@/components/kit/DynamicIsland';
import { ImageReveal } from '@/components/kit/ImageReveal';
import { CursorRing } from '@/components/kit/CursorRing';
import { TracingTimeline } from '@/components/kit/TracingTimeline';
import { HyperText } from '@/components/ui/hyper-text';
import { WordRotate } from '@/components/ui/word-rotate';
import { BlurFade } from '@/components/ui/blur-fade';
import { MagicCard } from '@/components/ui/magic-card';
import { BorderBeam } from '@/components/ui/border-beam';
import { AnimatedBeam } from '@/components/ui/animated-beam';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

const ISLAND_STATES = ['Scroll to enter ↓', 'Gate · 12%', 'Access system ⏎'];
const BADGE_TONES: BadgeTone[] = ['accent', 'ok', 'warn', 'screen', 'muted'];
const ROLES = profile.title.split(' · ').slice(1);

/**
 * Living style guide for the Nightfall design system (unlisted route: /kit).
 * Reference: .claude/skills/nightfall-ui/SKILL.md. Every string comes from src/content or is a UI label.
 */
export function KitPage() {
  const cvUrl = getCVUrl();
  const [islandIndex, setIslandIndex] = useState(0);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const beamContainer = useRef<HTMLDivElement>(null);
  const beamA = useRef<HTMLDivElement>(null);
  const beamB = useRef<HTMLDivElement>(null);
  const beamC = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const firstProject = projects[0];

  return (
    <TooltipProvider>
      <CursorRing />
      <div className="min-h-screen bg-bg-0 text-text-1">
        <main className="mx-auto flex max-w-[1200px] flex-col gap-16 px-4 py-10 md:px-8 md:py-16">
          <SectionHeader
            as="h1"
            label="DESIGN SYSTEM // UNLISTED"
            title="Nightfall UI kit"
            description="Living reference for the components used across the HUD, the on-monitor screens and the OS."
          />

          {/* Surfaces, badges, kbd */}
          <section aria-labelledby="kit-surfaces" className="flex flex-col gap-6">
            <h2 id="kit-surfaces" className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-text-3">
              Panel · Badge · Kbd
            </h2>
            <Panel data-testid="kit-panel" className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {projects.slice(0, BADGE_TONES.length).map((p, i) => (
                  <Badge key={p.slug} tone={BADGE_TONES[i]}>
                    {p.badge}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-text-2">
                <span>Shortcuts:</span>
                <Kbd>1–8</Kbd>
                <Kbd>Esc</Kbd>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span data-testid="kit-tooltip-trigger" tabIndex={0} className="inline-flex">
                      <Kbd>Ctrl K</Kbd>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Open the command palette</TooltipContent>
                </Tooltip>
              </div>
            </Panel>
            <Panel glass>Glass surface — used for HUD elements floating over the film.</Panel>
          </section>

          {/* Buttons + island */}
          <section aria-labelledby="kit-buttons" className="flex flex-col gap-6">
            <h2 id="kit-buttons" className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-text-3">
              MagneticButton · DynamicIsland
            </h2>
            <div className="flex flex-wrap gap-3">
              <MagneticButton variant="primary">View projects</MagneticButton>
              <MagneticButton href={cvUrl} target="_blank" rel="noopener noreferrer">
                Download CV
              </MagneticButton>
              <MagneticButton onClick={() => setPaletteOpen(true)} data-testid="kit-open-palette">
                <Search className="size-4" aria-hidden /> Command palette <Kbd>Ctrl K</Kbd>
              </MagneticButton>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <DynamicIsland stateKey={ISLAND_STATES[islandIndex]}>
                <span data-testid="kit-island-text" className="font-mono text-[0.8125rem] uppercase tracking-[0.08em]">
                  {ISLAND_STATES[islandIndex]}
                </span>
              </DynamicIsland>
              <MagneticButton
                data-testid="kit-island-next"
                onClick={() => setIslandIndex((i) => (i + 1) % ISLAND_STATES.length)}
              >
                Next state
              </MagneticButton>
            </div>
          </section>

          {/* Text effects */}
          <section aria-labelledby="kit-text" className="flex flex-col gap-4">
            <h2 id="kit-text" className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-text-3">
              HyperText · WordRotate · BlurFade
            </h2>
            <HyperText as="h3" className="font-display text-4xl text-text-1" startOnView>
              NIGHTFALL
            </HyperText>
            <div className="flex items-baseline gap-3 font-display text-2xl">
              <span className="text-text-2">{profile.name} —</span>
              <span data-testid="kit-word-rotate" className="text-accent">
                <WordRotate words={ROLES} />
              </span>
            </div>
            <BlurFade inView>
              <Panel>{profile.tagline}</Panel>
            </BlurFade>
          </section>

          {/* Cards */}
          <section aria-labelledby="kit-cards" className="flex flex-col gap-6">
            <h2 id="kit-cards" className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-text-3">
              MagicCard · BorderBeam · ImageReveal
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <MagicCard className="rounded-card">
                <div className="flex flex-col gap-3 p-6">
                  <Badge tone="accent">{firstProject.badge}</Badge>
                  <h3 className="font-display text-lg font-medium">{firstProject.title}</h3>
                  <p className="text-sm text-text-2">{firstProject.description[0]}</p>
                </div>
              </MagicCard>
              <Panel className="relative overflow-hidden" data-testid="kit-border-beam-card">
                <h3 className="font-display text-lg font-medium">One highlighted card</h3>
                <p className="mt-2 text-sm text-text-2">
                  BorderBeam is used on exactly one card per view, e.g. the Sustainathon 2025 win.
                </p>
                <BorderBeam size={120} duration={8} />
              </Panel>
            </div>
            {firstProject.image && (
              <ImageReveal
                src={firstProject.image}
                alt={firstProject.title}
                caption={firstProject.imageCaption}
                className="max-w-xl"
              />
            )}
          </section>

          {/* Beam diagram */}
          <section aria-labelledby="kit-beam" className="flex flex-col gap-6">
            <h2 id="kit-beam" className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-text-3">
              AnimatedBeam
            </h2>
            <div ref={beamContainer} className="relative flex items-center justify-between gap-4 overflow-hidden rounded-card border border-line bg-bg-1 p-8">
              <div ref={beamA} className="z-10 rounded-ctl border border-line-strong bg-bg-2 px-3 py-2 font-mono text-[0.75rem]">
                Jetson Nano
              </div>
              <div ref={beamB} className="z-10 rounded-ctl border border-line-strong bg-bg-2 px-3 py-2 font-mono text-[0.75rem]">
                WS Broker
              </div>
              <div ref={beamC} className="z-10 rounded-ctl border border-line-strong bg-bg-2 px-3 py-2 font-mono text-[0.75rem]">
                Dashboard
              </div>
              <AnimatedBeam containerRef={beamContainer} fromRef={beamA} toRef={beamB} />
              <AnimatedBeam containerRef={beamContainer} fromRef={beamB} toRef={beamC} delay={1} />
            </div>
          </section>

          {/* Tabs */}
          <section aria-labelledby="kit-tabs" className="flex flex-col gap-6">
            <h2 id="kit-tabs" className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-text-3">
              Tabs
            </h2>
            <Tabs defaultValue="overview" data-testid="kit-tabs">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="architecture">Architecture</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="text-text-2">
                {firstProject.description[0]}
              </TabsContent>
              <TabsContent value="architecture" className="text-text-2">
                Simplified diagram built from the project description.
              </TabsContent>
            </Tabs>
          </section>

          {/* Timeline */}
          <section aria-labelledby="kit-timeline" className="flex flex-col gap-6">
            <h2 id="kit-timeline" className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-text-3">
              TracingTimeline
            </h2>
            <TracingTimeline
              items={experiences.map((e) => ({
                id: `${e.company}-${e.period}`,
                title: e.role,
                subtitle: `${e.company} — ${e.location}`,
                period: e.period,
                bullets: e.bullets,
              }))}
            />
          </section>
        </main>
      </div>

      <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen} title="Command palette" description="Jump to a project or open a link">
        <CommandInput placeholder="Search projects and links…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Projects">
            {projects.map((p) => (
              <CommandItem key={p.slug} value={p.title} onSelect={() => setPaletteOpen(false)}>
                {p.title}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Links">
            <CommandItem value="Download CV" onSelect={() => window.open(cvUrl, '_blank', 'noopener')}>
              Download CV
            </CommandItem>
            <CommandItem value="GitHub" onSelect={() => window.open(profile.github, '_blank', 'noopener')}>
              GitHub
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </TooltipProvider>
  );
}
