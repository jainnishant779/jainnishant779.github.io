import * as React from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { cn } from '@/lib/utils';

const VARIANTS = {
  /** The ONE focal CTA per view. */
  primary: 'bg-accent text-bg-0 font-semibold shadow-focal hover:brightness-110',
  ghost: 'border border-line-strong bg-transparent text-text-1 hover:bg-bg-2',
} as const;

export interface MagneticButtonProps {
  variant?: keyof typeof VARIANTS;
  /** When set, renders an <a>; otherwise a <button>. */
  href?: string;
  target?: string;
  rel?: string;
  download?: string | boolean;
  type?: 'button' | 'submit';
  disabled?: boolean;
  title?: string;
  'aria-label'?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  /** Pull strength toward the pointer (0 disables). */
  strength?: number;
  className?: string;
  children: React.ReactNode;
}

/** CTA with a subtle magnetic pull. The pull is off for touch, pen and reduced motion. */
export function MagneticButton({
  variant = 'ghost',
  href,
  type = 'button',
  strength = 0.25,
  className,
  children,
  ...rest
}: MagneticButtonProps) {
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 300, damping: 20 });
  const y = useSpring(useMotionValue(0), { stiffness: 300, damping: 20 });

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce || strength === 0 || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const release = () => {
    x.set(0);
    y.set(0);
  };

  const classes = cn(
    'inline-flex min-h-11 select-none items-center justify-center gap-2 rounded-ctl px-5 py-2.5 font-mono text-[0.8125rem] uppercase tracking-[0.08em] no-underline transition-[background-color,filter] duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    className,
  );

  if (href) {
    return (
      <motion.a
        href={href}
        style={{ x, y }}
        onPointerMove={onPointerMove}
        onPointerLeave={release}
        className={classes}
        {...rest}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      style={{ x, y }}
      onPointerMove={onPointerMove}
      onPointerLeave={release}
      className={classes}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
