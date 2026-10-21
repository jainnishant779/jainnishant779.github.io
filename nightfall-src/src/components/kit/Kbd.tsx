import * as React from 'react';
import { cn } from '@/lib/utils';

/** Keyboard hint, e.g. <Kbd>Esc</Kbd>. */
export function Kbd({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        'inline-flex min-w-6 items-center justify-center rounded-chip border border-line-strong bg-bg-2 px-1.5 py-0.5 font-mono text-[0.75rem] leading-none text-text-2 shadow-[inset_0_-1px_0_rgba(255,255,255,0.06)]',
        className,
      )}
      {...props}
    />
  );
}
