import { createRef, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { AnimatedBeam } from '@/components/ui/animated-beam';
import type { Flow } from '@/content/diagrams';

export interface FlowDiagramProps {
  flow: Flow;
  /** Smaller type and padding, for the on-monitor screens. */
  compact?: boolean;
  className?: string;
}

/** Architecture flow: HTML nodes joined by animated beams. Click or focus a node to read what it does. */
export function FlowDiagram({ flow, compact = false, className }: FlowDiagramProps) {
  const [selected, setSelected] = useState(flow.nodes[0]?.id ?? '');
  const container = useRef<HTMLDivElement>(null);
  const refs = useMemo(() => Object.fromEntries(flow.nodes.map((n) => [n.id, createRef<HTMLButtonElement>()])), [flow]);
  const node = flow.nodes.find((n) => n.id === selected) ?? flow.nodes[0];

  return (
    <div className={cn('flex flex-col gap-3', className)} data-testid="flow-diagram">
      <div
        ref={container}
        className={cn('relative grid gap-x-3 gap-y-6', compact ? 'p-2' : 'p-4')}
        style={{ gridTemplateColumns: `repeat(${flow.cols}, minmax(0, 1fr))` }}
        role="group"
        aria-label={flow.title}
      >
        {flow.nodes.map((n) => {
          const active = n.id === selected;
          return (
            <button
              key={n.id}
              ref={refs[n.id]}
              type="button"
              onClick={() => setSelected(n.id)}
              onFocus={() => setSelected(n.id)}
              aria-pressed={active}
              style={{ gridColumn: `${n.col} / span ${n.span ?? 1}`, gridRow: n.row }}
              className={cn(
                'z-10 flex min-h-11 flex-col items-center justify-center rounded-ctl border text-center transition-colors duration-[220ms]',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                compact ? 'px-1.5 py-1' : 'px-3 py-2',
                active ? 'border-accent/60 bg-accent-soft text-text-1 shadow-focal' : 'border-line-strong bg-bg-2 text-text-2 hover:border-accent/40',
              )}
            >
              <span className={cn('font-display font-semibold leading-tight', compact ? 'text-[0.72rem]' : 'text-[0.85rem]')}>{n.label}</span>
              {n.sublabel && (
                <span className={cn('mt-0.5 font-mono leading-tight', compact ? 'text-[0.62rem]' : 'text-[0.72rem]', active ? 'text-accent' : 'text-ok')}>
                  {n.sublabel}
                </span>
              )}
            </button>
          );
        })}

        {flow.links.map((l, i) => {
          const from = flow.nodes.find((n) => n.id === l.from);
          const to = flow.nodes.find((n) => n.id === l.to);
          if (!from || !to) return null;
          const sameRow = from.row === to.row;
          return (
            <AnimatedBeam
              key={`${l.from}-${l.to}`}
              containerRef={container}
              fromRef={refs[l.from]}
              toRef={refs[l.to]}
              curvature={sameRow ? 0 : from.col === to.col ? 0 : -28}
              delay={i * 0.4}
              duration={3.2}
              pathWidth={2}
              pathOpacity={l.dashed ? 0.45 : 1}
            />
          );
        })}
      </div>

      {node && (
        <p
          className={cn('rounded-ctl border border-line bg-bg-0/60 px-3 py-2 text-text-2', compact ? 'text-[0.7rem] leading-snug' : 'text-sm leading-relaxed')}
          data-testid="flow-description"
        >
          <span className="font-mono uppercase tracking-[0.14em] text-accent">{node.label}</span> — {node.description}
        </p>
      )}
    </div>
  );
}
