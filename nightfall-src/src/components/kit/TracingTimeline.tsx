import * as React from 'react';
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { cn } from '@/lib/utils';

export interface TimelineItem {
  id: string;
  title: string;
  subtitle?: string;
  period?: string;
  bullets?: string[];
}

export interface TracingTimelineProps {
  items: TimelineItem[];
  /** Pass the scrollable panel's ref when the timeline lives inside one (e.g. the OS viewport). */
  scrollContainer?: React.RefObject<HTMLElement | null>;
  className?: string;
}

/** Vertical timeline whose accent line fills as you scroll. Reduced motion: line fully drawn. */
export function TracingTimeline({ items, scrollContainer, className }: TracingTimelineProps) {
  const ref = React.useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    container: scrollContainer,
    offset: ['start 80%', 'end 40%'],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <ol ref={ref} className={cn('relative ml-3 flex list-none flex-col gap-8 border-l border-line pl-8', className)}>
      <motion.span
        aria-hidden
        className="absolute top-0 -left-px h-full w-px origin-top bg-accent"
        style={{ scaleY: reduce ? 1 : scaleY }}
      />
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span
            aria-hidden
            className="absolute top-1.5 -left-[calc(2rem+6.5px)] size-3 rounded-full border border-accent bg-bg-0"
          />
          {item.period && (
            <div className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-accent">{item.period}</div>
          )}
          <h3 className="mt-1 font-display text-lg font-medium text-text-1">{item.title}</h3>
          {item.subtitle && <div className="text-sm text-text-2">{item.subtitle}</div>}
          {item.bullets && item.bullets.length > 0 && (
            <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-text-2 marker:text-text-3">
              {item.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}
