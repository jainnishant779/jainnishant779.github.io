import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type BootStage = 'off' | 'booting' | 'on';

/**
 * Powers a monitor on the first time it becomes visible: off -> booting (flicker) -> on.
 * It never powers down again, so scrolling back and forth does not replay the boot.
 */
export function useScreenBoot(visible: boolean, delayMs = 0, bootMs = 1500): BootStage {
  const [stage, setStage] = useState<BootStage>('off');
  const started = useRef(false);

  useEffect(() => {
    if (!visible || started.current) return;
    started.current = true;
    const t1 = window.setTimeout(() => setStage('booting'), delayMs);
    const t2 = window.setTimeout(() => setStage('on'), delayMs + bootMs);
    return () => {
      // StrictMode re-runs effects in dev: allow the next run to restart the timers.
      started.current = false;
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [visible, delayMs, bootMs]);

  return stage;
}

export interface ScreenFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Design size in CSS px; the CSS matrix3d warp maps this rectangle onto the monitor. */
  width: number;
  height: number;
  transform: string;
  stage: BootStage;
  tone?: 'main' | 'side';
  children: React.ReactNode;
}

/** A powered monitor: dark glass, coloured rim glow, scanlines, vignette, reflection, power-on flicker. */
export function ScreenFrame({ width, height, transform, stage, tone = 'side', className, children, ...rest }: ScreenFrameProps) {
  return (
    <div
      className={cn(
        'absolute top-0 left-0 flex origin-top-left flex-col overflow-hidden bg-screen-bg font-mono text-text-1',
        tone === 'main'
          ? 'screen-rim-main rounded-[5px] border-2 border-accent/55'
          : 'screen-rim-side rounded-[4px] border-[1.5px] border-screen/45',
        stage === 'booting' && 'screen-power-on',
        className,
      )}
      style={{ width, height, transform }}
      {...rest}
    >
      {stage === 'off' ? <div className="h-full w-full bg-screen-bg" aria-hidden /> : children}
      <div className="screen-scanlines pointer-events-none absolute inset-0 z-50" aria-hidden />
      <div className="screen-vignette pointer-events-none absolute inset-0 z-50" aria-hidden />
      <div className="screen-glass pointer-events-none absolute inset-0 z-50" aria-hidden />
    </div>
  );
}
