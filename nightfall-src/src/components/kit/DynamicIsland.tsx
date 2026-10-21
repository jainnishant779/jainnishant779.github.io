import * as React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { SPRING_UI } from '@/lib/motion';

export interface DynamicIslandProps {
  /** Changing this key morphs the island to the new content. */
  stateKey: string;
  children: React.ReactNode;
  className?: string;
}

/** Pill that resizes and cross-fades between states (HUD hints, progress, toasts). Announced politely to screen readers. */
export function DynamicIsland({ stateKey, children, className }: DynamicIslandProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      layout
      transition={reduce ? { duration: 0 } : SPRING_UI}
      // borderRadius lives in style so layout animations don't distort the pill.
      style={{ borderRadius: 9999 }}
      className={cn(
        'inline-flex items-center overflow-hidden border border-line-strong bg-glass px-4 py-2 text-text-1 shadow-panel backdrop-blur-[14px]',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={stateKey}
          layout="position"
          initial={{ opacity: 0, filter: reduce ? 'blur(0px)' : 'blur(4px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: reduce ? 'blur(0px)' : 'blur(4px)' }}
          transition={{ duration: reduce ? 0.12 : 0.28 }}
          className="flex items-center gap-3 whitespace-nowrap"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
