import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { EASE_OUT } from '@/lib/motion';

export interface ImageRevealProps {
  src: string;
  alt: string;
  /** Always caption artwork honestly, e.g. "Illustrative artwork — not a product screenshot." */
  caption?: string;
  /** Tailwind aspect utility. */
  aspect?: string;
  className?: string;
}

/** Image that starts muted and comes alive on hover/focus. Falls back to a labelled block if the file is missing. */
export function ImageReveal({ src, alt, caption, aspect = 'aspect-[16/10]', className }: ImageRevealProps) {
  const [failed, setFailed] = useState(false);
  const reduce = useReducedMotion();

  return (
    <motion.figure
      initial="rest"
      whileHover="hover"
      whileFocus="hover"
      tabIndex={0}
      className={cn(
        'group relative overflow-hidden rounded-card border border-line bg-bg-1 outline-none focus-visible:outline-2 focus-visible:outline-accent',
        className,
      )}
    >
      <div className={cn('relative w-full', aspect)}>
        {failed ? (
          <div className="absolute inset-0 grid place-items-center font-mono text-[0.75rem] uppercase tracking-[0.14em] text-text-3">
            Image unavailable
          </div>
        ) : (
          <motion.img
            src={src}
            alt={alt}
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
            variants={{
              rest: { scale: 1, filter: 'saturate(0.7) brightness(0.85)' },
              hover: { scale: reduce ? 1 : 1.04, filter: 'saturate(1) brightness(1)' },
            }}
            transition={{ duration: reduce ? 0.2 : 0.42, ease: EASE_OUT }}
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-bg-0/80 via-transparent to-transparent" />
      </div>
      {caption && (
        <figcaption className="absolute inset-x-0 bottom-0 p-3 font-mono text-[0.75rem] text-text-2">{caption}</figcaption>
      )}
    </motion.figure>
  );
}
