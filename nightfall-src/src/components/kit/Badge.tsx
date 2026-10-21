import * as React from 'react';
import { cn } from '@/lib/utils';

const TONES = {
  accent: 'border-accent/30 bg-accent-soft text-accent',
  ok: 'border-ok/30 bg-ok/10 text-ok',
  warn: 'border-warn/30 bg-warn/10 text-warn',
  screen: 'border-screen/30 bg-screen/10 text-screen',
  muted: 'border-line bg-bg-2 text-text-2',
} as const;

export type BadgeTone = keyof typeof TONES;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

/** Status pill. Use for project status / category. Text must come from src/content. */
export function Badge({ tone = 'muted', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-chip border px-2 py-0.5 font-mono text-[0.75rem] uppercase leading-none tracking-[0.14em]',
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
