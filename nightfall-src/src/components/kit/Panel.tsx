import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Frosted glass (HUD / floating surfaces) instead of the solid panel surface. */
  glass?: boolean;
}

/** Base surface: radius 16, hairline border, inner top highlight (via shadow-panel). */
export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, glass = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-card border border-line p-4 shadow-panel md:p-6',
        glass ? 'bg-glass backdrop-blur-[14px] backdrop-saturate-[1.2]' : 'bg-bg-1',
        className,
      )}
      {...props}
    />
  ),
);
Panel.displayName = 'Panel';
