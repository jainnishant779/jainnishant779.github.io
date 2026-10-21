import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { FlowDiagram } from '@/components/kit/FlowDiagram';
import { Badge } from '@/components/kit/Badge';
import { getFlow } from '@/content/diagrams';
import { sound } from '../../lib/sound';

const TABS: { slug: string; label: string }[] = [
  { slug: 'edgedesk', label: 'EdgeDesk' },
  { slug: 'crowd-analytics', label: 'Crowd Analytics' },
  { slug: 'poultry-health-ai', label: 'Poultry AI' },
  { slug: 'facial-attendance', label: 'Facial Attendance' },
  { slug: 'on-device-ai', label: 'On-Device AI' },
];

// EdgeDesk facts straight from the CV (no extra protocol or auth claims).
const EDGEDESK_FACTS: { title: string; value: string }[] = [
  { title: 'Encrypted Transport', value: 'TLS / WSS' },
  { title: 'Screen Access', value: 'VNC' },
  { title: 'File Transfer', value: 'Encrypted · drag-and-drop' },
  { title: 'Reboot-Safe', value: 'Linux services' },
];

export const Architecture: React.FC = () => {
  const [active, setActive] = useState(TABS[0].slug);
  const flow = getFlow(active);

  return (
    <div className="architecture-module-container flex flex-col gap-5 pb-8">
      <div className="os-module-header">
        <div className="os-module-title-group">
          <h2>08 // SYSTEMS LAB & TOPOLOGY</h2>
          <p>SIMPLIFIED ARCHITECTURE DIAGRAMS</p>
        </div>
        <div className="os-module-actions">
          <Badge tone="muted">BASED ON CV DESCRIPTIONS</Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-line-strong pb-3" role="tablist" aria-label="Project architectures">
        {TABS.map((tab) => {
          const on = active === tab.slug;
          return (
            <button
              key={tab.slug}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => {
                sound.playUiClick();
                setActive(tab.slug);
              }}
              className={cn(
                'min-h-11 cursor-pointer rounded-ctl border px-3.5 font-mono text-[0.78rem] font-bold transition-colors duration-[220ms]',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                on ? 'border-accent bg-accent text-bg-0' : 'border-line-strong bg-bg-2 text-text-2 hover:border-accent/40 hover:text-text-1',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <p className="text-[0.9rem] leading-relaxed text-text-2">
        Simplified diagrams built from each project&apos;s description. Select any block to read what it does.
      </p>

      <div className="rounded-card border border-line-strong bg-bg-1/80 p-4 shadow-panel sm:p-5">
        {flow && <FlowDiagram key={flow.slug} flow={flow} />}
      </div>

      {active === 'edgedesk' && (
        <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
          {EDGEDESK_FACTS.map((fact) => (
            <div key={fact.title} className="rounded-ctl border border-line-strong bg-bg-1 px-3 py-2.5 text-center">
              <div className="font-mono text-[0.76rem] font-bold text-accent">{fact.title}</div>
              <div className="mt-1 font-mono text-[0.72rem] text-text-2">{fact.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
