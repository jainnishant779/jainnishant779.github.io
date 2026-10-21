import { useState } from 'react';
import { FileText, Github, Linkedin, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sound } from '@/lib/sound';
import { getCVUrl } from '@/lib/assets';
import { profile } from '@/content/profile';
import { experiences } from '@/content/experience';
import { achievements, certifications } from '@/content/achievements';
import { Dock, DockIcon } from '@/components/ui/dock';
import { ShineBorder } from '@/components/ui/shine-border';
import { DESK_PROJECTS } from './deskProjects';

type Tab = 'quick' | 'experience' | 'honors';
const TABS: Tab[] = ['quick', 'experience', 'honors'];

export interface ChannelsScreenProps {
  activeSlug: string | null;
  onSelectProject: (slug: string) => void;
}

/** The right monitor (see the padding note on the header): direct links as a magnifying dock, the project files, the experience timeline and honours. */
export function ChannelsScreen({ activeSlug, onSelectProject }: ChannelsScreenProps) {
  const [tab, setTab] = useState<Tab>('quick');
  const cvUrl = getCVUrl();

  const links = [
    { label: 'CV (PDF)', href: cvUrl, Icon: FileText, external: true },
    { label: 'GitHub', href: profile.github, Icon: Github, external: true },
    { label: 'LinkedIn', href: profile.linkedin, Icon: Linkedin, external: true },
    { label: 'Email', href: `mailto:${profile.email}`, Icon: Mail, external: false },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col" data-testid="channels-screen">
      {/* Right padding is larger than the left: on 16:10 viewports the film crop trims the right edge of this monitor. */}
      <div className="flex items-center justify-between gap-2 border-b border-line-strong bg-bg-1/60 py-1.5 pr-7 pl-2.5">
        <span className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-screen">● MON-03 // CHANNELS</span>
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                sound.playUiClick();
                setTab(t);
              }}
              className={cn(
                'cursor-pointer rounded-chip border px-1.5 py-0.5 text-[0.58rem] font-bold uppercase',
                tab === t ? 'border-screen bg-screen/15 text-screen' : 'border-line-strong text-text-3 hover:text-text-2',
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto py-2.5 pr-7 pl-3">
        {tab === 'quick' && (
          <>
            <div className="text-[0.6rem] uppercase tracking-[0.14em] text-text-3">Direct access channels</div>
            <Dock className="mt-0 h-[54px] border-line-strong bg-bg-1/70 backdrop-blur-none" iconSize={34} iconMagnification={48} iconDistance={90}>
              {links.map(({ label, href, Icon, external }) => (
                <DockIcon key={label} className="bg-bg-2">
                  <a
                    href={href}
                    aria-label={label}
                    title={label}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="flex size-full items-center justify-center text-text-1 hover:text-accent"
                  >
                    <Icon className="size-1/2" aria-hidden />
                  </a>
                </DockIcon>
              ))}
            </Dock>
            <div className="-mt-0.5 flex justify-center gap-3 text-[0.58rem] uppercase tracking-[0.1em] text-text-3">
              {links.map((l) => (
                <span key={l.label}>{l.label}</span>
              ))}
            </div>

            <div className="mt-1 border-t border-line pt-2">
              <div className="mb-1 text-[0.6rem] uppercase tracking-[0.14em] text-text-3">Click to load into the centre screen</div>
              <div className="flex flex-col gap-1">
                {DESK_PROJECTS.slice(0, 4).map((d) => (
                  <button
                    key={d.slug}
                    type="button"
                    onClick={() => onSelectProject(d.slug)}
                    className={cn(
                      'flex cursor-pointer items-center justify-between rounded-chip border px-2 py-1 text-left text-[0.64rem] transition-colors duration-[120ms]',
                      activeSlug === d.slug ? 'border-screen bg-screen/15 text-screen' : 'border-line-strong text-text-1 hover:border-screen/50',
                    )}
                  >
                    <span>
                      FILE 0{d.keyNum} // {d.shortTitle}
                    </span>
                    <span className="text-accent">LOAD ↵</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === 'experience' && (
          <div className="flex flex-col gap-2.5">
            {experiences.map((exp) => (
              <div key={`${exp.company}-${exp.period}`} className="border-l-2 border-screen/70 pl-2.5">
                <div className="text-[0.7rem] font-bold text-text-1">{exp.role}</div>
                <div className="text-[0.64rem] text-accent">
                  {exp.company} // {exp.period}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'honors' && (
          <div className="flex flex-col gap-1.5">
            <div className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-screen">Honors &amp; awards</div>
            {achievements.map((a, i) => (
              <div key={a.title} className="relative rounded-ctl border border-line-strong bg-bg-1 px-2.5 py-1.5">
                {i === 0 && <ShineBorder shineColor={['#e8a23a', '#8fdcff']} borderWidth={1} duration={10} />}
                <div className="text-[0.68rem] font-bold text-accent">{a.title}</div>
                {a.detail && <div className="text-[0.62rem] text-text-2">{a.detail}</div>}
              </div>
            ))}
            <div className="mt-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-screen">Credentials</div>
            {certifications.map((c) => (
              <div key={c.title} className="rounded-ctl border border-line-strong bg-bg-1 px-2.5 py-1.5">
                <div className="text-[0.68rem] font-bold text-text-1">{c.title}</div>
                <div className="text-[0.62rem] text-ok">{c.issuer}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
