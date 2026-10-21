import { cn } from '@/lib/utils';
import { TextReveal } from './TextReveal';

export interface SectionHeaderProps {
  /** Small mono label above the title, e.g. "02 // PROJECTS". */
  label: string;
  title: string;
  description?: string;
  /** Heading level; the page's main title should be h1. */
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}

export function SectionHeader({ label, title, description, as: Heading = 'h2', className }: SectionHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-3', className)}>
      <span className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-accent">{label}</span>
      <Heading className="font-display text-[clamp(1.75rem,4vw,2.25rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-text-1">
        <TextReveal text={title} />
      </Heading>
      {description && <p className="max-w-[60ch] text-text-2">{description}</p>}
    </header>
  );
}
